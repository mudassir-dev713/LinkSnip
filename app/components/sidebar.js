'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Link2,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  History,
  User,
  QrCode,
  Images,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { signOut, useSession } from 'next-auth/react';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'My Links',
    href: '/dashboard/links',
    icon: History,
  },
  {
    name: 'QR Generator',
    href: '/qr-generator',
    icon: QrCode,
  },
  {
    name: 'My QR Codes',
    href: '/my-qrcodes',
    icon: Images,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <>
      {/* Mobile top bar — in flow, so it never overlaps page content */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/40 bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Link2 className="h-4 w-4 text-primary" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            LinkSnip
          </span>
        </Link>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72 border-r border-border bg-card/95 backdrop-blur transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
           md:translate-x-0 md:bg-card/60
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-border p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  LinkSnip
                </h1>
                <p className="text-xs text-muted-foreground">Link analytics</p>
              </div>
            </Link>
          </div>

          {/* Quick Action */}
          <div className="p-4">
            <Link href="/dashboard/">
              <Button className="w-full shadow-lg shadow-primary/15">
                <Plus className="mr-2 h-4 w-4" />
                Shorten URL
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4" aria-label="Dashboard">
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200
                    ${
                      isActive
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-4 border-t border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle variant="circle" start="top-left" />
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {session?.user?.username || 'Guest User'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.user?.email || 'Not signed in'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
