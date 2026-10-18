import './globals.css';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Provider from '@/components/Provider';
import QueryProvider from '@/components/QueryProvider';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { Provider as TextWrapProvider } from 'react-wrap-balancer';
import { getServerSession } from 'next-auth';

import { Outfit, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-outfit',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const metadata = {
  metadataBase: new URL('https://urlsnip.vercel.app'),
  title: {
    default: 'LinkSnip - URL shortener with analytics',
    template: '%s | LinkSnip',
  },
  description:
    'Shorten URLs and track every click. Analytics, QR codes, passwords and link expiry in one clean dashboard.',
  keywords: [
    'URL shortener',
    'link tracker',
    'link analytics',
    'LinkSnip',
    'short link',
    'track URL',
  ],
  openGraph: {
    title: 'LinkSnip - URL shortener with analytics',
    description:
      'Shorten URLs and track every click. Analytics, QR codes, passwords and link expiry in one clean dashboard.',
    url: 'https://urlsnip.vercel.app',
    siteName: 'LinkSnip',
    images: [
      {
        url: 'https://urlsnip.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkSnip - URL shortener with analytics',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkSnip',
    description:
      'Shorten URLs and track every click. Analytics, QR codes, passwords and link expiry in one clean dashboard.',
    images: ['https://urlsnip.vercel.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#0a0b10',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="LinkSnip" />
        <meta name="apple-mobile-web-app-title" content="LinkSnip" />
        <meta
          name="description"
          content="Shorten URLs and track every click. Analytics, QR codes, passwords and link expiry in one clean dashboard."
        />
        {/* Android  & Ios Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0b10" />
        <meta name="msapplication-TileColor" content="#0a0b10" />

        {/* Open Graph Meta Tags (SEO + Social) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://urlsnip.vercel.app/" />
        <meta
          property="og:title"
          content="LinkSnip - URL shortener with analytics"
        />
        <meta
          property="og:description"
          content="Shorten URLs and track every click. Analytics, QR codes, passwords and link expiry in one clean dashboard."
        />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card Meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://urlsnip.vercel.app/" />
        <meta
          name="twitter:title"
          content="LinkSnip - URL shortener with analytics"
        />
        <meta
          name="twitter:description"
          content="Shorten URLs and track every click. Analytics, QR codes, passwords and link expiry in one clean dashboard."
        />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "LinkSnip",
            "url": "https://urlsnip.vercel.app",
            "description": "Modern URL shortener with analytics",
            "applicationCategory": "Utilities",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>

        {/* Theme Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('vite-ui-theme') || 'dark';
                  if (theme === 'system') {
                    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = isDark ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <QueryProvider>
          <Provider session={session}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              storageKey="vite-ui-theme"
            >
              <SmoothScrollProvider>
                <TextWrapProvider>{children}</TextWrapProvider>
              </SmoothScrollProvider>
              <Toaster />
            </ThemeProvider>
          </Provider>
        </QueryProvider>
      </body>
    </html>
  );
}