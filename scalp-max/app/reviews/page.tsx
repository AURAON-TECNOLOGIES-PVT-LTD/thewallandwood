import Header from '@/components/Header/Header';
import Reviews from '@/components/Reviews/Reviews';
import BuySection from '@/components/BuySection/BuySection';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: "Customer Reviews & Results — SCALP MAX™",
  description: "Read real stories and verified clinical results from users of the SCALP MAX™ 12-Day ScalpMax Kit.",
};

export default function ReviewsPage() {
  return (
    <main>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <Reviews />
      </div>
      <BuySection />
      <Footer />
    </main>
  );
}
