import { Sidebar } from '../components/sidebar';
import { UrlProvider } from '@/context/urlContext';
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex overflow-x-hidden">
      <div className=" md:block w-0 md:w-72">
        <Sidebar />
      </div>
      <UrlProvider>
        <main className="flex-1 min-w-0 mt-10 max-w-screen overflow-x-hidden">
          {children}
        </main>
      </UrlProvider>
    </div>
  );
}
