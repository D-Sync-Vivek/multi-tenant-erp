// src/components/erp/parent/Navbar.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full sticky top-0 z-40
                       bg-white/80 dark:bg-slate-900/80
                       backdrop-blur-xl
                       border-b border-slate-200 dark:border-slate-700/50
                       flex justify-between items-center px-6 h-16
                       transition-colors duration-300">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 md:hidden cursor-pointer">menu</span>
        <h1 className="text-xl font-bold tracking-tight text-blue-800 dark:text-blue-300 font-headline">
          The Academic Architect
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Alexander Pierce</span>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <span className="material-symbols-outlined text-blue-700 dark:text-blue-400 cursor-pointer">search</span>
        <button
          onClick={() => navigate("/parent/notifications")}
          className="relative text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;