import { Sidebar } from '../components/sidebar';
export const metadata = {
  title: 'Dashboard | LinkSnip',
  description:
    'Manage and track your shortened links in one centralized dashboard.',
  openGraph: {
    title: 'Dashboard | LinkSnip',
    description:
      'Manage and track your shortened links in one centralized dashboard.',
    url: 'https://urlsnip.vercel.app/dashboard',
    images: [
      {
        url: 'https://urlsnip.vercel.app/screenshots/dashboard.png',
        width: 1200,
        height: 630,
        alt: 'LinkSnip Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | LinkSnip',
    description:
      'Manage and track your shortened links in one centralized dashboard.',
    images: ['https://urlsnip.vercel.app/screenshots/dashboard.png'],
  },
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <main id="main-content" className="min-w-0 md:pl-72">
        {children}
      </main>
    </div>
  );
}
