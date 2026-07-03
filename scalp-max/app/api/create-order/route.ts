import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret',
});

export async function POST(req: Request) {
  try {
    const { amount, orderData } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      // Store customer + order data in notes so the server-side
      // payment-callback can reconstruct and save the order without
      // needing localStorage (critical for mobile UPI redirect flow).
      notes: orderData ? {
        customer_name: orderData.customerName || '',
        customer_email: orderData.customerEmail || '',
        customer_phone: orderData.customerPhone || '',
        address: orderData.address || '',
        city: orderData.city || '',
        state: orderData.state || '',
        pincode: orderData.pincode || '',
        quantity: String(orderData.quantity || 1),
        total: String(amount),
        item_name: orderData.itemName || 'SCALP MAX KIT',
        item_sub: orderData.itemSub || '12-Day ScalpMax Kit',
      } : {},
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error: unknown) {
    const err = error as { message?: string; description?: string; error?: { description?: string } };
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order', 
        details: err?.message || String(error) || 'Unknown error',
        description: err?.description || err?.error?.description || null
      },
      { status: 500 }
    );
  }
}

