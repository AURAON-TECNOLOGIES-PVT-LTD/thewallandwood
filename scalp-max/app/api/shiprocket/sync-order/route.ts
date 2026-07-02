import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch the order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Error fetching order for Shiprocket sync:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check configuration and trim any accidental leading/trailing spaces
    const email = process.env.SHIPROCKET_API_EMAIL?.trim();
    const password = process.env.SHIPROCKET_API_PASSWORD?.trim();
    const channelId = process.env.SHIPROCKET_CHANNEL_ID?.trim() || "";

    if (!email || !password) {
      console.error('Shiprocket credentials missing from environment.');
      return NextResponse.json({ error: 'Shiprocket config missing' }, { status: 500 });
    }

    // 2. Login to Shiprocket to get JWT token
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();
    if (!authRes.ok || !authData.token) {
      console.error('Shiprocket auth failed:', authData);
      return NextResponse.json({ error: 'Shiprocket authentication failed', details: authData }, { status: 500 });
    }

    const token = authData.token;

    // 3. Prepare payload for Shiprocket
    const nameParts = (order.customer_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '.';

    // Find state from combined address or fallback
    const INDIAN_STATES = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
    ];
    const stateName = INDIAN_STATES.find(s => order.address?.toLowerCase().includes(s.toLowerCase())) || "Delhi";

    // Format order date in Indian Standard Time (Asia/Kolkata) to YYYY-MM-DD HH:MM
    const dateObj = new Date(order.created_at || Date.now());
    const istDateStr = dateObj.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    // Format returned is MM/DD/YYYY, HH:MM
    const [datePart, timePart] = istDateStr.split(', ');
    const [month, day, year] = datePart.split('/');
    const orderDateStr = `${year}-${month}-${day} ${timePart}`;

    // Dynamically determine payment method (Prepaid vs COD)
    const isPrepaid = order.stripe_payment_id !== null || order.status === 'paid';
    const paymentMethod = isPrepaid ? "Prepaid" : "COD";

    const payload = {
      order_id: `SM-${order.id.slice(-8).toUpperCase()}`,
      order_date: orderDateStr,
      pickup_location: "Home",
      channel_id: channelId,
      comment: "ScalpMax Order",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: (order.address || '').substring(0, 100),
      billing_address_2: "",
      billing_city: order.city || "New Delhi",
      billing_pincode: order.pincode,
      billing_state: stateName,
      billing_country: "India",
      billing_email: order.customer_email,
      billing_phone: order.customer_phone,
      shipping_is_billing: true,
      order_items: [
        {
          name: "SCALP MAX™ 12-Day Scalp Therapy System",
          sku: "SM-1",
          units: order.order_items?.[0]?.quantity || 1,
          selling_price: order.order_items?.[0]?.price || order.total,
        }
      ],
      payment_method: paymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.total,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    console.log("Sending payload to Shiprocket:", JSON.stringify(payload));

    // 4. Create adhoc order on Shiprocket
    const orderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const orderDataResponse = await orderRes.json();
    console.log("Shiprocket Response:", JSON.stringify(orderDataResponse));

    if (!orderRes.ok) {
      console.error("Shiprocket API Error:", orderDataResponse);
      return NextResponse.json({ error: 'Failed to create Shiprocket order', details: orderDataResponse }, { status: orderRes.status });
    }

    return NextResponse.json({ success: true, shiprocketResponse: orderDataResponse });

  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    console.error('Internal Error pushing to Shiprocket:', err);
    return NextResponse.json({ error: 'Internal server error', details: errorObj?.message || String(err) }, { status: 500 });
  }
}
