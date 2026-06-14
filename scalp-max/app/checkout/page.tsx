'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './checkout.module.css';
import { saveOrder } from '@/services/orderService';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  paymentMethod: 'razorpay' | 'cod' | '';
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartTotal, setCartTotal] = useState(749);
  const [cartQty, setCartQty] = useState(1);
  const [itemName, setItemName] = useState('SCALP MAX®');
  const [itemSub, setItemSub] = useState('12-Day Scalp Therapy System');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'razorpay',
  });

  useEffect(() => {
    let stored = localStorage.getItem('scalp_max_cart');
    if (!stored) {
      const defaultCart = {
        quantity: 1,
        price: 749,
        total: 749,
        name: 'SCALP MAX KIT',
        sub: '12-Day Scalp Therapy System',
        features: [
          '12 Therapy Bottles (C1–C6 + T1–T6)',
          'Day-by-Day Usage Guide',
          'Premium Gift Box Packaging',
          '9 Clinical Active Ingredients'
        ]
      };
      localStorage.setItem('scalp_max_cart', JSON.stringify(defaultCart));
      window.dispatchEvent(new Event('cartUpdated'));
      stored = JSON.stringify(defaultCart);
    }
    const cart = JSON.parse(stored);
    setTimeout(() => {
      setCartTotal(cart.total || 749);
      setCartQty(cart.quantity || 1);
      setItemName(cart.name || 'SCALP MAX KIT');
      setItemSub(cart.sub || '12-Day Scalp Therapy System');
    }, 0);
  }, []);

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = el.querySelector('input, select') as HTMLInputElement | HTMLSelectElement | null;
      if (firstInput) {
        setTimeout(() => firstInput.focus({ preventScroll: true }), 500);
      }
    }
  };

  const validate = (newErrors: Partial<Record<keyof FormData, string>>): boolean => {
    if (!form.firstName.trim()) newErrors.firstName = 'Required';
    if (!form.lastName.trim()) newErrors.lastName = 'Required';
    if (!form.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Enter valid 10-digit Indian mobile number';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Enter valid email';
    if (!form.address1.trim()) newErrors.address1 = 'Required';
    if (!form.city.trim()) newErrors.city = 'Required';
    if (!form.state) newErrors.state = 'Select a state';
    if (!form.pincode.match(/^\d{6}$/)) newErrors.pincode = 'Enter valid 6-digit pincode';
    if (!form.paymentMethod) newErrors.paymentMethod = 'Please choose a payment method';
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const shipping = 0;
  const grandTotal = cartTotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    const isValid = validate(newErrors);
    setErrors(newErrors);

    if (!isValid) {
      if (newErrors.firstName || newErrors.lastName || newErrors.phone || newErrors.email) {
        scrollToElement('contact-details-block');
      } else if (newErrors.address1 || newErrors.city || newErrors.state || newErrors.pincode) {
        scrollToElement('shipping-address-block');
      } else if (newErrors.paymentMethod) {
        scrollToElement('payment-method-block');
      }
      return;
    }
    setIsProcessing(true);

    const orderData = {
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      customerPhone: form.phone,
      address: form.address1 + (form.address2 ? `, ${form.address2}` : ''),
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      quantity: cartQty,
      total: grandTotal,
      paymentMethod: form.paymentMethod,
    };

    if (form.paymentMethod === 'cod') {
      const order = await saveOrder(orderData);

      if (!order) {
        alert('Something went wrong saving your order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Sync with iThink Logistics in the background
      try {
        fetch('/api/ithink/sync-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });
      } catch (err) {
        console.error('iThink Logistics sync failed:', err);
      }

      const orderDetails = {
        orderNumber: `SM-${order.id.slice(-8).toUpperCase()}`,
        ...form,
        itemName,
        itemSub,
        quantity: cartQty,
        total: grandTotal,
        paymentMethod: 'COD',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        placedAt: new Date().toISOString(),
      };

      localStorage.setItem('scalp_max_order', JSON.stringify(orderDetails));
      localStorage.removeItem('scalp_max_cart');
      window.dispatchEvent(new Event('cartUpdated'));
      router.push('/order-success');

    } else {
      // Razorpay online payment
      try {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal }),
        });

        const { orderId, error: apiError } = await res.json();
        if (apiError || !orderId) throw new Error(apiError || 'No order ID returned');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'SCALP MAX',
          description: itemName + ' - ' + itemSub,
          order_id: orderId,
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
            const order = await saveOrder({
              ...orderData,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });

            if (!order) {
              alert('Payment received but order save failed. Please contact support.');
              return;
            }

            // Sync with iThink Logistics in the background
            try {
              fetch('/api/ithink/sync-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id }),
              });
            } catch (err) {
              console.error('iThink Logistics sync failed:', err);
            }

            const orderDetails = {
              orderNumber: `SM-${order.id.slice(-8).toUpperCase()}`,
              ...form,
              itemName,
              itemSub,
              quantity: cartQty,
              total: grandTotal,
              paymentMethod: 'Razorpay',
              estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
              placedAt: new Date().toISOString(),
            };

            localStorage.setItem('scalp_max_order', JSON.stringify(orderDetails));
            localStorage.removeItem('scalp_max_cart');
            window.dispatchEvent(new Event('cartUpdated'));
            router.push('/order-success');
          },
          modal: { ondismiss: () => setIsProcessing(false) },
          theme: { color: '#c9a84c' },
        };

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new (window as unknown as { Razorpay: new (o: object) => { open: () => void } }).Razorpay(options);
          rzp.open();
          setIsProcessing(false);
        };
        script.onerror = () => {
          alert('Failed to load payment gateway. Check your internet connection.');
          setIsProcessing(false);
        };
        document.body.appendChild(script);

      } catch (err) {
        console.error('Razorpay error:', err);
        alert('Payment failed. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/cart')} aria-label="Back to cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Cart
        </button>
        <Link href="/" className={styles.logoWrap} aria-label="ScalpMax Home">
          <span className={styles.logoScalp}>SCALP</span>
          <span className={styles.logoMax}>MAX</span>
        </Link>
        <div className={styles.steps}>
          <span className={styles.stepDone}>Cart</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.stepActive}>Checkout</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.stepPending}>Confirmation</span>
        </div>
      </header>

      <main className={styles.main} id="checkout-main">
        <form className={styles.layout} onSubmit={handleSubmit} noValidate>
          {/* Left — Form */}
          <div className={styles.formSection}>
            <h1 className={styles.pageTitle}>Checkout</h1>

            {/* Contact Details */}
            <div className={styles.formBlock} id="contact-details-block">
              <h2 className={styles.blockTitle}>Contact Details</h2>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="firstName">First Name *</label>
                  <input
                    className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                    id="firstName" name="firstName" type="text"
                    placeholder="Priya"
                    value={form.firstName} onChange={handleChange}
                    autoComplete="given-name"
                  />
                  {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="lastName">Last Name *</label>
                  <input
                    className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                    id="lastName" name="lastName" type="text"
                    placeholder="Sharma"
                    value={form.lastName} onChange={handleChange}
                    autoComplete="family-name"
                  />
                  {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone">Phone Number *</label>
                  <input
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    id="phone" name="phone" type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange}
                    autoComplete="tel"
                    maxLength={10}
                  />
                  {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">Email *</label>
                  <input
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    id="email" name="email" type="email"
                    placeholder="priya@gmail.com"
                    value={form.email} onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className={styles.formBlock} id="shipping-address-block">
              <h2 className={styles.blockTitle}>Shipping Address</h2>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="address1">Address Line 1 *</label>
                <input
                  className={`${styles.input} ${errors.address1 ? styles.inputError : ''}`}
                  id="address1" name="address1" type="text"
                  placeholder="Flat/House No., Building, Street"
                  value={form.address1} onChange={handleChange}
                  autoComplete="address-line1"
                />
                {errors.address1 && <span className={styles.error}>{errors.address1}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="address2">Address Line 2 <span className={styles.optional}>(Optional)</span></label>
                <input
                  className={styles.input}
                  id="address2" name="address2" type="text"
                  placeholder="Area, Colony, Landmark"
                  value={form.address2} onChange={handleChange}
                  autoComplete="address-line2"
                />
              </div>

              <div className={styles.formRow3}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="city">City *</label>
                  <input
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                    id="city" name="city" type="text"
                    placeholder="Hyderabad"
                    value={form.city} onChange={handleChange}
                    autoComplete="address-level2"
                  />
                  {errors.city && <span className={styles.error}>{errors.city}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="state">State *</label>
                  <select
                    className={`${styles.select} ${errors.state ? styles.inputError : ''}`}
                    id="state" name="state"
                    value={form.state} onChange={handleChange}
                    autoComplete="address-level1"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <span className={styles.error}>{errors.state}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="pincode">Pincode *</label>
                  <input
                    className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                    id="pincode" name="pincode" type="text"
                    placeholder="500001"
                    value={form.pincode} onChange={handleChange}
                    maxLength={6}
                    autoComplete="postal-code"
                  />
                  {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="country">Country</label>
                <input
                  className={`${styles.input} ${styles.inputReadonly}`}
                  id="country" name="country" type="text"
                  value="India"
                  readOnly
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className={styles.formBlock} id="payment-method-block">
              <h2 className={styles.blockTitle}>Payment Method</h2>

              <div className={styles.paymentOptions}>
                <div className={`${styles.payOption} ${styles.payActive}`}>
                  <div className={styles.payOptionContent}>
                    <div className={styles.payOptionTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Razorpay — Pay Online
                    </div>
                    <p className={styles.payOptionDesc}>UPI, Credit/Debit Card, Net Banking, Wallets</p>
                  </div>
                  <span className={styles.payCheck}>✓</span>
                </div>
              </div>
              {errors.paymentMethod && <span className={styles.error} style={{ marginTop: '8px', display: 'block' }}>{errors.paymentMethod}</span>}
            </div>
          </div>

          {/* Right — Summary */}
          <div className={styles.sidePanel}>
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>

              <div className={styles.summaryProduct}>
                <div className={styles.summaryProductImg} aria-hidden="true">SM</div>
                <div className={styles.summaryProductInfo}>
                  <p className={styles.summaryProductName}>{itemName}</p>
                  <p className={styles.summaryProductSub}>{itemSub} × {cartQty}</p>
                </div>
                <span className={styles.summaryProductPrice}>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.summaryLines}>
                <div className={styles.summaryLine}>
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className={styles.freeShip}>FREE</span> : `₹${shipping}`}</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={`${styles.summaryLine} ${styles.totalLine}`}>
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`${styles.placeOrderBtn} ${isProcessing ? styles.processing : ''}`}
                id="place-order"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className={styles.spinner} aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>
                      {!form.paymentMethod 
                        ? `Proceed to Payment — ₹${grandTotal.toLocaleString('en-IN')}`
                        : form.paymentMethod === 'razorpay' 
                          ? `Pay — ₹${grandTotal.toLocaleString('en-IN')}` 
                          : `Place Order — ₹${grandTotal.toLocaleString('en-IN')}`
                      }
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className={styles.securityNote}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Your payment information is encrypted and secure</span>
              </div>

              <div className={styles.summaryGuarantees}>
                <div className={styles.guarantee}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  30-Day Returns
                </div>
                <div className={styles.guarantee}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Fast Shipping
                </div>
                <div className={styles.guarantee}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified Product
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
