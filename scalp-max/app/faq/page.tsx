import Header from '@/components/Header/Header';
import FAQ from '@/components/FAQ/FAQ';
import BuySection from '@/components/BuySection/BuySection';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: "Frequently Asked Questions — SCALP MAX™ Support",
  description: "Get answers to all your questions about SCALP MAX™ usage, safety, delivery, ingredients, and the 12-day alternating protocol.",
};

export default function FAQPage() {
  return (
    <main>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <FAQ />
      </div>
      <BuySection />
      <Footer />
    </main>
  );
}
