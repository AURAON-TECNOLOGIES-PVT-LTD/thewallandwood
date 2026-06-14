const payload = {
  data: {
    access_token: "79e0c7eba5f8d8f67ec6d2fa0f2b601d",
    secret_key: "659f35af974a7b0931ae8fcbe46a49cf",
    pickup_address_id: "118673",
    s_type: "surface",
    shipments: [
      {
        waybill: "",
        order: `SM-${Date.now()}`,
        sub_order: "A",
        order_date: "10-06-2026",
        total_amount: 2999,
        name: "Test User",
        company_name: "",
        add: "Test Address",
        add2: "",
        add3: "",
        pin: "500018",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        phone: "9121757052",
        alt_phone: "",
        email: "test@gmail.com",
        is_billing_same_as_shipping: "yes",
        billing_name: "Test User",
        billing_company_name: "",
        billing_add: "Test Address",
        billing_add2: "",
        billing_add3: "",
        billing_pin: "500018",
        billing_city: "Hyderabad",
        billing_state: "Telangana",
        billing_country: "India",
        billing_phone: "9121757052",
        billing_alt_phone: "",
        billing_email: "test@gmail.com",
        products: [
          {
            product_name: "SCALP MAX",
            product_sku: "SM-1",
            product_quantity: 1,
            product_price: 2999,
            product_tax_rate: 0,
            product_hsn_code: "0000",
            product_discount: 0
          }
        ],
        shipment_length: 10,
        shipment_width: 10,
        shipment_height: 10,
        weight: 0.5,
        payment_mode: "Prepaid",
        return_pin: "",
        return_city: "",
        return_state: "",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        cod_charges: 0,
        advance_amount: 0,
        cod_amount: 0,
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
    ]
  }
};

fetch('https://my.ithinklogistics.com/api_v3/order/sync.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
