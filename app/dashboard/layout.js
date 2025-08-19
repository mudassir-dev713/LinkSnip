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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex overflow-x-hidden">
      <div className=" md:block w-0 md:w-72">
        <Sidebar />
      </div>
      <main className="flex-1 min-w-0 mt-10 max-w-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
