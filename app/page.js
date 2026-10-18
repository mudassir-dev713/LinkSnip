'use client';

import { Suspense, lazy } from 'react';

// Lazy load everything below the fold.
const FeaturesSection = lazy(() =>
  import('./components/features-section').then((mod) => ({
    default: mod.FeaturesSection,
  }))
);
const CtaSection = lazy(() =>
  import('./components/cta-section').then((mod) => ({
    default: mod.CtaSection,
  }))
);
const Footer = lazy(() =>
  import('./components/footer').then((mod) => ({ default: mod.Footer }))
);

import { Loader } from './components/ui/Loader';
import { Navbar } from './components/navbar';
import { HeroSection } from './components/hero-section';

export default function Home() {
  return (
    <main id="main-content" className="min-h-dvh">
      <Navbar />

      <HeroSection />

      <Suspense fallback={<Loader className="py-24" />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<Loader className="py-12" />}>
        <CtaSection />
      </Suspense>

      <Suspense fallback={<Loader className="py-12" />}>
        <Footer />
      </Suspense>
    </main>
  );
}