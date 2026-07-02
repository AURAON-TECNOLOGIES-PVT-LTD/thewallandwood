'use client';

import styles from './AboutFounder.module.css';

export default function AboutFounder() {
  return (
    <section className={styles.section} id="about-founder" aria-labelledby="founder-title">
      <div className={styles.container}>

        {/* Decorative vertical line */}
        <span className={styles.verticalLine} aria-hidden="true" />

        <div className={styles.inner}>
          {/* Left — text */}
          <div className={styles.content}>
            <div className={styles.sectionLabel}>THE STORY BEHIND THE BRAND</div>

            <h2 id="founder-title" className={styles.title}>
              About the Founder
            </h2>

            <p className={styles.founderName}>
              Chungadala Sai Balaji Singh
            </p>

            <p className={styles.body}>
              Chungadala Sai Balaji Singh is the founder of{' '}
              <strong>SCALP MAX<sup>™</sup></strong>, a brand built on the belief that
              healthy-looking hair begins with a healthy scalp.
            </p>

            <div className={styles.philosophy}>
              <span className={styles.philosophyQuote}>
                &ldquo;Scalp First. Hair Follows.&rdquo;
              </span>
            </div>

            <p className={styles.body}>
              Driven by this philosophy, the vision behind SCALP MAX<sup>™</sup> is to
              develop modern scalp-care solutions that combine science-backed ingredients
              with botanical support — helping people build better scalp-care routines
              that actually work.
            </p>

            <div className={styles.ownerBadge}>
              <span className={styles.ownerLabel}>Owned &amp; Managed by</span>
              <span className={styles.ownerName}>
                Auraon Technologies and Software Solutions Pvt. Ltd.
              </span>
            </div>
          </div>

          {/* Right — decorative emblem */}
          <div className={styles.emblem} aria-hidden="true">
            <div className={styles.emblemRing}>
              <div className={styles.emblemInner}>
                <span className={styles.emblemInitial}>S</span>
                <span className={styles.emblemTagline}>Scalp First</span>
              </div>
            </div>
            <div className={styles.emblemStat}>
              <span className={styles.emblemStatNum}>™</span>
              <span className={styles.emblemStatLabel}>Registered Brand</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
