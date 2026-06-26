'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  const updateCartCount = useCallback(() => {
    const stored = localStorage.getItem('scalp_max_cart');
    if (stored) {
      const cart = JSON.parse(stored);
      setCartCount(cart.quantity || 0);
    } else {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      handleScroll();
      updateCartCount();
    }, 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [handleScroll, updateCartCount]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Best Sellers', href: '/#best-sellers' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Ingredients', href: '/ingredients' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} id="header">
        <div className={styles.inner}>
          {/* Left Column: Hamburger Menu Toggle */}
          <div className={styles.leftCol}>
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              id="mobile-menu-toggle"
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {/* Center Column: Logo */}
          <div className={styles.centerCol}>
            <Link href="/" className={styles.logo} aria-label="ScalpMax Home">
              <span className={styles.logoScalp}>SCALP</span>
              <span className={styles.logoMax}>MAX</span>
            </Link>
          </div>

          {/* Right Column: Cart Link */}
          <div className={styles.rightCol}>
            <Link href="/cart" className={styles.cartIconLink} aria-label={`View Cart (${cartCount} items)`} id="header-cart-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className={styles.cartBadge} id="header-cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              className={styles.mobileNavLink}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className={styles.mobileNavLink}
            href="/cart"
            onClick={() => setMobileOpen(false)}
            id="mobile-nav-cart"
          >
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>
        </nav>
      </div>
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}

