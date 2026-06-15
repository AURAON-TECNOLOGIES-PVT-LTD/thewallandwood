import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret',
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
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
