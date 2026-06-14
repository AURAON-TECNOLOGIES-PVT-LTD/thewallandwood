import Header from '@/components/Header/Header';
import Ingredients from '@/components/Ingredients/Ingredients';
import BuySection from '@/components/BuySection/BuySection';
import Footer from '@/components/Footer/Footer';

export const metadata = {
  title: "Clinical Formulation & Key Ingredients — SCALP MAX®",
  description: "Explore the 9 active ingredients in SCALP MAX® including Piroctone Olamine, Climbazole, Niacinamide, Zinc PCA, and Panthenol.",
};

export default function IngredientsPage() {
  return (
    <main>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <Ingredients />
      </div>
      <BuySection />
      <Footer />
    </main>
  );
}
