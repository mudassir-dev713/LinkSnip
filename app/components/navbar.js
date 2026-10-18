'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

const links = [
  { name: 'Features', href: '/#features' },
  { name: 'Blog', href: '/blog' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        LinkSnip
      </span>
    </Link>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Show the bottom edge only once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer with Escape and stop the page scrolling behind it.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 z-50 w-full bg-background transition-[border-color] duration-200 ${
        scrolled ? 'border-b border-border' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-0 top-0 z-50 h-dvh w-72 bg-card md:hidden"
            aria-label="Menu"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-6">
                <Logo />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav aria-label="Mobile" className="flex-1 space-y-1 px-4">
                {[...links, { name: 'Sign in', href: '/login' }].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center rounded-lg px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4">
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </header>
  );
}