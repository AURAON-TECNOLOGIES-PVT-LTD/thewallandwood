'use client';

import { useState, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HomeProduct.module.css';

const IMAGES = [
  '/hero-product.jpg',
  '/hero-slide-2.jpg',
  '/hero-slide-3.jpg',
  '/hero-slide-4.jpg',
  '/hero-slide-5.jpg',
];

export default function HomeProduct() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) setActiveIdx((p) => (p + 1) % IMAGES.length);
      else setActiveIdx((p) => (p - 1 + IMAGES.length) % IMAGES.length);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    const cart = {
      id: 1,
      name: 'SCALP MAX KIT',
      sub: '12-Day Scalp Therapy System',
      quantity: 1,
      price: 749,
      originalPrice: 1299,
      total: 749,
      features: [
        '12 Therapy Bottles (C1–C6 + T1–T6)',
        'Day-by-Day Usage Guide',
        'Premium Gift Box Packaging',
        '9 Clinical Active Ingredients',
      ],
    };
    localStorage.setItem('scalp_max_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => {
      setIsAdding(false);
      router.push('/cart');
    }, 500);
  };

  return (
    <section className={styles.section} id="home-product">
      <div className={styles.container}>
        {/* ── Image Carousel ── */}
        <div
          className={styles.carousel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.track}
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {IMAGES.map((src, i) => (
              <div key={i} className={styles.slide}>
                <img src={src} alt={`Product view ${i + 1}`} className={styles.heroImg} />
              </div>
            ))}
          </div>

          {/* Left/Right Arrows */}
          {IMAGES.length > 1 && (
            <>
              <button 
                className={`${styles.arrowBtn} ${styles.arrowLeft}`} 
                onClick={() => setActiveIdx((p) => (p - 1 + IMAGES.length) % IMAGES.length)}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button 
                className={`${styles.arrowBtn} ${styles.arrowRight}`} 
                onClick={() => setActiveIdx((p) => (p + 1) % IMAGES.length)}
                aria-label="Next slide"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {IMAGES.length > 1 && (
          <div className={styles.dots}>
            {IMAGES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
                onClick={() => setActiveIdx(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── Product Info ── */}
        <h1 className={styles.title}>SCALP MAX KIT</h1>
        <p className={styles.subtitle}>12-Day Scalp Therapy System</p>
        <p className={styles.desc}>(Cleaning Phase C1–C6 + Treatment Phase T1–T6)</p>

        {/* ── Price ── */}
        <div className={styles.priceWrap}>
          <span className={styles.price}>₹749.00</span>
          <span className={styles.tax}>Inclusive of all taxes</span>
        </div>

        {/* ── Benefits (icon on top, text below) ── */}
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"/><path d="M9 22v-4h-4"/></svg>
            <span>Reduces Dandruff<br/>& Flakes</span>
          </div>
          <div className={styles.benefit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
            <span>Nourishes<br/>Scalp</span>
          </div>
          <div className={styles.benefit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Strengthens<br/>Hair Roots</span>
          </div>
          <div className={styles.benefit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22V10M12 14c3-1.5 5-4.5 5-7.5M12 17c-3-1.5-5-4.5-5-7.5" /></svg>
            <span>Supports Healthy<br/>Hair Growth</span>
          </div>
          <div className={styles.benefit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-2.24.75-3 .1-.76.65-2.13.55-3-.1Z" /><path d="m2 16 3-8 3 8c-.87.65-2.24.75-3 .1-.76.65-2.13.55-3-.1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h18" /></svg>
            <span>Restores Scalp<br/>Balance</span>
          </div>
          <div className={styles.benefit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12M8 3v3a5 5 0 0 1-3 4.5v7.5A3 3 0 0 0 8 21h8a3 3 0 0 0 3-3v-7.5A5 5 0 0 1 16 6V3"/><path d="M8.5 13h7"/></svg>
            <span>Dermatologically<br/>Tested</span>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          className={styles.addBtn}
          onClick={handleAddToCart}
          disabled={isAdding}
          id="home-add-to-cart"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          {isAdding ? 'ADDING...' : 'ADD TO CART'}
        </button>

        {/* ── Shipping ── */}
        <div className={styles.shipping}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Free Shipping on all orders
        </div>
      </div>
    </section>
  );
}
