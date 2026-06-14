'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './WhatsInBox.module.css';

const bottles = [
  { phase: 'C1', type: 'cleansing', desc: 'Micellar Scalp Cleanser — removes impurities' },
  { phase: 'T1', type: 'treatment', desc: 'Anti-fungal Serum — Piroctone Olamine + Climbazole' },
  { phase: 'C2', type: 'cleansing', desc: 'Balancing Scalp Wash — microbiome support' },
  { phase: 'T2', type: 'treatment', desc: 'Barrier Repair Serum — Panthenol + Aloe Vera' },
  { phase: 'C3', type: 'cleansing', desc: 'Soothing Scalp Cleanser — reduces inflammation' },
  { phase: 'T3', type: 'treatment', desc: 'Sebum Control Serum — Niacinamide + Zinc PCA' },
  { phase: 'C4', type: 'cleansing', desc: 'Detox Scalp Wash — deep follicle cleanse' },
  { phase: 'T4', type: 'treatment', desc: 'Cell Renewal Serum — Neem + Rosemary Extract' },
  { phase: 'C5', type: 'cleansing', desc: 'Refresh Scalp Cleanser — restore pH balance' },
  { phase: 'T5', type: 'treatment', desc: 'Growth Stimulating Serum — follicle activation' },
  { phase: 'C6', type: 'cleansing', desc: 'Final Cleanse — prepare scalp for last treatment' },
  { phase: 'T6', type: 'treatment', desc: 'Completion Dose — lock in and maintain results' },
];

export default function WhatsInBox() {
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
              }, i * 60);
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
    <section className={styles.section} id="box" ref={sectionRef} aria-labelledby="box-title">
      <div className={styles.container}>
        {/* Left — Image */}
        <div
          className={styles.imageCol}
          data-reveal
          style={{ opacity: 0, transform: 'translateX(-40px)', transition: 'all 0.8s ease' }}
        >
          <div className={styles.imageWrap}>
            <Image
              src="/box-unboxing.png"
              alt="SCALP MAX premium unboxing — 12 therapy bottles in luxury box"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.boxImage}
            />
          </div>
          <div className={styles.imageCaption}>
            <span className={styles.captionIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block' }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
            </span>
            <span>Premium packaging included</span>
          </div>
        </div>

        {/* Right — Content */}
        <div className={styles.content}>
          <div
            className={styles.header}
            data-reveal
            style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease 0.1s' }}
          >
            <div className={styles.sectionLabel}>
              <span className={styles.labelLine} />
              Inside The Box
            </div>
            <h2 id="box-title" className={styles.title}>
              What&apos;s Inside<br />
              <em>The Box</em>
            </h2>
            <p className={styles.subtitle}>
              12 precisely formulated therapy bottles — 6 for Cleansing, 6 for Treatment — each with a specific role in your recovery.
            </p>
          </div>

          {/* Bottle grid */}
          <div className={styles.bottleGrid}>
            {bottles.map((bottle, i) => (
              <div
                key={bottle.phase}
                className={`${styles.bottle} ${bottle.type === 'cleansing' ? styles.cleansingBottle : styles.treatmentBottle}`}
                data-reveal
                style={{ opacity: 0, transform: 'scale(0.9)', transition: `all 0.5s ease ${i * 0.04}s` }}
                title={bottle.desc}
                role="img"
                aria-label={`${bottle.phase}: ${bottle.desc}`}
              >
                <span className={styles.bottlePhase}>{bottle.phase}</span>
                <span className={styles.bottleType}>{bottle.type === 'cleansing' ? 'C' : 'T'}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div
            className={styles.legend}
            data-reveal
            style={{ opacity: 0, transition: 'all 0.6s ease 0.8s' }}
          >
            <div className={styles.legendItem}>
              <div className={`${styles.legendSwatch} ${styles.cleansingSwach}`} />
              <span>C1–C6: Cleansing Phase (6 bottles)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendSwatch} ${styles.treatmentSwatch}`} />
              <span>T1–T6: Treatment Phase (6 bottles)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
