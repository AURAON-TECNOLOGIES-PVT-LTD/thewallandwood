'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './BuySection.module.css';

const trustBadges = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 18h12M14 18v-3a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v3M12 13V6M10 6h4M12 3v3" />
        <circle cx="12" cy="10" r="1.5" />
      </svg>
    ),
    label: 'Clinically Formulated'
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 11 2 2 4-4" />
      </svg>
    ),
    label: 'Dermatologist Tested'
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M12 7c3-1 6 1 6 4s-3 4-6 4M12 11c-3-1-6 1-6 4s3 4 6 4" />
      </svg>
    ),
    label: 'No Harsh Chemicals'
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Made in India'
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    label: 'Secure Checkout'
  },
];

const PRODUCTS = [
  {
    id: 1,
    name: 'SCALP MAX®',
    sub: '12-Day Scalp Therapy Shampoo',
    price: 749,
    originalPrice: 1299,
    discountText: 'Save 42%',
    badge: 'Most Popular',
    contents: [
      {
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
          </svg>
        ),
        text: '12 Therapy Bottles (C1–C6 + T1–T6)'
      },
      {
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 12h6M9 16h6M9 8h4" />
          </svg>
        ),
        text: 'Day-by-Day Usage Guide'
      },
      {
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        ),
        text: 'Premium Gift Box Packaging'
      },
      {
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M12 7c3-1 6 1 6 4s-3 4-6 4M12 11c-3-1-6 1-6 4s3 4 6 4" />
          </svg>
        ),
        text: '9 Clinical Active Ingredients'
      }
    ]
  }
];

export default function BuySection() {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  const activeProduct = PRODUCTS[0];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll('[data-reveal]');
            els.forEach((el, i) => {
              setTimeout(() => {
                (el as HTMLElement).style.opacity = '1';
                (el as HTMLElement).style.transform = 'none';
              }, i * 120);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleQuantity = (delta: number) => {
    setQuantity((q) => Math.max(1, Math.min(10, q + delta)));
    setAddedToCart(false);
  };

  const handleAddToCart = () => {
    // Store cart in localStorage
    const cart = {
      id: activeProduct.id,
      name: activeProduct.name,
      sub: activeProduct.sub,
      quantity,
      price: activeProduct.price,
      originalPrice: activeProduct.originalPrice,
      total: activeProduct.price * quantity,
      features: activeProduct.contents.map((c) => c.text)
    };
    localStorage.setItem('scalp_max_cart', JSON.stringify(cart));
    setAddedToCart(true);
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => {
      router.push('/cart');
    }, 800);
  };

  const handleBuyNow = () => {
    const cart = {
      id: activeProduct.id,
      name: activeProduct.name,
      sub: activeProduct.sub,
      quantity,
      price: activeProduct.price,
      originalPrice: activeProduct.originalPrice,
      total: activeProduct.price * quantity,
      features: activeProduct.contents.map((c) => c.text)
    };
    localStorage.setItem('scalp_max_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    router.push('/checkout');
  };

  return (
    <section className={styles.section} id="buy" ref={sectionRef} aria-labelledby="buy-title">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        {/* Left — Hero message */}
        <div
          className={styles.left}
          data-reveal
          style={{ opacity: 0, transform: 'translateX(-40px)', transition: 'all 0.8s ease' }}
        >
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            Get SCALP MAX
          </div>
          <h2 id="buy-title" className={styles.title}>
            Start Your<br />
            <em>12-Day Journey</em>
          </h2>
          <p className={styles.tagline}>
            The only scalp therapy shampoo you&apos;ll ever need.
          </p>

          <div className={styles.promises}>
            {[
              'Free shipping on all orders',
              '30-day money-back guarantee',
              'Delivered in 3–5 business days',
              'Discreet packaging',
              'Secure payment via Razorpay',
            ].map((p) => (
              <div key={p} className={styles.promise}>
                <span className={styles.promiseCheck}>✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Product Card */}
        <div
          className={styles.productCard}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s ease 0.2s' }}
        >
          {/* Badge */}
          <div className={styles.cardBadge}>{activeProduct.badge}</div>


          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h3 className={styles.productName}>{activeProduct.name}</h3>
              <p className={styles.productSub}>{activeProduct.sub}</p>
            </div>

            <div className={styles.contents}>
              {activeProduct.contents.map(({ icon, text }) => (
                <div key={text} className={styles.contentsItem}>
                  <span className={styles.contentIcon}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>{(activeProduct.price * quantity).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.priceRight}>
                <span className={styles.originalPrice}>₹{(activeProduct.originalPrice * quantity).toLocaleString('en-IN')}</span>
                <span className={styles.discount}>{activeProduct.discountText}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className={styles.quantityRow}>
              <span className={styles.qtyLabel}>Quantity</span>
              <div className={styles.quantitySelector} role="group" aria-label="Quantity selector">
                <button
                  className={styles.qtyBtn}
                  onClick={() => handleQuantity(-1)}
                  disabled={quantity <= 1}
                  id="qty-decrease"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className={styles.qtyValue} aria-live="polite" aria-atomic="true">{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => handleQuantity(1)}
                  disabled={quantity >= 10}
                  id="qty-increase"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {quantity > 1 && (
                <span className={styles.qtyNote}>₹{activeProduct.price.toLocaleString('en-IN')} each</span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className={styles.ctaButtons}>
              <button
                className={`${styles.addToCartBtn} ${addedToCart ? styles.added : ''}`}
                onClick={handleAddToCart}
                id="add-to-cart"
                aria-label="Add to cart"
              >
                {addedToCart ? (
                  <>
                    <span>✓</span>
                    <span>Added! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                id="main-buy-now"
                aria-label="Buy now"
              >
                <span>Buy Now</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className={styles.payNote}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secure payment via Razorpay · UPI, Cards, Net Banking available
            </p>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div
        className={styles.trustBar}
        data-reveal
        style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease 0.5s' }}
      >
        {trustBadges.map((b) => (
          <div key={b.label} className={styles.trustBadge}>
            <span className={styles.trustIcon}>{b.icon}</span>
            <span className={styles.trustLabel}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
