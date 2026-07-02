'use client';

import { useEffect, useRef } from 'react';
import styles from './WhyScalpMax.module.css';

const others = [
  { label: 'Normal Shampoo', desc: 'Same formula every day' },
  { label: 'Generic Treatments', desc: 'No system, no protocol' },
  { label: 'Temporary Relief', desc: 'Symptoms return within days' },
  { label: 'Single Ingredient', desc: 'One-size-fits-all approach' },
];

const scalpMax = [
  { label: '12-Day Program', desc: 'Structured, proven protocol' },
  { label: 'Alternating Therapy Shampoo', desc: 'C & T phases work synergistically' },
  { label: 'Professional Recovery Approach', desc: 'Dermatologist-inspired method' },
  { label: '9 Active Ingredients', desc: 'Multi-targeted formulation' },
];

export default function WhyScalpMax() {
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
              }, i * 120);
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
    <section className={styles.section} id="why-scalp-max" ref={sectionRef} aria-labelledby="why-title">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div
          className={styles.header}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease' }}
        >
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            Why SCALP MAX
            <span className={styles.labelLine} />
          </div>
          <h2 id="why-title" className={styles.title}>
            Not Just Another<br />
            <em>Shampoo</em>
          </h2>
        </div>

        <div className={styles.comparison}>
          {/* Others column */}
          <div
            className={styles.othersCol}
            data-reveal
            style={{ opacity: 0, transform: 'translateX(-40px)', transition: 'all 0.7s ease 0.2s' }}
          >
            <div className={styles.colHeader}>
              <span className={styles.colIcon}>✕</span>
              <h3 className={styles.colTitle}>The Old Way</h3>
              <p className={styles.colSub}>Generic, ineffective approach</p>
            </div>
            <ul className={styles.featureList}>
              {others.map((item) => (
                <li key={item.label} className={styles.featureItemOther}>
                  <div className={styles.featureDot} />
                  <div>
                    <span className={styles.featureLabel}>{item.label}</span>
                    <span className={styles.featureDesc}>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>



          {/* SCALP MAX column */}
          <div
            className={styles.scalpMaxCol}
            data-reveal
            style={{ opacity: 0, transform: 'translateX(40px)', transition: 'all 0.7s ease 0.2s' }}
          >
            <div className={styles.colHeader}>
              <span className={styles.colIconGold}>✓</span>
              <h3 className={styles.colTitleGold}>SCALP MAX™</h3>
              <p className={styles.colSub}>Professional-grade system</p>
            </div>
            <ul className={styles.featureList}>
              {scalpMax.map((item) => (
                <li key={item.label} className={styles.featureItemScalpMax}>
                  <div className={styles.featureDotGold} />
                  <div>
                    <span className={styles.featureLabel}>{item.label}</span>
                    <span className={styles.featureDesc}>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom stat bar */}
        <div
          className={styles.statBar}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease 0.6s' }}
        >
          {[
            { num: '12', unit: 'Days', label: 'Complete System' },
            { num: '9', unit: '+', label: 'Active Ingredients' },
            { num: '2', unit: 'Phases', label: 'Cleanse & Treat' },
            { num: '1', unit: 'Kit', label: 'Everything Included' },
          ].map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <div className={styles.statNum}>
                <span>{stat.num}</span>
                <span className={styles.statUnit}>{stat.unit}</span>
              </div>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
