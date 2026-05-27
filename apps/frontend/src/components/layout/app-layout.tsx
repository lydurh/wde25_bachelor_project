import { Outlet } from 'react-router';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useDocumentTitle } from '@/lib/hooks/use-document-title';

export const AppLayout = () => {
  useDocumentTitle();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
