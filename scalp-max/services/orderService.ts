import { supabase } from '@/lib/supabaseClient';

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  quantity: number;
  total: number;
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export const saveOrder = async (orderData: OrderData) => {
  // Save order — column names match the Supabase schema
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      // Combine full address into one field
      address: `${orderData.address}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}`,
      city: orderData.city,
      pincode: orderData.pincode,
      total: orderData.total,
      status: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
      // Schema uses stripe_payment_id column (reused for Razorpay ID)
      stripe_payment_id: orderData.razorpayPaymentId || null,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error saving order:', orderError);
    return null;
  }

  // Save order item — product_id is nullable so null is fine
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      product_id: null,
      quantity: orderData.quantity,
      price: orderData.total / orderData.quantity,
    });

  if (itemError) {
    console.error('Error saving order item:', itemError);
  }

  return order;
};

