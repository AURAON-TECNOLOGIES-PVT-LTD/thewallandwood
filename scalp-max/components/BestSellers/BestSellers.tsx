'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './BestSellers.module.css';

const PRODUCTS = [
  {
    id: 101,
    name: 'Cleansing Shampoo C1',
    sub: 'Gentle micellar cleanse for oil & buildup',
    badge: 'Daily Cleanse',
    price: 499,
    originalPrice: 799,
    mockupLabel: 'DAILY\nCLEANSE',
    mockupSub: 'micellar base'
  },
  {
    id: 102,
    name: 'Treatment Shampoo T1',
    sub: 'Ketoconazole + Zinc PCA therapy',
    badge: 'Anti-Dandruff',
    price: 549,
    originalPrice: 899,
    mockupLabel: 'ANTI-\nDANDRUFF',
    mockupSub: 'treatment active'
  },
  {
    id: 103,
    name: 'Scalp Serum 5%',
    sub: 'Redensyl + Anagain root activator',
    badge: 'Hair Fall',
    price: 699,
    originalPrice: 1099,
    mockupLabel: 'HAIR FALL',
    mockupSub: 'root serum'
  },
  {
    id: 104,
    name: 'Hydrating Conditioner',
    sub: 'Hyaluronic acid + B5 strand repair',
    badge: 'Repair',
    price: 449,
    originalPrice: 699,
    mockupLabel: 'REPAIR',
    mockupSub: 'strand hydrator'
  }
];

export default function BestSellers() {
  const router = useRouter();
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleAddToCart = (product: typeof PRODUCTS[0]) => {
    setAddingId(product.id);
    
    const cart = {
      id: product.id,
      name: product.name,
      sub: product.sub,
      quantity: 1,
      price: product.price,
      originalPrice: product.originalPrice,
      total: product.price,
      features: [product.sub]
    };
    
    localStorage.setItem('scalp_max_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setTimeout(() => {
      setAddingId(null);
      router.push('/cart');
    }, 600);
  };

  return (
    <section className={styles.section} id="best-sellers" aria-labelledby="bestsellers-title">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="bestsellers-title" className={styles.title}>Our Best Sellers</h2>
          <button className={styles.viewAllBtn} onClick={() => router.push('/checkout')} aria-label="View all best sellers">
            View all <span>→</span>
          </button>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {PRODUCTS.map((product) => (
            <div key={product.id} className={styles.card} id={`bestseller-item-${product.id}`}>
              {/* Product Mockup Container */}
              <div className={styles.mockupContainer}>
                {/* Badge on Card Image/Mockup area */}
                <div className={styles.productBadge}>{product.badge}</div>

                <img src="/hero-product.jpg" alt={product.name} className={styles.productImg} />
              </div>

              {/* Product Info */}
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productSub}>{product.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
