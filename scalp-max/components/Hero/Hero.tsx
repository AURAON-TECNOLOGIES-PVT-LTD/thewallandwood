'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';

const IMAGES = [
  '/hero-slide-1.jpg',
  '/hero-slide-2.jpg',
  '/hero-slide-3.jpg',
  '/hero-slide-4.jpg',
  '/hero-slide-5.jpg',
];

export default function Hero() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = [
      { el: badgeRef.current, delay: 200 },
      { el: headingRef.current, delay: 400 },
      { el: subRef.current, delay: 650 },
      { el: ctaRef.current, delay: 850 },
      { el: imgRef.current, delay: 300 },
    ];
    items.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, delay);
    });
  }, []);

  const handleAddToCart = () => {
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
        '9 Clinical Active Ingredients'
      ]
    };
    localStorage.setItem('scalp_max_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    router.push('/checkout');
  };

  return (
    <>
      <section className={styles.hero} id="hero" aria-label="Hero section">
        <div className={styles.inner}>
          {/* Left Content */}
          <div className={styles.content}>
            <div
              ref={badgeRef}
              className={styles.badge}
              style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease' }}
            >
              12-Day Professional System
            </div>

            <h1
              ref={headingRef}
              className={styles.heading}
              style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s ease' }}
            >
              ScalpMax<br />
              <span className={styles.titleHighlight}>Kit</span>
            </h1>

            <div className={styles.dividerLine} />

            <p
              ref={subRef}
              className={styles.subheading}
              style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}
            >
              Formulated for <strong>oily, flaky & itchy</strong> scalps. An alternating Cleansing + Treatment routine that gently restores scalp balance without stripping.
            </p>

            <div className={styles.badgeHighlights}>
              <span>NON-STRIPPING</span>
              <span className={styles.badgeSep}>|</span>
              <span>GENTLE</span>
              <span className={styles.badgeSep}>|</span>
              <span>SULFATE-FREE</span>
            </div>

            <div
              ref={ctaRef}
              className={styles.priceCard}
              style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.8s ease' }}
            >
              <div className={styles.priceRow}>
                <span className={styles.priceSymbol}>₹</span>
                <span className={styles.priceValue}>749</span>
              </div>
              <p className={styles.taxText}>Inclusive of all taxes</p>
              <button className={styles.btnBuyBox} onClick={handleAddToCart} id="hero-shop-now">
                <span>Buy Now</span>
                <span className={styles.btnBuyBoxArrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Right — Product Mockup Card */}
          <div
            ref={imgRef}
            className={styles.imageWrap}
            style={{ opacity: 0, transform: 'translateX(40px)', transition: 'all 1s ease' }}
          >
            <div className={styles.cardContainer}>
              {/* Black Badge */}
              <div className={styles.newLaunchBadge}>NEW LAUNCH</div>
              
              {/* Image Carousel */}
              <div className={styles.carousel}>
                <div
                  className={styles.track}
                  style={{ transform: `translateX(-${activeIdx * 100}%)` }}
                >
                  {IMAGES.map((src, i) => (
                    <div key={i} className={styles.slide}>
                      <img src={src} alt={`Product view ${i + 1}`} className={styles.productImg} />
                    </div>
                  ))}
                </div>

                {/* Left/Right Arrows */}
                {IMAGES.length > 1 && (
                  <>
                    <button 
                      type="button"
                      className={`${styles.arrowBtn} ${styles.arrowLeft}`} 
                      onClick={(e) => { e.stopPropagation(); setActiveIdx((p) => (p - 1 + IMAGES.length) % IMAGES.length); }}
                      aria-label="Previous slide"
                    >
                      ‹
                    </button>
                    <button 
                      type="button"
                      className={`${styles.arrowBtn} ${styles.arrowRight}`} 
                      onClick={(e) => { e.stopPropagation(); setActiveIdx((p) => (p + 1) % IMAGES.length); }}
                      aria-label="Next slide"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Dots */}
                {IMAGES.length > 1 && (
                  <div className={styles.dots}>
                    {IMAGES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className={styles.trustBar}>
        <div className={styles.trustBarInner}>
          <div className={styles.trustItem}>Clinically Formulated</div>
          <div className={styles.trustItemSep}>|</div>
          <div className={styles.trustItem}>Natural Actives</div>
          <div className={styles.trustItemSep}>|</div>
          <div className={styles.trustItem}>Dermatologist Tested</div>
          <div className={styles.trustItemSep}>|</div>
          <div className={styles.trustItem}>Sulfate & Paraben Free</div>
        </div>
      </div>
    </>
  );
}
