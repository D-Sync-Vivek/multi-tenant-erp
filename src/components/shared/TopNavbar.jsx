import React from 'react';
import { Link } from 'react-router-dom';

export default function TopNavbar({ title }) {
  return (
    <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-md dark:bg-white border-b border-surface-container/50">
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-xl font-bold font-headline text-on-background tracking-tight">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-surface-container-lowest rounded-full px-4 py-2 custom-shadow">
            <span className="material-symbols-outlined text-outline text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search grades, tasks..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 font-medium placeholder:text-outline-variant outline-none px-2"
            />
          </div>
          <Link to="/student/notifications" className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative block">
            <span className="material-symbols-outlined block">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-low"></span>
          </Link>

        </div>
      </div>
    </header>
  );
}
