import Link from 'next/link';
import { Link2 } from 'lucide-react';

const columns = [
  {
    heading: 'Product',
    links: [
      { name: 'Features', href: '/#features' },
      { name: 'Analytics', href: '/dashboard/analytics' },
      { name: 'QR generator', href: '/qr-generator' },
      { name: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { name: 'Sign in', href: '/login' },
      { name: 'Create account', href: '/signup' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-xs space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                LinkSnip
              </span>
            </Link>
            <p className="text-sm text-pretty leading-relaxed text-muted-foreground">
              A URL shortener with click analytics, QR codes and link controls.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="space-y-3">
              <h3 className="text-sm font-semibold tracking-tight">
                {column.heading}
              </h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LinkSnip. All rights reserved.
        </p>
      </div>
    </footer>
  );
}