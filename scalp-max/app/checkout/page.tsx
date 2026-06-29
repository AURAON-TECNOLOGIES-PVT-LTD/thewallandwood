'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  paymentMethod: 'razorpay' | '';
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
  const [itemSub, setItemSub] = useState('12-Day Scalp Therapy Shampoo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pincodeArea, setPincodeArea] = useState<string>('');
  const [autoFilled, setAutoFilled] = useState(false);

  // Ref to hold pending order data for UPI app-switch recovery
  const pendingOrderRef = useRef<{
    orderData: Parameters<typeof saveOrder>[0];
    razorpayOrderId: string;
    itemName: string;
    itemSub: string;
    cartQty: number;
    grandTotal: number;
    form: FormData;
  } | null>(null);
  // Guard flag: prevents double saveOrder if handler AND recovery poller both fire
  const orderInFlightRef = useRef(false);

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
        sub: '12-Day Scalp Therapy Shampoo',
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
      setItemSub(cart.sub || '12-Day Scalp Therapy Shampoo');
    }, 0);
  }, []);

  // ─── UPI App-Switch Recovery ───────────────────────────────────────────────
  // When a user pays via PhonePe/GPay on mobile, the browser tab is backgrounded
  // while the UPI app is open. When the user returns, the Razorpay handler may
  // not fire. This effect polls our verify-payment API when the tab becomes
  // visible again, completing the order if payment is confirmed.
  const completeOrderAfterVerification = useCallback(async (paymentId: string) => {
    const pending = pendingOrderRef.current;
    if (!pending) return;
    // Prevent double-order if handler and recovery poller both fire
    if (orderInFlightRef.current) return;
    orderInFlightRef.current = true;

    try {
      const order = await saveOrder({
        ...pending.orderData,
        razorpayPaymentId: paymentId,
        razorpayOrderId: pending.razorpayOrderId,
      });

      if (!order) {
        alert('Payment received but order save failed. Please contact support.');
        return;
      }

      const orderDetails = {
        orderNumber: `SM-${order.id.slice(-8).toUpperCase()}`,
        ...pending.form,
        itemName: pending.itemName,
        itemSub: pending.itemSub,
        quantity: pending.cartQty,
        total: pending.grandTotal,
        paymentMethod: 'Razorpay',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        placedAt: new Date().toISOString(),
      };

      localStorage.setItem('scalp_max_order', JSON.stringify(orderDetails));
      localStorage.removeItem('scalp_max_cart');
      localStorage.removeItem('scalp_max_pending_payment');
      window.dispatchEvent(new Event('cartUpdated'));
      pendingOrderRef.current = null;

      try {
        router.push('/order-success');
      } catch {
        window.location.href = '/order-success';
      }

      // Fire-and-forget Shiprocket sync
      fetch('/api/shiprocket/sync-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      }).catch((err) => console.error('Shiprocket sync error:', err));
    } catch (err) {
      console.error('Order completion error after verification:', err);
    }
  }, [router]);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 12; // poll for up to ~60 seconds

    const pollPaymentStatus = async () => {
      const pendingRaw = localStorage.getItem('scalp_max_pending_payment');
      if (!pendingRaw) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      try {
        const pending = JSON.parse(pendingRaw);
        // Restore ref so completeOrderAfterVerification has the data
        if (!pendingOrderRef.current) {
          pendingOrderRef.current = pending;
        }

        pollAttempts++;
        if (pollAttempts > MAX_POLL_ATTEMPTS) {
          if (pollInterval) clearInterval(pollInterval);
          setIsProcessing(false);
          return;
        }

        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ razorpayOrderId: pending.razorpayOrderId }),
        });
        const data = await res.json();

        if (data.paid && data.paymentId) {
          if (pollInterval) clearInterval(pollInterval);
          await completeOrderAfterVerification(data.paymentId);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const pendingRaw = localStorage.getItem('scalp_max_pending_payment');
        if (!pendingRaw) return;

        // Start polling every 5 seconds when tab becomes visible
        setIsProcessing(true);
        pollAttempts = 0;
        pollPaymentStatus(); // immediate first check
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(pollPaymentStatus, 5000);
      } else {
        // Tab hidden — stop polling
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [completeOrderAfterVerification]);

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

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: value, ...(autoFilled ? { city: '', state: '' } : {}) }));
    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));

    if (value.length < 6) {
      setPincodeStatus('idle');
      setPincodeArea('');
      if (autoFilled) {
        setAutoFilled(false);
        setForm((prev) => ({ ...prev, pincode: value, city: '', state: '' }));
      }
      return;
    }

    setPincodeStatus('loading');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const detectedState = po.State || '';
        const detectedCity = po.District || po.Division || '';
        const areas = [...new Set<string>(data[0].PostOffice.map((p: { Name: string }) => p.Name))];
        const areaLabel = areas.slice(0, 3).join(', ') + (areas.length > 3 ? ` +${areas.length - 3} more` : '');
        setForm((prev) => ({ ...prev, pincode: value, city: detectedCity, state: detectedState }));
        setPincodeArea(areaLabel);
        setPincodeStatus('success');
        setAutoFilled(true);
        setErrors((prev) => ({ ...prev, city: undefined, state: undefined, pincode: undefined }));
      } else {
        setPincodeStatus('error');
        setPincodeArea('');
        setAutoFilled(false);
      }
    } catch {
      setPincodeStatus('error');
      setPincodeArea('');
      setAutoFilled(false);
    }
  };

  // ₹0 (FREE) for Telangana, ₹50 for every other state
  const shipping = form.state === 'Telangana' ? 0 : form.state === '' ? 0 : 50;
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

    // Razorpay online payment
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pass full orderData so the server stores it in Razorpay notes.
        // This lets /api/payment-callback reconstruct & save the order
        // server-side — no localStorage needed for the mobile callback path.
        body: JSON.stringify({
          amount: grandTotal,
          orderData: {
            ...orderData,
            itemName,
            itemSub,
          },
        }),
      });

      const responseData = await res.json();
      if (responseData.error || !responseData.orderId) {
        const errMsg = responseData.description || responseData.details || responseData.error || 'No order ID returned';
        throw new Error(errMsg);
      }
      const razorpayOrderId = responseData.orderId;

      // ── Save pending payment data to localStorage BEFORE opening Razorpay ──
      // This is the key to UPI app-switch recovery: if the user pays in
      // PhonePe/GPay and the browser tab is killed, we can still verify the
      // payment and complete the order when the tab becomes visible again.
      const pendingPayload = {
        orderData,
        razorpayOrderId,
        itemName,
        itemSub,
        cartQty,
        grandTotal,
        form,
      };
      pendingOrderRef.current = pendingPayload;
      localStorage.setItem('scalp_max_pending_payment', JSON.stringify(pendingPayload));

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'SCALP MAX',
        description: itemName + ' - ' + itemSub,
        order_id: razorpayOrderId,
        // callback_url — THE PRIMARY FIX for mobile UPI (PhonePe/GPay).
        // Razorpay POSTs payment details to this URL after the UPI app
        // completes, entirely server-side. Works even when the mobile browser
        // tab is killed during the app-switch. Our route verifies the HMAC
        // signature, saves the order to Supabase, and redirects to /order-success.
        callback_url: `${window.location.origin}/api/payment-callback`,
        // webview_intent: true — additional hint to keep the browser frame
        // alive while the UPI app is in the foreground (belt-and-suspenders).
        webview_intent: true,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          // email and contact are mandatory for Razorpay to send SMS & email receipts
          email: form.email,
          // E.164 format with +91 prefix ensures Razorpay notification engine can
          // correctly match and deliver SMS confirmation to the customer
          contact: `+91${form.phone}`,
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
          // Guard: prevent double-order if recovery poller fires at the same time
          if (orderInFlightRef.current) return;
          orderInFlightRef.current = true;
          // Clear the pending payment — handler fired normally (desktop or lucky mobile)
          localStorage.removeItem('scalp_max_pending_payment');
          pendingOrderRef.current = null;

          const order = await saveOrder({
            ...orderData,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });

          if (!order) {
            alert('Payment received but order save failed. Please contact support.');
            return;
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

          // Redirect immediately — don't wait for Shiprocket sync on mobile.
          // Use window.location.href as a hard fallback for app-to-app redirect
          // scenarios where Next.js router may not fire after returning from UPI app.
          try {
            router.push('/order-success');
          } catch {
            window.location.href = '/order-success';
          }

          // Fire-and-forget: Shiprocket sync runs in background after redirect
          fetch('/api/shiprocket/sync-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id }),
          })
            .then((syncRes) => syncRes.json().then((syncData) => {
              if (!syncRes.ok) {
                console.error('Shiprocket sync failed:', syncRes.status, JSON.stringify(syncData));
              } else {
                console.log('Shiprocket sync successful:', JSON.stringify(syncData));
              }
            }))
            .catch((err) => console.error('Shiprocket sync error:', err));
        },
        modal: {
          ondismiss: () => {
            // Only stop the spinner if there's no pending UPI payment recovery in progress.
            // On mobile, Razorpay sometimes fires ondismiss when the user returns from
            // PhonePe/GPay — we must NOT clear isProcessing in that case or the
            // recovery polling spinner will disappear.
            const hasPending = !!localStorage.getItem('scalp_max_pending_payment');
            if (!hasPending) {
              setIsProcessing(false);
            }
          },
        },
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
        localStorage.removeItem('scalp_max_pending_payment');
        pendingOrderRef.current = null;
        setIsProcessing(false);
      };
      document.body.appendChild(script);

    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      console.error('Razorpay error:', err);
      alert(`Payment failed: ${errorObj.message || 'Please try again.'}`);
      localStorage.removeItem('scalp_max_pending_payment');
      pendingOrderRef.current = null;
      setIsProcessing(false);
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
          <Image
            src="/logo.png"
            alt="SCALP MAX"
            width={110}
            height={36}
            style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
            priority
          />
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
                  <label className={styles.label} htmlFor="pincode">Pincode *</label>
                  <div className={styles.pincodeWrap}>
                    <input
                      className={`${styles.input} ${errors.pincode ? styles.inputError : ''} ${pincodeStatus === 'success' ? styles.inputSuccess : ''}`}
                      id="pincode" name="pincode" type="text" inputMode="numeric"
                      placeholder="500001"
                      value={form.pincode} onChange={handlePincodeChange}
                      maxLength={6}
                      autoComplete="postal-code"
                    />
                    {pincodeStatus === 'loading' && (
                      <span className={styles.pincodeSpinner} aria-label="Looking up pincode" />
                    )}
                    {pincodeStatus === 'success' && (
                      <span className={styles.pincodeCheck} aria-hidden="true">✓</span>
                    )}
                  </div>
                  {errors.pincode && <span className={styles.error}>{errors.pincode}</span>}
                  {pincodeStatus === 'success' && pincodeArea && (
                    <span className={styles.pincodeHint}>📍 {pincodeArea}</span>
                  )}
                  {pincodeStatus === 'error' && (
                    <span className={styles.pincodeError}>Invalid pincode — please check</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="city">
                    City *
                    {autoFilled && <span className={styles.autoTag}>Auto-filled</span>}
                  </label>
                  <input
                    className={`${styles.input} ${errors.city ? styles.inputError : ''} ${autoFilled ? styles.inputAutoFilled : ''}`}
                    id="city" name="city" type="text"
                    placeholder="Hyderabad"
                    value={form.city} onChange={handleChange}
                    autoComplete="address-level2"
                    readOnly={autoFilled}
                  />
                  {errors.city && <span className={styles.error}>{errors.city}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="state">
                    State *
                    {autoFilled && <span className={styles.autoTag}>Auto-filled</span>}
                  </label>
                  <select
                    className={`${styles.select} ${errors.state ? styles.inputError : ''} ${autoFilled ? styles.inputAutoFilled : ''}`}
                    id="state" name="state"
                    value={form.state} onChange={handleChange}
                    autoComplete="address-level1"
                    disabled={autoFilled}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <span className={styles.error}>{errors.state}</span>}
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
                    <div className={styles.brandIcons}>

                      {/* Google Pay — realistic G+Pay badge */}
                      <div className={styles.brandIcon} title="Google Pay">
                        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="28" rx="5" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="1"/>
                          {/* G logo */}
                          <path d="M13.6 14.18c0-.39-.035-.765-.1-1.125H9V15.1h2.6c-.112.6-.453 1.11-.965 1.45v1.205h1.562c.914-.84 1.442-2.08 1.442-3.575z" fill="#4285F4"/>
                          <path d="M9 17.9c1.305 0 2.4-.432 3.2-1.17l-1.563-1.205c-.433.29-.987.462-1.637.462-1.26 0-2.327-.85-2.71-1.99H4.68v1.245C5.473 16.965 7.1 17.9 9 17.9z" fill="#34A853"/>
                          <path d="M6.29 13.997a3.37 3.37 0 0 1 0-2.152V10.6H4.68a5.84 5.84 0 0 0 0 5.242l1.61-1.245z" fill="#FBBC05"/>
                          <path d="M9 10.658c.71 0 1.347.244 1.848.724l1.385-1.385C11.395 9.168 10.3 8.7 9 8.7c-1.9 0-3.527.935-4.32 2.3L6.29 12.245C6.673 11.104 7.74 10.658 9 10.658z" fill="#EA4335"/>
                          {/* Pay text */}
                          <text x="16" y="17" fontFamily="'Roboto', 'Arial', sans-serif" fontSize="7.5" fontWeight="500" fill="#3C4043" letterSpacing="0.2">Pay</text>
                        </svg>
                      </div>

                      {/* PhonePe — realistic purple badge with Ph logo */}
                      <div className={styles.brandIcon} title="PhonePe">
                        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="28" rx="5" fill="#5F259F"/>
                          {/* White P symbol */}
                          <path d="M8 7h6.5c2.2 0 3.8 1.5 3.8 3.5S16.7 14 14.5 14H11v5H8V7zm3 2v3h3.5c.8 0 1.3-.55 1.3-1.5S15.3 9 14.5 9H11z" fill="#FFFFFF"/>
                          {/* "Pe" wordmark in white */}
                          <text x="19.5" y="17" fontFamily="'Arial', sans-serif" fontSize="7" fontWeight="700" fill="#FFFFFF" letterSpacing="0.3">Pe</text>
                          {/* Dot accent */}
                          <circle cx="32" cy="12" r="1.8" fill="#FFD700"/>
                        </svg>
                      </div>

                      {/* Paytm — realistic white badge with brand-accurate colors */}
                      <div className={styles.brandIcon} title="Paytm">
                        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="28" rx="5" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1"/>
                          {/* Blue "pay" */}
                          <text x="5" y="17" fontFamily="'Arial', sans-serif" fontSize="8.5" fontWeight="900" fill="#00BAF2" letterSpacing="-0.3">pay</text>
                          {/* Navy "tm" */}
                          <text x="23" y="17" fontFamily="'Arial', sans-serif" fontSize="8.5" fontWeight="900" fill="#011F5B" letterSpacing="-0.3">tm</text>
                        </svg>
                      </div>

                      {/* BHIM UPI — official logo style with arrows */}
                      <div className={styles.brandIcon} title="BHIM UPI">
                        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="28" rx="5" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1"/>
                          {/* UPI arrows (official logo style) */}
                          <polygon points="7,6 13,6 10,22 4,22" fill="#097939"/>
                          <polygon points="12,6 18,6 15,22 9,22" fill="#ED1B23"/>
                          {/* UPI text */}
                          <text x="21" y="17" fontFamily="'Arial', sans-serif" fontSize="7.5" fontWeight="800" fill="#0D5F9B" fontStyle="italic" letterSpacing="0.2">UPI</text>
                        </svg>
                      </div>

                      {/* Visa + Mastercard */}
                      <div className={styles.brandIcon} title="Visa / Mastercard">
                        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="28" rx="5" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1"/>
                          {/* VISA italic wordmark */}
                          <text x="3" y="12" fontFamily="'Arial', sans-serif" fontSize="7" fontWeight="900" fill="#1A1F71" fontStyle="italic" letterSpacing="0.5">VISA</text>
                          {/* Mastercard overlapping circles */}
                          <circle cx="24" cy="19" r="5" fill="#EB001B"/>
                          <circle cx="30" cy="19" r="5" fill="#FF5F00"/>
                          <path d="M27 15.76a5 5 0 0 1 0 6.48A5 5 0 0 1 27 15.76z" fill="#F79E1B"/>
                        </svg>
                      </div>

                    </div>
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
                <div className={styles.summaryProductImg} aria-hidden="true">
                  <Image src="/logo.png" alt="SCALP MAX" width={60} height={60} style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '6px' }} />
                </div>
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
                  <span>
                    {form.state === '' ? (
                      <span style={{ color: '#888', fontSize: '0.85em' }}>Select state</span>
                    ) : form.state === 'Telangana' ? (
                      <span className={styles.freeShip}>FREE 🎉</span>
                    ) : (
                      `₹50`
                    )}
                  </span>
                </div>
                {form.state === 'Telangana' && (
                  <div className={styles.summaryLine} style={{ color: '#2e7d32', fontSize: '0.82em' }}>
                    <span>Discount applied</span>
                    <span style={{ textDecoration: 'line-through' }}>₹50</span>
                  </div>
                )}
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
