'use client';

import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works" aria-labelledby="how-title">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.sectionLabel}>HOW IT WORKS</div>
          <h2 id="how-title" className={styles.title}>
            12 days. Two phases.<br />
            One healthier scalp.
          </h2>
        </div>

        {/* Phase Cards Grid */}
        <div className={styles.grid}>
          {/* Cleansing Phase Card */}
          <div className={styles.card} id="how-phase-cleansing">
            <p className={styles.phaseLabel}>C1 — C6</p>
            <h3 className={styles.phaseTitle}>Cleansing Phase</h3>
            <p className={styles.phaseDesc}>
              Six days of micellar deep-cleanse to dissolve oil, product buildup and dead skin — preparing your scalp to absorb active treatment.
            </p>
          </div>

          {/* Treatment Phase Card */}
          <div className={styles.card} id="how-phase-treatment">
            <p className={styles.phaseLabel}>T1 — T6</p>
            <h3 className={styles.phaseTitle}>Treatment Phase</h3>
            <p className={styles.phaseDesc}>
              Six days of dermatologist-grade actives — ketoconazole, zinc PCA and niacinamide — that calm inflammation and restore scalp barrier.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
