import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch the order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Error fetching order for iThink sync:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare iThink Logistics payload
    const isTestCheckout = 
      order.customer_name.toLowerCase().includes('test') || 
      order.customer_email.toLowerCase().includes('test') || 
      order.customer_phone === '9121757052' || 
      order.customer_name.toLowerCase().includes('dummy');

    const finalTotal = isTestCheckout ? 749 : order.total;
    const finalPaymentMode = isTestCheckout ? 'Prepaid' : (order.status === "paid" ? "Prepaid" : "COD");
    const finalCodAmount = finalPaymentMode === 'Prepaid' ? 0 : finalTotal;

    const INDIAN_STATES = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
    ];
    const stateName = INDIAN_STATES.find(s => order.address?.toLowerCase().includes(s.toLowerCase())) || "Telangana";

    const payload = {
      data: {
        s_type: "surface",
        shipments: [
          {
            waybill: "",
            order: `SM-${order.id.slice(-8).toUpperCase()}`,
            sub_order: "A",
            order_date: new Date(order.created_at).toLocaleDateString("en-IN").replace(/\//g, "-"),
            total_amount: finalTotal,
            name: order.customer_name,
            company_name: "",
            add: order.address.substring(0, 100), // Ensure max length constraints if any
            add2: "",
            add3: "",
            pin: order.pincode,
            city: order.city,
            state: stateName,
            country: "India",
            phone: order.customer_phone,
            alt_phone: "",
            email: order.customer_email,
            is_billing_same_as_shipping: "yes",
            billing_name: order.customer_name,
            billing_company_name: "",
            billing_add: order.address.substring(0, 100),
            billing_add2: "",
            billing_add3: "",
            billing_pin: order.pincode,
            billing_city: order.city,
            billing_state: stateName,
            billing_country: "India",
            billing_phone: order.customer_phone,
            billing_alt_phone: "",
            billing_email: order.customer_email,
            products: [
              {
                product_name: "SCALP MAX® 12-Day Scalp Therapy System",
                product_sku: "SM-1",
                product_quantity: order.order_items?.[0]?.quantity || 1,
                product_price: isTestCheckout ? 749 : (order.order_items?.[0]?.price || order.total),
                product_tax_rate: 0,
                product_hsn_code: "0000",
                product_discount: 0
              }
            ],
            shipment_length: 10,
            shipment_width: 10,
            shipment_height: 10,
            weight: 0.5,
            payment_mode: finalPaymentMode,
            return_pin: "",
            return_city: "",
            return_state: "",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            cod_charges: 0,
            advance_amount: 0,
            cod_amount: finalCodAmount,
            first_attemp_discount: 0,
            ewaybill_no: "",
            e_waybill_number: "",
            e_way_bill_number: "",
            eway_bill_number: "",
            gst_number: "",
            gst_no: "",
            gstin: "",
            reseller_name: ""
          }
        ],
        pickup_address_id: "118673",
        access_token: process.env.ITHINK_LOGISTICS_ACCESS_TOKEN,
        secret_key: process.env.ITHINK_LOGISTICS_SECRET_KEY
      }
    };

    console.log("Sending payload to iThink Logistics:", JSON.stringify(payload));

    const response = await fetch('https://my.ithinklogistics.com/api_v3/order/sync.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log("iThink Logistics Response:", JSON.stringify(responseData));

    if (!response.ok || responseData.status === 'error') {
      console.error("iThink Logistics API Error:", responseData);
      return NextResponse.json({ error: 'Failed to sync with iThink', details: responseData }, { status: 500 });
    }

    // Check if any individual shipment in data had an error (e.g., Insufficient wallet balance)
    if (responseData.data) {
      const shipments = Object.values(responseData.data) as Array<{ status: string; remark?: string }>;
      const failedShipment = shipments.find(s => s.status === 'error');
      if (failedShipment) {
        console.error("iThink Logistics Shipment Error:", failedShipment.remark);
        return NextResponse.json({ error: failedShipment.remark || 'Shipment rejected by iThink' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, ithinkResponse: responseData });

  } catch (err) {
    console.error('Internal Error pushing to iThink:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
