'use client';

import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from './ui/button';
import { createAnimation } from '@/theme/theme-animations';

export function ThemeToggle({ variant = 'circle-blur', start = 'top-left' }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const updateStyles = React.useCallback((css) => {
    if (typeof window === 'undefined') return;

    let styleElement = document.getElementById('theme-transition-styles');

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-transition-styles';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleTheme = React.useCallback(() => {
    const animation = createAnimation(variant, start);

    updateStyles(animation.css);

    const switchTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light');
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }
    document.startViewTransition(switchTheme);
  }, [theme, setTheme, variant, start, updateStyles]);

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      name="Theme Toggle Button"
    >
      {mounted && (
        <>
          <SunIcon className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </>
      )}
    </Button>
  );
}
