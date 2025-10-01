'use client';

import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { createAnimation } from '@/theme/theme-animations';

export function ThemeToggle({
  variant = 'circle-blur',
  start = 'top-left',
  showLabel = false,
  url = '',
}) {
  const { theme, setTheme } = useTheme();

  const styleId = 'theme-transition-styles';

  const updateStyles = React.useCallback((css, name) => {
    if (typeof window === 'undefined') return;

    let styleElement = document.getElementById(styleId);

    console.log('style ELement', styleElement);
    console.log('name', name);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;

    console.log('content updated');
  }, []);

  const toggleTheme = React.useCallback(() => {
    console.log('Current theme before toggle:', theme); // 👈 check
    const animation = createAnimation(variant, start, url);

    updateStyles(animation.css, animation.name);

    const switchTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      console.log('Switching to:', newTheme); // 👈 check
      setTheme(newTheme);
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }
    document.startViewTransition(switchTheme);
  }, [theme, setTheme]);

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="w-3 p-0 h-3 relative group"
      name="Theme Toggle Button"
    >
      <SunIcon className="size-[.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-[.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Theme Toggle </span>
      {showLabel && (
        <>
          <span className="hidden group-hover:block border rounded-full px-2 absolute -top-10">
            {' '}
            variant = {variant}
          </span>
          <span className="hidden group-hover:block border rounded-full px-2 absolute -bottom-10">
            {' '}
            start = {start}
          </span>
        </>
      )}
    </Button>
  );
}
