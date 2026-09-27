'use client';

import { useState, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HomeProduct.module.css';

const IMAGES = [
  '/image1.jpg',
  '/image2.jpg',
  '/image3.jpg',
  '/image4.jpg',
  '/image5.jpg',
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
      if (diff > 0) {
        setActiveIdx((p) => (p + 1) % IMAGES.length);
      } else {
        setActiveIdx((p) => (p - 1 + IMAGES.length) % IMAGES.length);
      }
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    const cart = {
      id: 1,
      name: 'SCALP MAX™',
      sub: '12-Day ScalpMax Kit',
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
            style={{
              transform: `translateX(-${activeIdx * 100}%)`,
            }}
          >
            {IMAGES.map((src, i) => (
              <div key={i} className={styles.slide}>
                <img
                  src={src}
                  alt={`Product view ${i + 1}`}
                  className={styles.heroImg}
                />
              </div>
            ))}
          </div>

          {/* Left/Right Arrows */}
          {IMAGES.length > 1 && (
            <>
              <button
                className={`${styles.arrowBtn} ${styles.arrowLeft}`}
                onClick={() =>
                  setActiveIdx(
                    (p) => (p - 1 + IMAGES.length) % IMAGES.length
                  )
                }
                aria-label="Previous slide"
              >
                ‹
              </button>

              <button
                className={`${styles.arrowBtn} ${styles.arrowRight}`}
                onClick={() =>
                  setActiveIdx((p) => (p + 1) % IMAGES.length)
                }
                aria-label="Next slide"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* ── Dots ── */}
        {IMAGES.length > 1 && (
          <div className={styles.dots}>
            {IMAGES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${
                  i === activeIdx ? styles.dotActive : ''
                }`}
                onClick={() => setActiveIdx(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── Product Info ── */}
        <h1 className={styles.title}>
          SCALP MAX Hair Fall & Dandruff Shampoo Kit
        </h1>

        <p className={styles.subtitle}>
          India’s Best Hair Care Routine.
        </p>

        <p className={styles.desc}>
          A professional 12-day Cleansing + Treatment system designed to
          cleanse, rebalance and care for your scalp—helping reduce dandruff,
          hair fall, excess oil & scalp buildup.
        </p>

        {/* ── Price ── */}
        <div className={styles.priceWrap}>
          <span className={styles.price}>₹749.00</span>
          <span className={styles.tax}>Inclusive of all taxes</span>
        </div>

        {/* ── CTA ── */}
<button
  className={styles.addBtn}
  onClick={handleAddToCart}
  disabled={isAdding}
  id="home-add-to-cart"
>
  <span className={styles.buyContent}>
    <span className={styles.buyTitle}>
      {isAdding ? 'PROCESSING...' : 'BUY NOW'}
    </span>

    <span className={styles.buyTagline}>
      FOR THE BEST HAIR OF YOUR LIFE
    </span>
  </span>

  <span className={styles.btnArrow}>
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </span>
</button>

        {/* ── Benefits ── */}
        <div className={styles.benefits}>

          {/* Benefit 1 */}
          <div className={styles.benefit}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
              <path d="M9 22v-4h-4" />
            </svg>

            <span>
              Reduces Dandruff
              <br />
              & Flakes
            </span>
          </div>

          {/* Benefit 2 */}
          <div className={styles.benefit}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22V10M12 14c3-1.5 5-4.5 5-7.5M12 17c-3-1.5-5-4.5-5-7.5" />
            </svg>

            <span>
              Supports Healthy
              <br />
              Hair Growth
            </span>
          </div>

          {/* Benefit 3 */}
          <div className={styles.benefit}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 3h12M8 3v3a5 5 0 0 1-3 4.5v7.5A3 3 0 0 0 8 21h8a3 3 0 0 0 3-3v-7.5A5 5 0 0 1 16 6V3" />
              <path d="M8.5 13h7" />
            </svg>

            <span>
              Dermatologically
              <br />
              Tested
            </span>
          </div>

        </div>

        {/* ── Shipping ── */}
        <div className={styles.shipping}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>

          Free Shipping on all orders
        </div>

      </div>
    </section>
  );
}
