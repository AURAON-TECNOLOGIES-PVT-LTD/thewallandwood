'use client';

import { useEffect, useRef } from 'react';
import styles from './Benefits.module.css';

const benefits = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
        <path d="M8 8h.01M16 8h.01M12 12h.01M9 16h.01M15 16h.01" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Eliminates Dandruff',
    desc: 'Clinical-grade formula removes visible flakes and prevents recurrence'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="9" r="2" />
        <circle cx="11" cy="16" r="2.5" />
      </svg>
    ),
    title: 'Controls Scalp Fungus',
    desc: 'Dual antifungal system eradicates Malassezia overgrowth'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C12 2 15 6 15 9.5C15 13 12 16 12 16C12 16 9 13 9 9.5C9 6 12 2 12 2Z" />
      </svg>
    ),
    title: 'Stops Scalp Itching',
    desc: 'Fast-acting soothing agents provide relief from day one'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3C8 8 6 12 6 15a6 6 0 0 0 12 0c0-3-2-7-6-12Z" />
      </svg>
    ),
    title: 'Regulates Sebum',
    desc: 'Balances oil production for a clean, non-greasy scalp'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M12 7c3-1 6 1 6 4s-3 4-6 4M12 11c-3-1-6 1-6 4s3 4 6 4" />
      </svg>
    ),
    title: 'Deep Cleanses Scalp',
    desc: 'Micellar cleansing complex removes buildup from root to follicle'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 4v16M15 4v16M4 9h16M4 15h16" />
      </svg>
    ),
    title: 'Reduces Scalp Buildup',
    desc: 'Dissolves product residue and sebum accumulation blocking follicles'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22V10M12 14c3-1.5 5-4.5 5-7.5M12 17c-3-1.5-5-4.5-5-7.5" />
      </svg>
    ),
    title: 'Supports Healthier Hair Growth',
    desc: 'Rosemary & Neem activate dormant follicles for improved density'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 4c-4 0-7 3-9 7L7 16l-3 4" />
      </svg>
    ),
    title: 'Reduces Hair Fall from Dandruff',
    desc: 'Addresses the root cause of dandruff-related hair fall'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    title: 'Strengthens Scalp Barrier',
    desc: 'Panthenol rebuilds the scalp\'s natural protection layer'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Restores pH Balance',
    desc: 'Formulated at pH 5.5 for optimal scalp microbiome health'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v10M12 17h.01M17 8l-3.5 3.5M10.5 14.5L7 18" />
      </svg>
    ),
    title: 'Clears Blocked Follicles',
    desc: 'Deep-cleanses follicles for unobstructed, healthy hair growth'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4v16M8 8c1.5.5 3 2 4 4M16 8c-1.5.5-3 2-4 4" />
      </svg>
    ),
    title: 'Soothes Inflamed Scalp',
    desc: 'Aloe Vera & Panthenol calm irritation and reduce redness fast'
  },
];

export default function Benefits() {
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
              }, i * 80);
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

  return (
    <section className={styles.section} id="benefits" ref={sectionRef} aria-labelledby="benefits-title">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div
          className={styles.header}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease' }}
        >
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            Results
            <span className={styles.labelLine} />
          </div>
          <h2 id="benefits-title" className={styles.title}>
            What You&apos;ll <em>Experience</em>
          </h2>
          <p className={styles.subtitle}>
            After 12 days of consistent use, here&apos;s what SCALP MAX delivers
          </p>
        </div>

        <div className={styles.grid}>
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={styles.card}
              data-reveal
              style={{ opacity: 0, transform: 'translateY(30px)', transition: `all 0.6s ease ${i * 0.08}s` }}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <span className={styles.icon} aria-hidden="true">{b.icon}</span>
                </div>
                <div className={styles.checkmark}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h3 className={styles.cardTitle}>{b.title}</h3>
              <p className={styles.cardDesc}>{b.desc}</p>
              <div className={styles.cardLine} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
