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
            <div className={styles.eyebrowLine} />

            <h1
              ref={headingRef}
              className={styles.heading}
              style={{ opacity: 0, transform: 'translateY(40px)', transition: 'all 0.8s ease' }}
            >
              ScalpMax Kit
            </h1>

            <p
              ref={subRef}
              className={styles.subheading}
              style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s ease' }}
            >
              Formulated for <strong>oily, flaky & itchy</strong> scalps. An alternating Cleansing + Treatment routine that gently restores scalp balance without stripping.
            </p>

            <div
              ref={ctaRef}
              className={styles.priceCard}
              style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.8s ease' }}
            >
              <div className={styles.priceLeft}>
                <div className={styles.priceRow}>
                  <span className={styles.priceSymbol}>₹</span>
                  <span className={styles.priceValue}>749</span>
                </div>
                <p className={styles.taxText}>Inclusive of all taxes</p>
              </div>
              <button className={styles.btnBuyBox} onClick={handleAddToCart} id="hero-shop-now">
                <span>Buy Now</span>
                <span className={styles.btnBuyBoxArrow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>

            <div className={styles.highlightsRow}>
              <div className={styles.highlightCol}>
                <span className={styles.highlightIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
                    <path d="M9.8 6.1c1.5 5.9.8 8.9-1.8 11.9" />
                  </svg>
                </span>
                <div className={styles.highlightText}>
                  <h4 className={styles.highlightTitle}>Non-Stripping</h4>
                  <p className={styles.highlightDesc}>Gentle on scalp</p>
                </div>
              </div>
              <div className={styles.highlightCol}>
                <span className={styles.highlightIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
                  </svg>
                </span>
                <div className={styles.highlightText}>
                  <h4 className={styles.highlightTitle}>Sulfate-Free</h4>
                  <p className={styles.highlightDesc}>Safe & mild</p>
                </div>
              </div>
              <div className={styles.highlightCol}>
                <span className={styles.highlightIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                </span>
                <div className={styles.highlightText}>
                  <h4 className={styles.highlightTitle}>Dermatologically</h4>
                  <p className={styles.highlightDesc}>Tested</p>
                </div>
              </div>
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
      {/* Trust Bar */}
      <div className={styles.trustBar}>
        <div className={styles.trustBarInner}>
          {/* Column 1: 12 Days System */}
          <div className={styles.trustCol}>
            <div className={styles.trustIconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
              </svg>
            </div>
            <div className={styles.trustText}>
              <h3 className={styles.trustColTitle}>
                <span className={styles.trustNumber}>12</span> DAYS SYSTEM
              </h3>
              <p className={styles.trustColSub}>Follow. Alternate. See Results.</p>
            </div>
          </div>

          {/* Column 2: Scalp Balance */}
          <div className={styles.trustCol}>
            <div className={styles.trustIconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                <path d="M12 6c-2 2-2 5 0 8" />
                <circle cx="10" cy="7" r="1" fill="currentColor" />
                <circle cx="14" cy="13" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className={styles.trustText}>
              <h3 className={styles.trustColTitle}>Scalp Balance</h3>
              <p className={styles.trustColSub}>Healthy scalp is the foundation</p>
            </div>
          </div>

          {/* Column 3: Relief & Comfort */}
          <div className={styles.trustCol}>
            <div className={styles.trustIconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            </div>
            <div className={styles.trustText}>
              <h3 className={styles.trustColTitle}>Relief & Comfort</h3>
              <p className={styles.trustColSub}>Reduces itch, flakes & irritation</p>
            </div>
          </div>

          {/* Column 4: Stronger, Healthier Hair */}
          <div className={styles.trustCol}>
            <div className={styles.trustIconContainer}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c0 6 4 9 4 13a4 4 0 0 1-8 0c0-4 4-7 4-13z" />
                <path d="M12 21v-5" />
                <path d="M8 12c-2 0-3 1-3 3" />
                <path d="M16 12c2 0 3 1 3 3" />
              </svg>
            </div>
            <div className={styles.trustText}>
              <h3 className={styles.trustColTitle}>Stronger, Healthier<br />Hair Starts Here</h3>
              <p className={styles.trustColSub}>Nourished scalp, better hair tomorrow</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
