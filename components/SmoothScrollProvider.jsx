'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.4, // slow & smooth
      easing: (t) => 1 - Math.pow(1 - t, 2), // easeOutCubic: smooth acceleration/deceleration
      smooth: true,
      smoothTouch: true,
      touchMultiplier: 2, // smooth on mobile too
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Global click handler for anchor tags
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const id = href.slice(1);
      const targetEl = document.getElementById(id);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -50 }); // Adjust offset if sticky header
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return <>{children}</>;
}
