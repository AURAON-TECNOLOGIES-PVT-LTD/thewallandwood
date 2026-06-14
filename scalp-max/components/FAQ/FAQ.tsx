'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './FAQ.module.css';

const faqs = [
  {
    q: 'How does the 12-Day system work?',
    a: 'The system alternates between Cleansing (C) and Treatment (T) days. Cleansing days remove scalp buildup and prepare your scalp. Treatment days deliver active ingredients deep into the scalp. This alternating approach prevents ingredient adaptation and maximizes efficacy.',
  },
  {
    q: 'Is SCALP MAX safe for all hair types?',
    a: 'Yes. SCALP MAX is formulated at pH 5.5 — the ideal scalp pH — making it compatible with all hair types including curly, straight, oily, dry, color-treated, and chemically processed hair.',
  },
  {
    q: 'How soon will I see results?',
    a: 'Most users notice reduced itching and flaking within 3–4 days. By day 7, significant improvement in dandruff is visible. By day 12, full-course results including improved scalp health and reduced oil are achieved.',
  },
  {
    q: 'Can I use SCALP MAX if I have sensitive skin?',
    a: 'SCALP MAX is formulated without sulfates, parabens, and harsh preservatives. The Aloe Vera and Panthenol provide soothing properties. However, if you have known allergies to any listed ingredient, we recommend a patch test first.',
  },
  {
    q: 'What happens after the 12 days?',
    a: 'After completing your 12-day program, your scalp condition should significantly improve. For maintenance, you can switch to gentle daily scalp care. Repeat the 12-day program every 2–3 months for continued benefits.',
  },
  {
    q: 'Does SCALP MAX help with hair fall?',
    a: 'Yes. Scalp-related hair fall caused by dandruff, fungal overgrowth, or clogged follicles is addressed directly by SCALP MAX. The Rosemary Extract and Neem formula also stimulates blood circulation to promote hair growth.',
  },
  {
    q: 'What is the difference between C and T bottles?',
    a: 'C bottles (C1–C6) are Cleansing formulas designed to remove buildup, oil, and fungal debris. T bottles (T1–T6) are Treatment serums containing concentrated active ingredients for deep scalp therapy. They work synergistically — one without the other would not be as effective.',
  },
  {
    q: 'How do I use the SCALP MAX system daily?',
    a: 'Apply on Day 1 with C1, Day 2 with T1, and so on alternating each day. Each bottle is numbered. Apply directly to the scalp, massage gently, and leave for 3–5 minutes before rinsing. Follow the included day-by-day usage guide for exact instructions.',
  },
  {
    q: 'Is SCALP MAX tested by dermatologists?',
    a: 'Yes. SCALP MAX has been dermatologist-tested and clinically formulated with ingredients that have published safety and efficacy data. The formula is manufactured under strict GMP (Good Manufacturing Practice) guidelines.',
  },
  {
    q: 'Can I use SCALP MAX alongside my regular shampoo?',
    a: 'For the 12-day program, we recommend using SCALP MAX exclusively as directed. After completing the program, you can resume your regular shampoo alongside periodic SCALP MAX maintenance treatments.',
  },
  {
    q: 'What is Piroctone Olamine and why is it in SCALP MAX?',
    a: 'Piroctone Olamine is a next-generation antifungal active proven to be more effective than Zinc Pyrithione (commonly found in anti-dandruff shampoos) against Malassezia — the fungus responsible for dandruff. It is a key active in the T-phase serums.',
  },
  {
    q: 'Does SCALP MAX contain sulfates or parabens?',
    a: 'No. SCALP MAX is free from sulfates (SLS/SLES), parabens, silicones, mineral oils, and artificial fragrances. It uses gentle, clinically-approved surfactants and preservatives that are safe for long-term scalp use.',
  },
  {
    q: 'Is SCALP MAX suitable for men and women both?',
    a: 'Absolutely. SCALP MAX is gender-neutral and designed for anyone experiencing dandruff, scalp itching, excess oil, buildup, or scalp fungus. Both men and women have reported excellent results.',
  },
  {
    q: 'Can I use SCALP MAX if I have color-treated hair?',
    a: 'Yes. SCALP MAX is formulated to be color-safe. The gentle cleansing agents in C-phase bottles will not strip hair color, and the T-phase serums are designed to work on the scalp without affecting the hair shaft.',
  },
  {
    q: 'What is the shelf life of SCALP MAX?',
    a: 'Each bottle has a shelf life of 24 months from manufacture date and 12 months after opening. The bottles are designed with UV-protective packaging to maintain ingredient integrity.',
  },
  {
    q: 'Is SCALP MAX cruelty-free?',
    a: 'Yes. SCALP MAX is 100% cruelty-free. No animal testing is performed at any stage of development, formulation, or manufacturing. We are committed to ethical and responsible beauty standards.',
  },
  {
    q: 'How do I store the SCALP MAX bottles?',
    a: 'Store in a cool, dry place away from direct sunlight. Ideal storage temperature is 15–25°C. Do not store in humid environments such as directly in the shower. The premium gift box can be used for storage.',
  },
  {
    q: 'What if I miss a day in the 12-day program?',
    a: 'If you miss a day, simply continue from where you left off the next day. Do not double-dose. The program is designed to be flexible — consistency is more important than strict 12-consecutive-day adherence.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes. We offer a 30-day satisfaction guarantee. If you complete the 12-day program as directed and are not satisfied with the results, contact us at scalpmax1@gmail.com with your order number and we will arrange a full refund, no questions asked.',
  },
  {
    q: 'How do I track my order after purchasing?',
    a: 'After placing your order, you will receive a confirmation email with your order number. Once shipped, you will receive a tracking link via SMS and email. You can also check order status on our website under "Order Tracking".',
  },
  {
    q: 'Who manufactures SCALP MAX?',
    a: 'SCALP MAX is manufactured by UTTAM PRINT PACK (Cosmetic Division), B-161, DDA Shed, B-Block, Okhla Industrial Area, Phase-I, New Delhi – 110020, Mfg. Lic. No.: 04/86/20/CM. It is marketed by SCALP MAX (Aurion Technologies & Software Solutions Pvt. Ltd.), Hyderabad, Telangana.',
  },
  {
    q: 'How do I contact SCALP MAX customer support?',
    a: 'You can reach our customer care team at scalpmax1@gmail.com or call us at +91 9963058111. We are available Monday to Saturday, 10 AM to 6 PM IST. You can also visit www.auraontechnologies.com for more information.',
  },
];

