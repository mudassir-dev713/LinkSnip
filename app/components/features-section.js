'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  Shield,
  Gauge,
  TrendingUp,
  QrCode,
  Fingerprint,
  FolderClosed,
} from 'lucide-react';

const analyticsMetrics = [
  { name: 'Clicks over time', note: 'See when a link gets traffic.' },
  { name: 'Unique visitors', note: 'Distinct visitors, not just raw clicks.' },
  { name: 'Peak hours', note: 'The hours a link is used most.' },
  { name: 'Devices', note: 'Mobile, desktop and tablet.' },
  { name: 'Countries', note: 'Where your visitors are.' },
  { name: 'Referrers', note: 'Which sites send the clicks.' },
];

const features = [
  {
    icon: Shield,
    title: 'Safe redirects',
    description: 'Only http/https destinations are allowed — localhost and private IPs are blocked.',
  },
  {
    icon: Fingerprint,
    title: 'Bot filtering',
    description: 'Automated and suspicious traffic is flagged so your numbers stay honest.',
  },
  {
    icon: Gauge,
    title: 'Fast redirects',
    description: 'Links are redirected from the edge so they open quickly for visitors.',
  },
  {
    icon: QrCode,
    title: 'QR codes',
    description: 'Every short link comes with a scannable QR code you can download.',
  },
  {
    icon: TrendingUp,
    title: 'Click trends',
    description: 'See how a link performs over its first 7 days at a glance.',
  },
  {
    icon: FolderClosed,
    title: 'Folders and tags',
    description: 'Group links by project or campaign so they stay easy to find.',
  },
];

const controls = [
  {
    name: 'Expiry',
    note: 'Let a link expire after 1 hour, 24 hours, 7 days or 30 days.',
  },
  {
    name: 'Password protection',
    note: 'Ask for a password before the visitor is sent on.',
  },
  {
    name: 'Custom aliases',
    note: 'Choose a readable ending such as summer-sale.',
  },
  {
    name: 'Campaign (UTM) tags',
    note: 'Add source, medium and campaign and preview the final destination.',
  },
];

export function FeaturesSection() {
  const reduce = useReducedMotion();
  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.5, delay, ease: 'easeOut' },
        };

  return (
    <section id="features" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-6xl space-y-16 px-4 md:space-y-24">
        {/* Intro + analytics */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div {...reveal()} className="space-y-4 lg:col-span-5">
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-5xl">
              Know what your links are doing
            </h2>
            <p className="max-w-[46ch] text-pretty text-lg text-muted-foreground">
              Create, protect and measure short links from one dashboard, with
              no extra tools or spreadsheets.
            </p>
            <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              Analytics are filtered for bot traffic.
            </div>
          </motion.div>

          <motion.ul
            {...reveal(0.08)}
            className="grid gap-3 sm:grid-cols-2 lg:col-span-7"
          >
            {analyticsMetrics.map((metric) => (
              <li key={metric.name} className="rounded-xl bg-muted/50 p-5">
                <h3 className="font-semibold tracking-tight">{metric.name}</h3>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  {metric.note}
                </p>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Supporting features */}
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.li
              key={feature.title}
              {...reveal(0.05 * (index % 3))}
              className="flex gap-4"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* Link controls */}
        <motion.div
          {...reveal()}
          className="grid gap-8 rounded-3xl bg-muted/40 p-6 md:p-10 lg:grid-cols-12 lg:gap-14"
        >
          <div className="space-y-3 lg:col-span-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-balance md:text-4xl">
              Decide how each link behaves
            </h2>
            <p className="max-w-[44ch] text-pretty text-muted-foreground">
              Passwords, custom aliases, tags, folders and campaign fields need
              a free account. Expiry works without one.
            </p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {controls.map((item) => (
              <div key={item.name} className="rounded-xl bg-background p-5">
                <dt className="font-semibold tracking-tight">{item.name}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">
                  {item.note}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}