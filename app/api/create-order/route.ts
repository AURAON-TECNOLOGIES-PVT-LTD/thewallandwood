import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
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
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order', 
        details: error?.message || error || 'Unknown error',
        description: error?.description || error?.error?.description || null
      },
      { status: 500 }
    );
  }
}