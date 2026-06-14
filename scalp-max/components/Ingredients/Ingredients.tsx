'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Ingredients.module.css';

const ingredients = [
  {
    name: 'Piroctone Olamine',
    role: 'Anti-fungal',
    desc: 'Clinically proven to eliminate Malassezia, the primary cause of dandruff',
    detail: 'Superior to zinc pyrithione in biofilm penetration. Works at pH 5.5 for optimal scalp compatibility.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 18h12M14 18v-3a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v3M12 13V6M10 6h4M12 3v3" />
        <circle cx="12" cy="10" r="1.5" />
      </svg>
    ),
  },
  {
    name: 'Climbazole',
    role: 'Anti-fungal Booster',
    desc: 'Broad-spectrum antifungal that synergizes with Piroctone Olamine',
    detail: 'Inhibits ergosterol synthesis in fungal cell membranes. Prevents resistance development.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 3h6M10 9h4M10 3v6l-4 8a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-8V3Z" />
      </svg>
    ),
  },
  {
    name: 'Niacinamide',
    role: 'Barrier Repair',
    desc: 'Strengthens the scalp barrier and reduces inflammation',
    detail: 'Regulates sebum production, minimizes pore appearance, and improves scalp skin texture.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.5 10.5C4.5 10.5 8 7 12 7s7.5 3.5 7.5 3.5M4.5 13.5C4.5 13.5 8 17 12 17s7.5-3.5 7.5-3.5" />
        <path d="M7 9v6M12 7v10M17 9v6" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    name: 'Zinc PCA',
    role: 'Sebum Control',
    desc: 'Regulates excess oil production for balanced scalp',
    detail: 'Amino acid-complexed zinc that controls sebaceous gland activity without stripping the scalp.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m13 2-8 10h7v10l8-10h-7V2Z" />
      </svg>
    ),
  },
  {
    name: 'Panthenol',
    role: 'Hydration & Repair',
    desc: 'Pro-vitamin B5 that deeply nourishes and repairs scalp cells',
    detail: 'Penetrates to the dermis layer, stimulating cell proliferation and providing lasting moisture.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7Z" />
      </svg>
    ),
  },
  {
    name: 'Tea Tree Oil',
    role: 'Natural Antiseptic',
    desc: 'Natural antimicrobial that soothes itching and redness',
    detail: 'Terpinen-4-ol disrupts microbial cell membranes. Provides immediate relief from scalp irritation.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M12 7c3-1 6 1 6 4s-3 4-6 4M12 11c-3-1-6 1-6 4s3 4 6 4" />
      </svg>
    ),
  },
  {
    name: 'Neem Extract',
    role: 'Scalp Purifier',
    desc: 'Ancient Ayurvedic ingredient with potent anti-inflammatory properties',
    detail: 'Azadirachtin compounds regulate scalp microbiome and reduce seborrheic dermatitis flare-ups.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3c-4 4-5 9-5 13s3 5 5 5 5-1 5-5-1-9-5-13Z" />
        <path d="M12 8c-2 2-3 5-3 8" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Rosemary Extract',
    role: 'Hair Growth',
    desc: 'Stimulates blood circulation and promotes hair follicle activity',
    detail: 'Clinical studies show comparable efficacy to Minoxidil 2% for hair density improvement after 6 months.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22V10M12 14c3-1.5 5-4.5 5-7.5M12 17c-3-1.5-5-4.5-5-7.5M12 10c2-1 3-3 3-5M12 12c-2-1-3-3-3-5" />
      </svg>
    ),
  },
  {
    name: 'Aloe Vera',
    role: 'Soothing Agent',
    desc: 'Instantly calms irritated scalp with proteolytic enzymes',
    detail: 'Contains 75+ nutrients, 20 minerals, and 18 amino acids that deeply condition the scalp environment.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4v16M8 8c1.5.5 3 2 4 4M16 8c-1.5.5-3 2-4 4M7 14c2.5.5 4 1.5 5 3M17 14c-2.5.5-4 1.5-5 3" />
      </svg>
    ),
  },
];

export default function Ingredients({ teaser = false }: { teaser?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [flipped, setFlipped] = useState<number | null>(null);

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

  const ingredientsToRender = teaser ? ingredients.slice(0, 3) : ingredients;

  return (
    <section className={styles.section} id="ingredients" ref={sectionRef} aria-labelledby="ingredients-title">
      {/* Background image */}
      <div className={styles.bgImage} aria-hidden="true">
        <Image
          src="/ingredients-bg.png"
          alt=""
          fill
          className={styles.bgImg}
          sizes="100vw"
        />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.container}>
        <div
          className={styles.header}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease' }}
        >
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            Formulation
            <span className={styles.labelLine} />
          </div>
          <h2 id="ingredients-title" className={styles.title}>
            Key <em>Ingredients</em>
          </h2>
          <p className={styles.subtitle}>
            {teaser ? '9 clinically-selected actives working in perfect harmony.' : '9 clinically-selected actives working in perfect harmony. Tap any ingredient to learn more.'}
          </p>
        </div>

        <div className={styles.grid}>
          {ingredientsToRender.map((ing, i) => (
            <div
              key={ing.name}
              className={`${styles.card} ${flipped === i ? styles.flipped : ''}`}
              data-reveal
              style={{ opacity: 0, transform: 'translateY(30px)', transition: `all 0.6s ease ${i * 0.06}s` }}
              onClick={() => setFlipped(flipped === i ? null : i)}
              id={`ingredient-${ing.name.toLowerCase().replace(/\s+/g, '-')}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setFlipped(flipped === i ? null : i)}
              aria-pressed={flipped === i}
              aria-label={`${ing.name} — ${ing.role}`}
            >
              <div className={styles.cardInner}>
                {/* Front */}
                <div className={styles.front}>
                  <div className={styles.iconWrap}>
                    <span className={styles.icon}>{ing.icon}</span>
                  </div>
                  <div className={styles.badge}>{ing.role}</div>
                  <h3 className={styles.ingName}>{ing.name}</h3>
                  <p className={styles.ingDesc}>{ing.desc}</p>
                  <span className={styles.tapHint}>Tap to learn more →</span>
                </div>

                {/* Back */}
                <div className={styles.back}>
                  <div className={styles.badge}>{ing.role}</div>
                  <h3 className={styles.ingNameBack}>{ing.name}</h3>
                  <p className={styles.ingDetail}>{ing.detail}</p>
                  <span className={styles.tapHintBack}>← Tap to go back</span>
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
            <Link href="/ingredients" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--gold)', color: 'var(--black)', padding: '16px 36px', borderRadius: '2px', fontWeight: '600', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.3s ease' }}>
              <span>View All 9 Clinical Actives</span>
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
