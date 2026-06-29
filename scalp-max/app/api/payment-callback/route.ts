import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOrder } from '@/services/orderService';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Determine the site base URL for redirects
function getBaseUrl(req: NextRequest): string {
  // Use env var if set (recommended for production)
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  // Fall back to the request's origin header
  const host = req.headers.get('host') || 'scalpmax.in';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

/**
 * POST /api/payment-callback
 *
 * Razorpay calls this URL after any UPI / redirect-based payment completes
 * (success or failure). It sends form-encoded data including:
 *   - razorpay_payment_id
 *   - razorpay_order_id
 *   - razorpay_signature   (HMAC-SHA256 of orderId|paymentId)
 *
 * On success  → verify HMAC → fetch order notes → save to Supabase → redirect to /order-success?oid=<id>
 * On failure  → redirect to /checkout?error=payment_failed
 *
 * Because this is a server-to-server POST + redirect, it works even when the
 * mobile browser tab was killed during the PhonePe / GPay app switch.
 */
export async function POST(req: NextRequest) {
  const base = getBaseUrl(req);

  try {
    // Parse application/x-www-form-urlencoded body sent by Razorpay
    const text = await req.text();
    const params = new URLSearchParams(text);

    const paymentId = params.get('razorpay_payment_id');
    const orderId   = params.get('razorpay_order_id');
    const signature = params.get('razorpay_signature');

    // ── Payment failed path ─────────────────────────────────────────────────
    if (!paymentId || !orderId || !signature) {
      console.error('Payment callback: missing params', { paymentId, orderId });
      return NextResponse.redirect(`${base}/checkout?error=payment_failed`);
    }

    // ── Verify HMAC-SHA256 signature ────────────────────────────────────────
    // Razorpay spec: HMAC of "<order_id>|<payment_id>" using key_secret
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSig !== signature) {
      console.error('Payment callback: signature mismatch', { orderId, paymentId });
      return NextResponse.redirect(`${base}/checkout?error=signature_invalid`);
    }

    // ── Fetch Razorpay order to read customer notes ─────────────────────────
    const rzpOrder = await razorpay.orders.fetch(orderId);
    const notes = (rzpOrder.notes || {}) as Record<string, string>;

    // ── Save order to Supabase ───────────────────────────────────────────────
    const order = await saveOrder({
      customerName:  notes.customer_name  || 'Unknown',
      customerEmail: notes.customer_email || '',
      customerPhone: notes.customer_phone || '',
      address:       notes.address        || '',
      city:          notes.city           || '',
      state:         notes.state          || '',
      pincode:       notes.pincode        || '',
      quantity:      Number(notes.quantity) || 1,
      total:         Number(notes.total)    || 0,
      paymentMethod: 'razorpay',
      razorpayPaymentId: paymentId,
      razorpayOrderId:   orderId,
    });

    if (!order) {
      console.error('Payment callback: failed to save order for orderId', orderId);
      // Still redirect to checkout with a friendly error rather than crash
      return NextResponse.redirect(`${base}/checkout?error=order_save_failed`);
    }

    // ── Fire-and-forget: Shiprocket sync ────────────────────────────────────
    fetch(`${base}/api/shiprocket/sync-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    }).catch((err) => console.error('Shiprocket sync error (callback):', err));

    // ── Redirect user to order-success with Supabase order ID ───────────────
    // The order-success page uses `?oid=` to fetch the order when localStorage
    // is empty (which happens when the browser tab was killed during UPI switch).
    return NextResponse.redirect(`${base}/order-success?oid=${order.id}`);

  } catch (err) {
    console.error('Payment callback unexpected error:', err);
    return NextResponse.redirect(`${base}/checkout?error=payment_failed`);
  }
}
