import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user_data"));
  const parentData = userData?.identity;
  const parentFirstName = parentData && parentData.first_name;
  const parentLastName = parentData && parentData.last_name;

  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 no-border tonal-transition bg-slate-100/50 dark:bg-slate-900/50">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-on-surface-variant md:hidden cursor-pointer">
          menu
        </span>
        <h1 className="text-xl font-bold tracking-tight text-blue-800 dark:text-blue-300 font-headline">
          The Academic Architect
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm font-medium font-inter text-blue-700 dark:text-blue-400">
            {parentFirstName[0].toUpperCase() + parentFirstName.slice(1)}{" "}
            {parentLastName[0].toUpperCase() + parentLastName.slice(1)}
          </span>
          <div className="h-8 w-px bg-outline-variant/30"></div>
        </div>
        <span className="material-symbols-outlined text-blue-700 dark:text-blue-400 cursor-pointer">
          search
        </span>
        <button
          onClick={() => navigate("/parent/notifications")}
          className="relative"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
