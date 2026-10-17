import Link from 'next/link';
import { Link2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy policy',
  description: 'How LinkSnip collects, uses and protects your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Link2 className="h-4 w-4 text-primary" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              LinkSnip
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14">
        <div className="max-w-[65ch] space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Privacy policy
            </h1>
            <p className="text-sm text-muted-foreground">Last updated March 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              What we collect
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              When you create an account we store your email address, username
              and a hashed password. When you shorten a link we store the
              destination URL, your custom alias, and click events. Each click
              event records the time, country, device type, browser, referrer,
              and a one-way hash of the visitor&apos;s IP address — the raw IP
              is never written to the database. It exists only long enough to
              look up the country and to compute the hash.
            </p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Anonymous shortening works without an account. To let you manage
              the links you created while signed out, we set a random
              identifier in an <code className="rounded bg-muted px-1">anonId</code> cookie
              and scope your links to it. This identifier is not linked to any
              personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              How we use it
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Click data powers the analytics you see in your dashboard. We
              flag known bots so the numbers stay useful, and we filter them out
              of unique-visitor counts. We do not sell your data, we do not run
              third-party ads or trackers on redirect pages, and we do not share
              individual link destinations with anyone except as required to
              operate the redirect service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Cookies
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              We use a session cookie to keep you signed in, and the
              <code className="rounded bg-muted px-1">anonId</code> cookie
              described above for anonymous link management. Theme preference
              and hour-format preference are stored locally in your browser and
              are never sent to us. Redirect pages set no tracking cookies of
              their own.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Retention and deletion
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Links and their analytics stay until you delete them. Deleting
              your account removes your links, folders, QR codes, link history,
              team memberships and click history in a single operation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Contact
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Questions about this policy? Open an issue on the project
              repository and we&apos;ll respond as soon as we can.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