export default function FAQ({ teaser = false }: { teaser?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const faqsToRender = teaser ? faqs.slice(0, 4) : faqs;

  return (
    <section className={styles.section} id="faq" ref={sectionRef} aria-labelledby="faq-title">
      <div className={styles.container}>
        <div
          className={styles.header}
          data-reveal
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s ease' }}
        >
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            FAQ
            <span className={styles.labelLine} />
          </div>
          <h2 id="faq-title" className={styles.title}>
            Frequently Asked <em>Questions</em>
          </h2>
          <p className={styles.subtitle}>
            Everything you need to know about the SCALP MAX 12-Day System
          </p>
        </div>

        <div className={styles.faqList}>
          {faqsToRender.map((faq, i) => (
            <div
              key={i}
              className={`${styles.faqItem} ${openIndex === i ? styles.open : ''}`}
              data-reveal
              style={{ opacity: 0, transform: 'translateY(16px)', transition: `all 0.45s ease ${i * 0.03}s` }}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggle(i)}
                id={`faq-${i + 1}`}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i + 1}`}
              >
                <span className={styles.qNum}>{i < 9 ? `0${i + 1}` : i + 1}</span>
                <span className={styles.qText}>{faq.q}</span>
                <span className={`${styles.icon} ${openIndex === i ? styles.iconOpen : ''}`} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                className={styles.faqAnswer}
                id={`faq-answer-${i + 1}`}
                role="region"
                aria-labelledby={`faq-${i + 1}`}
              >
                <div className={styles.faqAnswerInner}>
                  <p>{faq.a}</p>
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
            <Link href="/faq" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--gold)', color: 'var(--black)', padding: '16px 36px', borderRadius: '2px', fontWeight: '600', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.3s ease' }}>
              <span>View All 22 FAQs</span>
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
