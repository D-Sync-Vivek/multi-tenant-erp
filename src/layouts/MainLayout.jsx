import React from 'react';
import Sidebar from '../components/shared/Sidebar';
import TopNavbar from '../components/shared/TopNavbar';

export default function MainLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-surface dark:bg-slate-900 dark:text-white">
      <Sidebar />
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen dark:bg-slate-900">
        <TopNavbar title={title} />
        <div className="p-4 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
