'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './cart.module.css';

interface CartItem {
  id?: number;
  name?: string;
  sub?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  total: number;
  features?: string[];
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const SHIPPING_THRESHOLD = 499;

  useEffect(() => {
    const stored = localStorage.getItem('scalp_max_cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      setTimeout(() => {
        setCart(parsed);
        setQuantity(parsed.quantity);
      }, 0);
    }
  }, []);

  const updateQuantity = (delta: number) => {
    if (!cart) return;
    const newQty = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQty);
    const newCart = {
      ...cart,
      quantity: newQty,
      total: cart.price * newQty
    };
    setCart(newCart);
    localStorage.setItem('scalp_max_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = () => {
    localStorage.removeItem('scalp_max_cart');
    setCart(null);
    setQuantity(0);
    window.dispatchEvent(new Event('cartUpdated'));
  };


  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinue = () => {
    router.push('/');
  };

  const itemPrice = cart?.price ?? 749;
  const itemOriginalPrice = cart?.originalPrice ?? 1299;
  const itemName = cart?.name ?? 'SCALP MAX KIT';
  const itemSub = cart?.sub ?? '12-Day Scalp Therapy Shampoo';
  const itemFeatures = cart?.features ?? [];

  const total = itemPrice * quantity;
  const savings = (itemOriginalPrice - itemPrice) * quantity;
  const shipping = 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Back to home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Continue Shopping
        </button>
        <Link href="/" className={styles.logoWrap} aria-label="ScalpMax Home">
          <Image
            src="/logo.png"
            alt="SCALP MAX"
            width={110}
            height={36}
            style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
            priority
          />
        </Link>
        <div className={styles.secureTag}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure Checkout
        </div>
      </header>

      <main className={styles.main} id="cart-main">
        <h1 className={styles.pageTitle}>Your Cart</h1>

        {!cart || quantity === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyDesc}>Add a product to your cart to get started</p>
            <button className={styles.shopBtn} onClick={handleContinue} id="cart-shop-now">
              Shop Now
            </button>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            {/* Cart Items */}
            <div className={styles.cartItems}>
              <div className={styles.cartItem} id="cart-item-scalp-max">
                <div className={styles.itemImage} aria-hidden="true">
                  <Image src="/logo.png" alt="SCALP MAX" width={80} height={80} style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '8px' }} />
                </div>

                <div className={styles.itemInfo}>
                  <h2 className={styles.itemName}>{itemName}</h2>
                  <p className={styles.itemSub}>{itemSub}</p>
                  <ul className={styles.itemFeatures}>
                    {itemFeatures.map((feat) => (
                      <li key={feat}>✓ {feat}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.itemPrice}>
                    <span className={styles.priceAmount}>₹{itemPrice.toLocaleString('en-IN')}</span>
                    <span className={styles.priceOriginal}>₹{itemOriginalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Quantity */}
                  <div className={styles.quantityBlock} role="group" aria-label="Quantity">
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(-1)}
                      disabled={quantity <= 1}
                      id="cart-qty-minus"
                      aria-label="Decrease"
                    >−</button>
                    <span className={styles.qtyValue} aria-live="polite">{quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(1)}
                      disabled={quantity >= 10}
                      id="cart-qty-plus"
                      aria-label="Increase"
                    >+</button>
                  </div>

                  <div className={styles.itemSubtotal}>
                    ₹{total.toLocaleString('en-IN')}
                  </div>

                  <button className={styles.removeBtn} onClick={removeItem} id="cart-remove-item" aria-label="Remove item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>

              {/* Shipping banner */}
              <div className={styles.shippingBanner}>
                {shipping === 0 ? (
                  <span>You qualify for <strong>FREE shipping!</strong></span>
                ) : (
                  <span>Add ₹{(SHIPPING_THRESHOLD - total).toLocaleString('en-IN')} more for free shipping</span>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className={styles.summary} aria-label="Order summary">
              <h3 className={styles.summaryTitle}>Price Summary</h3>

              <div className={styles.summaryLines}>
                <div className={styles.summaryLine}>
                  <span>{itemName} × {quantity}</span>
                  <span>₹{(itemOriginalPrice * quantity).toLocaleString('en-IN')}</span>
                </div>
                <div className={`${styles.summaryLine} ${styles.savingsLine}`}>
                  <span>Discount ({Math.round(((itemOriginalPrice - itemPrice) / itemOriginalPrice) * 100)}%)</span>
                  <span>-₹{savings.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <strong className={styles.freeShip}>FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={`${styles.summaryLine} ${styles.totalLine}`}>
                  <span>Total</span>
                  <span>₹{(total + shipping).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button className={styles.checkoutBtn} onClick={handleCheckout} id="cart-checkout">
                Proceed to Checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <div className={styles.paymentMethods}>
                <p className={styles.payLabel}>Accepted Payments</p>
                <div className={styles.payIcons}>
                  {['UPI', 'Card', 'NetBanking'].map((m) => (
                    <span key={m} className={styles.payIcon}>{m}</span>
                  ))}
                </div>
              </div>

              <div className={styles.guarantees}>
                <div className={styles.guarantee}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure Payment
                </div>
                <div className={styles.guarantee}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  30-Day Returns
                </div>
                <div className={styles.guarantee}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Fast Delivery
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky bottom CTA for mobile */}
      {cart && quantity > 0 && (
        <div className={styles.mobileStickyFooter}>
          <div className={styles.stickyTotal}>
            <span className={styles.stickyTotalLabel}>Total:</span>
            <span className={styles.stickyTotalValue}>₹{(total + shipping).toLocaleString('en-IN')}</span>
          </div>
          <button className={styles.stickyCheckoutBtn} onClick={handleCheckout}>
            Checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
