export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://urlsnip.vercel.app/sitemap.xml',
    host: 'https://urlsnip.vercel.app',
  };
}