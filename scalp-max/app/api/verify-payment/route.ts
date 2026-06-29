import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
  try {
    const { razorpayOrderId } = await req.json();

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Missing razorpayOrderId' }, { status: 400 });
    }

    // Fetch all payments for this Razorpay order
    const payments = await razorpay.orders.fetchPayments(razorpayOrderId);

    // Check if any payment is in "captured" state (= successfully paid)
    const capturedPayment = (payments.items as Array<{ status: string; id: string }>)
      .find((p) => p.status === 'captured');

    if (capturedPayment) {
      return NextResponse.json({ paid: true, paymentId: capturedPayment.id });
    }

    return NextResponse.json({ paid: false });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: err?.message || String(error) },
      { status: 500 }
    );
  }
}
