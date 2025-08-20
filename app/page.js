'use client';

import { Suspense, lazy } from 'react';

// Lazy load all components

const FeaturesSection = lazy(() =>
  import('./components/features-section').then((mod) => ({
    default: mod.FeaturesSection,
  }))
);
// const StatsSection = lazy(() =>
//   import('./components/stats-section').then((mod) => ({
//     default: mod.StatsSection,
//   }))
// );
const Footer = lazy(() =>
  import('./components/footer').then((mod) => ({ default: mod.Footer }))
);

import { Loader } from './components/ui/Loader';
import { Navbar } from './components/navbar';
import { HeroSection } from './components/hero-section';
export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <HeroSection />

      <Suspense fallback={<Loader />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<Loader />}>
        <Footer />
      </Suspense>
    </main>
  );
}
