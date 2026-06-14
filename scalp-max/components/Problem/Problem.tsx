'use client';

import { useEffect, useRef } from 'react';
import styles from './Problem.module.css';

const problems = [
  {
    title: 'Dandruff',
    description: 'Persistent white flakes that embarrass you daily',
  },
  {
    title: 'Scalp Itching',
    description: 'Constant irritation disrupting your focus and comfort',
  },
  {
    title: 'Excess Oil',
    description: 'Greasy scalp making hair look limp and dirty',
  },
  {
    title: 'Scalp Buildup',
    description: 'Product and sebum accumulation blocking hair follicles',
  },
  {
    title: 'Hair Fall',
    description: 'Thinning strands clogging your drain every wash',
  },
  {
    title: 'Scalp Fungus',
    description: 'Malassezia overgrowth causing chronic scalp issues',
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('[data-reveal]');
            cards.forEach((card, i) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, i * 80);
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

  return (
    <section className={styles.section} id="problem" ref={sectionRef} aria-labelledby="problem-title">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header} data-reveal style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease' }}>
          <div className={styles.sectionLabel}>THE PROBLEM</div>
          <h2 id="problem-title" className={styles.title}>
            Is your scalp <span className={styles.titleItalic}>struggling with?</span>
          </h2>
          <p className={styles.subtitle}>
            Most shampoos treat symptoms without addressing the root cause. ScalpMax changes that.
          </p>
        </div>

        {/* Problems Grid */}
        <div className={styles.grid}>
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className={styles.card}
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(30px)',
                transition: `all 0.6s ease ${index * 0.05}s`,
              }}
            >
              <div className={styles.iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={styles.xIcon}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>{problem.title}</h3>
              <p className={styles.cardDesc}>{problem.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom hook text */}
        <div
          className={styles.hook}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.7s ease 0.5s' }}
        >
          <p className={styles.hookText}>
            If you checked even one — <strong>ScalpMax was made for you.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
