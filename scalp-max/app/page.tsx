import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import HomeProduct from '@/components/HomeProduct/HomeProduct';
import Problem from '@/components/Problem/Problem';
import BestSellers from '@/components/BestSellers/BestSellers';
import HowItWorks from '@/components/HowItWorks/HowItWorks';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <Header />
      {/* Desktop/Laptop: Original Hero */}
      <div className={styles.desktopOnly}>
        <Hero />
      </div>
      {/* Mobile only: Product page matching mockup */}
      <div className={styles.mobileOnly}>
        <HomeProduct />
      </div>
      <Problem />
      <BestSellers />
      <HowItWorks />
      <Footer />
    </main>
  );
}
