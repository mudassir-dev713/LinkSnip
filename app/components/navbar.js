'use client';

import { motion } from 'framer-motion';
import { Link2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import Link from 'next/link';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link2 className="h-6 w-6 text-primary" />
          <Link href="/">
            <span className="text-xl font-bold">LinkSnip</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="#features"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Features
            </Link>
            <Link
              href="/history"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              History
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur"
        >
          <div className="container py-4 px-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="#features"
                className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              >
                Pricing
              </Link>
              <Link
                href="/history"
                className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              >
                History
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border/40">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
                <Button size="sm">Get Started</Button>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
