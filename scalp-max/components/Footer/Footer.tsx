import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoText}>ScalpMax</span>
              <span className={styles.logoDot}>.</span>
            </div>
            <p className={styles.tagline}>
              Hair science, simplified. Honest formulas. Clinical results.
            </p>
          </div>

          {/* Links Grid */}
          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Shop</h4>
              <ul>
                <li><Link href="#best-sellers" className={styles.link}>Shampoo</Link></li>
                <li><Link href="#best-sellers" className={styles.link}>Conditioner</Link></li>
                <li><Link href="#best-sellers" className={styles.link}>Serums</Link></li>
                <li><Link href="#best-sellers" className={styles.link}>Routines</Link></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Help</h4>
              <ul>
                <li><Link href="#" className={styles.link}>Track Order</Link></li>
                <li><Link href="#" className={styles.link}>Shipping</Link></li>
                <li><Link href="#" className={styles.link}>Returns</Link></li>
                <li><Link href="#" className={styles.link}>Contact</Link></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Company</h4>
              <ul>
                <li><Link href="#" className={styles.link}>About</Link></li>
                <li><Link href="#" className={styles.link}>Science</Link></li>
                <li><Link href="#" className={styles.link}>Reviews</Link></li>
                <li><Link href="#" className={styles.link}>Blog</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom copyright */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} ScalpMax. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
