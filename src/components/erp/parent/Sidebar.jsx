import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all
    ${
      isActive
        ? "bg-white text-blue-700 shadow-sm"
        : "text-slate-600 hover:bg-slate-200/50 hover:text-blue-600"
    }`;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    navigate('/');
  };

  return (

    <aside className="hidden md:flex flex-col h-screen w-72 fixed left-0 top-0 bg-[#eff4ff] border-r border-slate-200 p-4 z-50">

      {/* LOGO */}

      <div className="mb-8 px-4 py-2">

        <h1 className="text-lg font-black text-blue-800">
          Academic Architect
        </h1>

      </div>


      {/* PROFILE */}

      <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-white shadow-sm">

        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP3jfyRT4iY4LkdJUOnHyneVusf_7ngMcO-5-pONgEQ9smtNxpcbzzzEuo-76ZHnBeHODjFa2U1W5Gf-VGwfpJxXUj8VKwgRVk8dO_kl5i1y0Oc4ATMcaGD5c9FWu3GU5CRDdajVDtt2gybsx8YbTxY5trcbY0I4CGR90lpMvhqtJig81tkqqgqvlqjE3mghurDnFqga2HYCmlN1UuMj0aMb--GYL_T2ky-vdJShDA0reevT0Zoc2gcjVt1VwsCqbh5ZSnPOBcrw"
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>

          <p className="font-bold text-sm">
            Alexander Pierce
          </p>

          <p className="text-xs text-slate-500">
            Guardian ID: #8821
          </p>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="flex flex-col gap-1 flex-1">


        <NavLink to="/parent" end className={navClass}>

          <span className="material-symbols-outlined">
            dashboard
          </span>

          Dashboard

        </NavLink>


        <NavLink to="/parent/child-overview" className={navClass}>

          <span className="material-symbols-outlined">
            child_care
          </span>

          Child Overview

        </NavLink>


        <NavLink to="/parent/attendance" className={navClass}>

          <span className="material-symbols-outlined">
            calendar_today
          </span>

          Attendance

        </NavLink>


        <NavLink to="/parent/assignments" className={navClass}>

          <span className="material-symbols-outlined">
            assignment
          </span>

          Assignments

        </NavLink>


        <NavLink to="/parent/grades" className={navClass}>

          <span className="material-symbols-outlined">
            assessment
          </span>

          Grades & Report

        </NavLink>


        <NavLink to="/parent/insights" className={navClass}>

          <span className="material-symbols-outlined">
            psychology
          </span>

          AI Insights

        </NavLink>

      </nav>


      {/* SETTINGS + LOGOUT */}

      <div className="mt-auto flex flex-col gap-1">

        <NavLink to="/parent/settings" className={navClass}>

          <span className="material-symbols-outlined">
            settings
          </span>

          Settings

        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all text-red-500 hover:bg-red-50 hover:text-red-600 w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>

      </div>

    </aside>

  );

}