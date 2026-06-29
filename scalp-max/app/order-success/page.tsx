'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './order-success.module.css';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  quantity: number;
  total: number;
  paymentMethod: string;
  estimatedDelivery: string;
  placedAt: string;
  itemName?: string;
  itemSub?: string;
}

// ─── Inner component (needs useSearchParams, must be wrapped in Suspense) ─────
function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ left: string; delay: string }>>([]);

  useEffect(() => {
    const oid = searchParams.get('oid');

    const buildConfetti = () =>
      Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
      }));

    // ── Path 1: localStorage (desktop / client-side handler flow) ────────────
    const stored = localStorage.getItem('scalp_max_order');
    if (stored) {
      const parsed = JSON.parse(stored);
      setOrder(parsed);
      setConfetti(buildConfetti());
      setIsLoading(false);
      setTimeout(() => setShowConfetti(true), 150);
      return;
    }

    // ── Path 2: ?oid= param (mobile UPI callback_url flow) ───────────────────
    // When Razorpay's callback_url redirects the user here, localStorage is
    // empty because the mobile browser tab was killed during the PhonePe /
    // GPay app-switch. We fetch the saved order from Supabase instead.
    if (oid) {
      (async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', oid)
          .single();

        if (error || !data) {
          console.error('Failed to fetch order from Supabase:', error);
          router.push('/');
          return;
        }

        // Map Supabase row → Order display shape
        const nameParts = (data.customer_name || '').split(' ');
        const reconstructed: Order = {
          orderNumber: `SM-${data.id.slice(-8).toUpperCase()}`,
          firstName:  nameParts[0] || '',
          lastName:   nameParts.slice(1).join(' ') || '',
          email:      data.customer_email || '',
          phone:      data.customer_phone || '',
          address1:   data.address || '',
          city:       data.city    || '',
          state:      data.state   || '',
          pincode:    data.pincode || '',
          quantity:   data.order_items?.[0]?.quantity || 1,
          total:      data.total   || 0,
          paymentMethod: 'Razorpay',
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          placedAt:  data.created_at || new Date().toISOString(),
          itemName:  'SCALP MAX KIT',
          itemSub:   '12-Day Scalp Therapy Shampoo',
        };

        setOrder(reconstructed);
        setConfetti(buildConfetti());
        setIsLoading(false);
        setTimeout(() => setShowConfetti(true), 150);
      })();
      return;
    }

    // No data at all — redirect home
    router.push('/');
  }, [router, searchParams]);

  // Show a loading spinner during initial mount (brief SSR hydration)
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--off-white)',
        gap: '1rem',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border-light)',
          borderTop: '3px solid var(--teal, #2ba8a8)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>Confirming your order...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className={styles.page}>
      {showConfetti && (
        <div className={styles.confettiWrap} aria-hidden="true">
          {confetti.map((item, i) => (
            <div
              key={i}
              className={styles.confettiPiece}
              style={{
                left: item.left,
                animationDelay: item.delay,
                background: i % 3 === 0 ? 'var(--color-gold)' : i % 3 === 1 ? 'var(--color-sage)' : 'var(--color-cream)',
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
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
      </header>

      <main className={styles.main} id="order-success-main">
        {/* Success Hero */}
        <div className={styles.successHero}>
          <div className={styles.checkCircle} aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className={styles.successTitle}>Order Confirmed!</h1>
          <p className={styles.successSubtitle}>
            Your {order.itemName || '12-Day Scalp Therapy Shampoo'} is on its way. Get ready to restore your scalp!
          </p>
          <div className={styles.orderNum} aria-label={`Order number ${order.orderNumber}`}>
            Order #{order.orderNumber}
          </div>
        </div>

        {/* Details Grid */}
        <div className={styles.detailsGrid}>
          {/* Customer Details */}
          <div className={styles.detailCard} id="customer-details-card">
            <h2 className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Customer Details
            </h2>
            <div className={styles.detailRows}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{order.firstName} {order.lastName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{order.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>+91 {order.phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className={styles.detailCard} id="shipping-address-card">
            <h2 className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              Shipping To
            </h2>
            <div className={styles.addressBlock}>
              <p>{order.address1}</p>
              {order.address2 && <p>{order.address2}</p>}
              <p>{order.city}, {order.state} – {order.pincode}</p>
              <p>India</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.detailCard} id="order-summary-card">
            <h2 className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Order Summary
            </h2>
            <div className={styles.orderProduct}>
              <div className={styles.orderProductImg} aria-hidden="true">
                <Image src="/logo.png" alt="SCALP MAX" width={60} height={60} style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '6px' }} />
              </div>
              <div className={styles.orderProductInfo}>
                <p className={styles.orderProductName}>{order.itemName || 'Cleansing Shampoo C1'}</p>
                <p className={styles.orderProductSub}>{(order.itemSub || 'Gentle micellar cleanse for oil & buildup')} × {order.quantity}</p>
              </div>
            </div>
            <div className={styles.detailRows} style={{ marginTop: '1rem' }}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Payment</span>
                <span className={styles.detailValue}>
                  {order.paymentMethod === 'razorpay' || order.paymentMethod === 'Razorpay'
                    ? 'Razorpay (Online)'
                    : 'Cash on Delivery'}
                </span>
              </div>
              <div className={`${styles.detailRow} ${styles.totalRow}`}>
                <span className={styles.detailLabel}>Total Paid</span>
                <span className={`${styles.detailValue} ${styles.totalValue}`}>
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.homeBtn} onClick={() => router.push('/')} id="back-to-home">
            ← Back to Home
          </button>
        </div>

        {/* Support */}
        <div className={styles.support}>
          <p>Need help? Contact us at{' '}
            <a href="mailto:scalpmax1@gmail.com" className={styles.supportLink}>scalpmax1@gmail.com</a>
            {' '}or{' '}
            <a href="tel:+919963058111" className={styles.supportLink}>+91 9963058111</a>
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Default export: wraps in Suspense (required for useSearchParams) ─────────
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
