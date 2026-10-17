'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Check, Clock, Lock, QrCode } from 'lucide-react';
import { ShortenForm } from './shorten-form';

const trustPoints = [
  'Free to start',
  'No signup to shorten a link',
  'QR code ',
];

const exampleLongUrl =
  'https://example.com/blog/how-to-write-better-newsletters?ref=homepage&utm_source=twitter';

/**
 * A static illustration of what the product does to a link.
 * It uses the visitor's current host so nothing here is invented,
 * and it carries no statistics.
 */
function LinkAnatomy() {
  const [host, setHost] = useState('your-domain');

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  return (
    <div className="rounded-3xl bg-primary/5 p-5 sm:p-7">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        What happens to your link
      </p>

      <div className="rounded-xl bg-card p-4">
        <p className="text-xs text-muted-foreground">Before</p>
        <p className="mt-1 break-all text-sm leading-relaxed text-muted-foreground">
          {exampleLongUrl}
        </p>
      </div>

      <div className="flex justify-center py-2" aria-hidden="true">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ArrowDown className="h-4 w-4" />
        </span>
      </div>

      <div className="rounded-xl bg-card p-4">
        <p className="text-xs text-muted-foreground">After</p>
        <p className="mt-1 break-all text-lg font-semibold tracking-tight text-primary">
          {host}/summer-sale
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <li className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5">
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            QR code
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Password
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Expiry
          </li>
        </ul>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Every link you create can show clicks over time, unique visitors,
        devices, countries and referrers.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Illustration only. Your links use this site&apos;s domain.
      </p>
    </div>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: 'easeOut' },
        };

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:pb-28 md:pt-36">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <motion.h1
              {...rise(0)}
              className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-balance md:text-6xl xl:text-7xl"
            >
              Shorten a link. See who clicks it.
            </motion.h1>

            <motion.p
              {...rise(0.08)}
              className="mt-6 max-w-[52ch] text-lg text-muted-foreground text-pretty md:text-xl"
            >
              Paste a long URL and get a short one in seconds. Add click
              analytics, a QR code, and an expiry whenever you need them.
              Passwords and custom aliases come with a free account.
            </motion.p>

            <motion.div
              {...rise(0.16)}
              id="shorten"
              className="mt-9 scroll-mt-28 rounded-2xl bg-muted/50 p-4 sm:p-5"
            >
              <ShortenForm autoFocus />
            </motion.div>

            <motion.ul
              {...rise(0.24)}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div {...rise(0.2)} className="lg:col-span-5 lg:pt-3">
            <LinkAnatomy />
          </motion.div>
        </div>
      </div>
    </section>
  );
}