import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { Button } from './components/ui/button';

export default function NotFound() {
  return (
    <div className="hero-glow flex min-h-dvh flex-col items-center justify-center gap-6 p-4 text-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Link2 className="h-5 w-5 text-primary" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight">
          LinkSnip
        </span>
      </Link>

      <div className="space-y-3">
        <p className="font-display text-6xl font-bold tracking-tight text-primary">
          404
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="mx-auto max-w-sm text-pretty text-muted-foreground">
          The link may have been mistyped or the page was moved. Head back home
          to shorten a new link.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/">
          <Button className="shadow-lg shadow-primary/20">Back to home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Open dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
