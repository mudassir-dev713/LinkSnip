// app/[shortUrl]/page.js
import Link from 'next/link';
import UrlInfoClient from './UrlInfoClient';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

/**
 * Rich preview metadata for scrapers (WhatsApp, Slack, Twitter…). The
 * og:image points at the generated card for this link; the page itself
 * still behaves as the usual interstitial for humans.
 */
export async function generateMetadata({ params }) {
  try {
    const { shortUrl } = await params;
    await dbConnect();
    const doc = await ShortUrl.findOne({ shortUrl })
      .select('title fullUrl')
      .lean();
    if (!doc) return {};
    const title =
      doc.title && doc.title !== 'Untitled Link'
        ? doc.title
        : new URL(doc.fullUrl).hostname.replace(/^www\./, '');
    const description = `Shared via LinkSnip → ${new URL(doc.fullUrl).hostname.replace(/^www\./, '')}`;
    const image = `${SITE_URL}/api/og/${doc._id}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: image, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {};
  }
}

export default async function UrlPage({ params }) {
  await dbConnect();

  const { shortUrl } = await params;

  // Only project public fields — never leak the password hash, owner ids or
  // targeting rules to the visitor's browser.
  const urlData = await ShortUrl.findOne({ shortUrl: shortUrl })
    .select('shortUrl fullUrl title createdAt status expiresAt password')
    .lean();

  if (!urlData) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">Link not found</h1>
        <p className="text-sm text-muted-foreground">
          This short link doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/" className="text-sm font-medium text-primary underline underline-offset-2">
          Create your own short link
        </Link>
      </div>
    );
  }

  // Check if link has expired
  if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">Link expired</h1>
        <p className="text-sm text-muted-foreground">
          This link is no longer active.
        </p>
        <Link href="/" className="text-sm font-medium text-primary underline underline-offset-2">
          Create your own short link
        </Link>
      </div>
    );
  }

  const safeData = {
    shortUrl: urlData.shortUrl,
    fullUrl: urlData.password ? null : urlData.fullUrl,
    title: urlData.title,
    createdAt: urlData.createdAt,
    status: urlData.status,
    expiresAt: urlData.expiresAt,
    hasPassword: !!urlData.password,
  };

  return <UrlInfoClient urlData={safeData} />;
}
