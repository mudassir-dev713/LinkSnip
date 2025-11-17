import './globals.css';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Provider from '@/components/Provider';
import QueryProvider from '@/components/QueryProvider';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { Provider as TextWrapProvider } from 'react-wrap-balancer';
import { getServerSession } from 'next-auth';

import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
});
export const metadata = {
  metadataBase: new URL('https://urlsnip.vercel.app'),
  title: {
    default: 'LinkSnip - Modern URL Shortener',
    template: '%s | LinkSnip',
  },
  description: 'Shorten, track, and manage your URLs with style.',
  keywords: [
    'URL shortener',
    'link tracker',
    'link analytics',
    'LinkSnip',
    'short link',
    'track URL',
  ],
  themeColor: '#000000',
  openGraph: {
    title: 'LinkSnip - Modern URL Shortener',
    description: 'Shorten, track, and manage your URLs with style.',
    url: 'https://urlsnip.vercel.app',
    siteName: 'LinkSnip',
    images: [
      {
        url: 'https://urlsnip.vercel.app/og-image.jpg', // Add your OG image
        width: 1200,
        height: 630,
        alt: 'LinkSnip - Modern URL Shortener',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkSnip',
    description: 'Shorten, track, and manage your URLs with style.',
    creator: '@yourhandle', // Replace or remove
    images: ['https://urlsnip.vercel.app/og-image.png'],
  },
};
export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="LinkSnip" />
        <meta name="apple-mobile-web-app-title" content="LinkSnip" />
        <meta name="description" content="LinkSnip - Modern URL Shortener" />
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
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />

        {/* Open Graph Meta Tags (SEO + Social) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://urlsnip.vercel.app/" />
        <meta property="og:title" content="LinkSnip - Modern URL Shortener" />
        <meta
          property="og:description"
          content="Shorten, track, and manage your URLs with style."
        />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card Meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://urlsnip.vercel.app/" />
        <meta name="twitter:title" content="LinkSnip - Modern URL Shortener" />
        <meta
          name="twitter:description"
          content="Shorten, track, and manage your URLs with style."
        />
        <meta name="twitter:image" content="/og-image.png" />
        <script type="application/ld+json">
          {`
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "LinkSnip",
  "url": "https://urlsnip.vercel.app",
  "screenshot": [
    "https://urlsnip.vercel.app/screenshots/homepage.png",
    "https://urlsnip.vercel.app/screenshots/dashboard.png"
  ]
}
`}
        </script>

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
      <body className={` ${poppins.variable} ${inter.className}`}>
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
