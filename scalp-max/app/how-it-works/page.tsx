import Header from '@/components/Header/Header';
import HowItWorks from '@/components/HowItWorks/HowItWorks';
import BuySection from '@/components/BuySection/BuySection';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: "How It Works — SCALP MAX® 12-Day Alternating Therapy System",
  description: "Learn about the scientific 12-day alternating Cleanse & Treat protocol of SCALP MAX® and how it restores your scalp health.",
};

export default function HowItWorksPage() {
  return (
    <main>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <HowItWorks />
      </div>
      <BuySection />
      <Footer />
    </main>
  );
}
