import Link from 'next/link';
import { Button } from './ui/button';

export function CtaSection() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-12">
          <div className="max-w-xl space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Your next link is one paste away
            </h2>
            <p className="text-pretty text-primary-foreground/80">
              Shorten a link right now, or create a free account to keep your
              links, tags and analytics in one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/#shorten">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Shorten a link
              </Button>
            </Link>
            <Link
              href="/signup"
              className="rounded-md px-2 py-2 text-center text-sm font-medium underline-offset-4 hover:underline"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}