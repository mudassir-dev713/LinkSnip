import { Navbar } from './components/navbar';
import { HeroSection } from './components/hero-section';
import { FeaturesSection } from './components/features-section';
import { StatsSection } from './components/stats-section';
import { Footer } from './components/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <Footer />
    </main>
  );
}