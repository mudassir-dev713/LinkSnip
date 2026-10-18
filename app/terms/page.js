import Link from 'next/link';
import { Link2 } from 'lucide-react';

export const metadata = {
  title: 'Terms of service',
  description: 'The terms that apply when you use LinkSnip.',
};

export default function TermsPage() {
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
              Terms of service
            </h1>
            <p className="text-sm text-muted-foreground">Last updated March 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              The service
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              LinkSnip is a free URL shortener. There are no paid plans and no
              billing today. We may introduce paid features later; if we do,
              these terms will be updated before they take effect.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Your account
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              You are responsible for the links you create under your account
              and for keeping your password safe. Tell us right away if you
              think someone else has access to your account. You can delete your
              account at any time from settings, which permanently removes your
              links and associated data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Acceptable use
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Don&apos;t use LinkSnip to shorten links that distribute malware,
              run phishing campaigns, infringe copyright, or break the law in
              your jurisdiction. We validate every destination URL — only
              http:// and https:// links are accepted, and links to localhost,
              private network ranges, or addresses with embedded credentials are
              rejected — but we do not scan the content of the pages you link
              to. You are responsible for the destinations you choose.
            </p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Automated bulk abuse may result in rate limits or removal of the
              offending links. Rate limits exist to keep the service fast for
              everyone: currently 60 links per minute for signed-in users and
              10 per minute for anonymous use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Links and aliases
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Custom aliases may only contain letters, numbers, hyphens and
              underscores. Some aliases are reserved for app pages and cannot be
              used. Expiring links stop forwarding after their set time, and
              one-time links stop after a single visit. If you delete a
              destination page, the short link will keep pointing at a dead
              page — that&apos;s outside our control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Availability
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              We work to keep redirects fast and online, but the service is
              provided &quot;as is&quot; without warranties of any kind. Links
              you create remain your responsibility.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Changes
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              We may update these terms as the product evolves. Continuing to
              use LinkSnip after a change means you accept the revised terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
