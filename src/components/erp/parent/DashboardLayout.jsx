// src/components/erp/parent/DashboardLayout.jsx

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

export default function DashboardLayout({ children }) {

  useEffect(() => {
    // sessionStorage = naye browser tab/session ke saath khud reset ho jaata hai
    // (login ke baad, ya tab band karke wapas khole, ya refresh se BHI persist
    //  rehta hai jab tak tab khula hai — but naya login session => naya flag)
    const sessionInitialized = sessionStorage.getItem("parent_theme_session_init");

    if (!sessionInitialized) {
      // ── Naya session: hamesha LIGHT mode se shuru karo ──
      document.documentElement.classList.remove("dark");
      localStorage.setItem("parent_theme", "light");
      sessionStorage.setItem("parent_theme_session_init", "true");
    } else {
      // ── Same session mein refresh: user ne Settings se jo choose kiya tha wahi rakho ──
      const saved = localStorage.getItem("parent_theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">

      <Sidebar />

      <div className="flex-1 md:ml-72 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        <div className="p-8">
          {children}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}