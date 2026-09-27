'use client';

import { useEffect, useRef } from 'react';
import styles from './Problem.module.css';

const problems = [
  {
    title: 'Dandruff',
    description: 'Visible flakes and recurring scalp discomfort',
  },
  {
    title: 'Hair Fall',
    description: 'Excess shedding that can accompany scalp concerns',
  },
  {
    title: 'Excess Oil',
    description: 'Oil buildup leaving the scalp feeling greasy',
  },
  {
    title: 'Scalp Itching',
    description: 'Persistent irritation and scalp discomfort',
  },
  {
    title: 'Scalp Buildup',
    description: 'Accumulated oil, sweat and product residue',
  },
  {
    title: 'Scalp Imbalance',
    description:
      'An imbalanced scalp environment can contribute to recurring scalp concerns',
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements =
              entry.target.querySelectorAll('[data-reveal]');

            elements.forEach((element, i) => {
              setTimeout(() => {
                const el = element as HTMLElement;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 80);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={styles.section}
      id="problem"
      ref={sectionRef}
      aria-labelledby="problem-title"
    >
      <div className={styles.container}>

        {/* ── SECTION HEADER ── */}
        <div
          className={styles.header}
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.7s ease',
          }}
        >
          <div className={styles.sectionLabel}>
            THE SCALP PROBLEM
          </div>

          <h2 id="problem-title" className={styles.title}>
            Your Hair Problems
            <br />
            <span className={styles.titleItalic}>
              Start at the Scalp.
            </span>
          </h2>

          <p className={styles.subtitle}>
            Dandruff, excess oil, buildup and irritation can begin beneath
            the hair. That&apos;s why SCALP MAX® focuses on the scalp first.
          </p>
        </div>

        {/* ── PROBLEM GRID ── */}
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={styles.xIcon}
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <h3 className={styles.cardTitle}>
                {problem.title}
              </h3>

              <p className={styles.cardDesc}>
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* ── BRAND STATEMENT ── */}
        <div
          className={styles.hook}
          data-reveal
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all 0.7s ease 0.5s',
          }}
        >
          <p className={styles.hookText}>
            That&apos;s why we start with the scalp.
          </p>

          <p className={styles.hookSubtext}>
            Cleanse it. Balance it. Care for it.
          </p>

          <div className={styles.brandLine}>
            SCALP FIRST. HAIR FOLLOWS.™
          </div>
        </div>

      </div>
    </section>
  );
}
