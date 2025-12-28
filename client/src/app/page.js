import Navbar from '@/components/user/Navbar';
import Hero from '@/components/user/Hero';
import PromotionBanner from '@/components/user/PromotionBanner';
import Footer from '@/components/shared/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <PromotionBanner />
      </main>

      <Footer />
    </div>
  );
}