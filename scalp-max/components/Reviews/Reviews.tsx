'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Reviews.module.css';

const reviews = [
  {
    name: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
    review: 'I had been struggling with dandruff for over 3 years. After just 12 days with SCALP MAX, my scalp is completely clear. The alternating system is genius — I could feel the difference from day 3.',
    tag: 'Dandruff-Free',
    initials: 'PS',
    daysUsed: 12,
  },
  {
    name: 'Arjun K.',
    location: 'Bangalore',
    rating: 5,
    review: 'The itching used to drive me crazy. Now zero itching after just one week. The T-phase serums feel luxurious and the C-phase really deep cleans. Nothing like anything I\'ve tried before.',
    tag: 'Itching Cured',
    initials: 'AK',
    daysUsed: 12,
  },
  {
    name: 'Shreya M.',
    location: 'Delhi',
    rating: 5,
    review: 'My hair fall has reduced by at least 70%. My stylist actually noticed my scalp health improved. The premium packaging makes you feel like you\'re doing a proper treatment, not just shampooing.',
    tag: 'Less Hair Fall',
    initials: 'SM',
    daysUsed: 12,
  },
  {
    name: 'Rohan T.',
    location: 'Pune',
    rating: 5,
    review: 'Was skeptical at first, but the science behind the formula convinced me to try. Climbazole + Piroctone Olamine combo is real. Scalp fungus under control after just 12 days.',
    tag: 'Fungus Controlled',
    initials: 'RT',
    daysUsed: 12,
  },
  {
    name: 'Ananya R.',
    location: 'Chennai',
    rating: 5,
    review: 'I have oily scalp syndrome and nothing worked. The Zinc PCA in the T-phase actually regulates my sebum production now. Hair looks fresh even after 2 days without washing.',
    tag: 'Sebum Balanced',
    initials: 'AR',
    daysUsed: 12,
  },
  {
    name: 'Vikram N.',
    location: 'Hyderabad',
    rating: 5,
    review: 'Professional-grade treatment at home. The 12-bottle system seems complex but the included guide makes it simple. Day 12 my scalp felt completely transformed. Worth every rupee.',
    tag: 'Scalp Restored',
    initials: 'VN',
    daysUsed: 12,
  },
];

export default function Reviews({ teaser = false }: { teaser?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);

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
              }, i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const renderStars = (count: number) => (
    <div className={styles.stars} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );

  const reviewsToRender = teaser ? reviews.slice(0, 2) : reviews;

  return (
    <section className={styles.section} id="reviews" ref={sectionRef} aria-labelledby="reviews-title">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div
          className={styles.header}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease' }}
        >
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            Testimonials
            <span className={styles.labelLine} />
          </div>
          <h2 id="reviews-title" className={styles.title}>
            Real People.<br /><em>Real Results.</em>
          </h2>

          {/* Aggregate rating */}
          <div className={styles.aggregateRating}>
            <div className={styles.bigStars}>★★★★★</div>
            <div className={styles.ratingInfo}>
              <strong>4.9 / 5.0</strong>
              <span>Based on 200+ verified reviews</span>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {reviewsToRender.map((r, i) => (
            <div
              key={r.name}
              className={styles.card}
              data-reveal
              style={{ opacity: 0, transform: 'translateY(30px)', transition: `all 0.6s ease ${i * 0.1}s` }}
              id={`review-${i + 1}`}
            >
              <div className={styles.cardTop}>
                {renderStars(r.rating)}
                <div className={`${styles.reviewTag} badge badge-sage`}>{r.tag}</div>
              </div>

              <blockquote className={styles.quote}>
                &quot;{r.review}&quot;
              </blockquote>

              <div className={styles.reviewer}>
                <div className={styles.avatar} aria-hidden="true">{r.initials}</div>
                <div className={styles.reviewerInfo}>
                  <span className={styles.reviewerName}>{r.name}</span>
                  <span className={styles.reviewerLocation}>{r.location} · Verified Purchase</span>
                </div>
                <div className={styles.daysTag}>
                  <span>✓</span> {r.daysUsed} Days
                </div>
              </div>
            </div>
          ))}
        </div>

        {teaser && (
          <div
            style={{ textAlign: 'center', marginTop: '4rem', opacity: 0, transform: 'translateY(10px)', transition: 'all 0.6s ease' }}
            data-reveal
          >
            <Link href="/reviews" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--gold)', color: 'var(--black)', padding: '16px 36px', borderRadius: '2px', fontWeight: '600', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.3s ease' }}>
              <span>Read All Customer Stories</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
