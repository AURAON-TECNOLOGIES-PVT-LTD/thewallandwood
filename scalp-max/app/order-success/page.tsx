'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './order-success.module.css';

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

export default function OrderSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ left: string; delay: string }>>([]);

  useEffect(() => {
    const stored = localStorage.getItem('scalp_max_order');
    if (stored) {
      const parsed = JSON.parse(stored);
      const items = Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
      }));
      setTimeout(() => {
        setOrder(parsed);
        setConfetti(items);
        setTimeout(() => setShowConfetti(true), 300);
      }, 0);
    } else {
      router.push('/');
    }
  }, [router]);

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
          <span className={styles.logoScalp}>SCALP</span>
          <span className={styles.logoMax}>MAX</span>
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
              <div className={styles.orderProductImg} aria-hidden="true">SM</div>
              <div className={styles.orderProductInfo}>
                <p className={styles.orderProductName}>{order.itemName || 'Cleansing Shampoo C1'}</p>
                <p className={styles.orderProductSub}>{(order.itemSub || 'Gentle micellar cleanse for oil & buildup')} × {order.quantity}</p>
              </div>
            </div>
            <div className={styles.detailRows} style={{ marginTop: '1rem' }}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Payment</span>
                <span className={styles.detailValue}>
                  {order.paymentMethod === 'razorpay' ? 'Razorpay (Online)' : 'Cash on Delivery'}
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
