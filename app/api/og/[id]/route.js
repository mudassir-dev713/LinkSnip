import { ImageResponse } from 'next/og';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';

export const runtime = 'nodejs';

let fontsPromise = null;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(
        'https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5.0.18/files/space-grotesk-latin-700-normal.woff'
      ).then((r) => {
        if (!r.ok) throw new Error('font fetch failed');
        return r.arrayBuffer();
      }),
      fetch(
        'https://cdn.jsdelivr.net/npm/@fontsource/outfit@5.0.18/files/outfit-latin-400-normal.woff'
      ).then((r) => {
        if (!r.ok) throw new Error('font fetch failed');
        return r.arrayBuffer();
      }),
    ]).catch(() => null);
  }
  return fontsPromise;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'link';
  }
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

/**
 * Dynamic Open Graph image for a short link — used as og:image on the
 * visitor interstitial so shared links get a real preview card.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  if (!id || !/^[a-f\d]{24}$/i.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  await dbConnect();
  const doc = await ShortUrl.findById(id)
    .select('title fullUrl status shortUrl')
    .lean();
  if (!doc) {
    return new Response('Not found', { status: 404 });
  }

  const fonts = await loadFonts();
  const domain = hostnameOf(doc.fullUrl);
  const rawTitle = doc.title && doc.title !== 'Untitled Link' ? doc.title : domain;
  const title = truncate(rawTitle, 72);
  const status =
    doc.status === 'inactive' ? 'Paused' : doc.status === 'expired' ? 'Expired' : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f4f6f7',
          color: '#14181a',
          padding: '64px',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#0f7a80',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 700,
              }}
            >
              L
            </div>
            <div style={{ fontSize: '30px', color: '#3d474b', fontWeight: 700 }}>LinkSnip</div>
          </div>
          {status && (
            <div
              style={{
                fontSize: '24px',
                color: '#0f7a80',
                border: '2px solid rgba(15,122,128,0.35)',
                borderRadius: '8px',
                padding: '6px 16px',
              }}
            >
              {status}
            </div>
          )}
        </div>

        {/* Title + destination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-2px',
              maxWidth: '1040px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: '#5a6468',
              fontSize: '34px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(15,122,128,0.12)',
                color: '#0f7a80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 700,
              }}
            >
              {domain.charAt(0).toUpperCase()}
            </div>
            <div>{truncate(domain, 44)}</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#7a8488',
            fontSize: '24px',
          }}
        >
          <div>linksnip.app/{doc.shortUrl}</div>
          <div style={{ color: '#0f7a80', fontWeight: 700 }}>Short link</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts
        ? [
            { name: 'Space Grotesk', data: fonts[0], weight: 700 },
            { name: 'Outfit', data: fonts[1], weight: 400 },
          ]
        : undefined,
    }
  );
}
