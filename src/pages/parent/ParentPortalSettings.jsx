// src/pages/parent/ParentPortalSettings.jsx

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`w-9 h-5 rounded-full relative transition-colors duration-200
      ${enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
  >
    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all duration-200
      ${enabled ? "right-1" : "left-1"}`}
    />
  </button>
);

// ─── Country codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: "+1",   iso: "us", name: "US",  maxDigits: 10 },
  { code: "+44",  iso: "gb", name: "UK",  maxDigits: 10 },
  { code: "+91",  iso: "in", name: "IN",  maxDigits: 10 },
  { code: "+92",  iso: "pk", name: "PK",  maxDigits: 10 },
  { code: "+971", iso: "ae", name: "UAE", maxDigits: 9  },
  { code: "+966", iso: "sa", name: "SA",  maxDigits: 9  },
  { code: "+61",  iso: "au", name: "AU",  maxDigits: 9  },
  { code: "+49",  iso: "de", name: "DE",  maxDigits: 11 },
  { code: "+33",  iso: "fr", name: "FR",  maxDigits: 9  },
  { code: "+86",  iso: "cn", name: "CN",  maxDigits: 11 },
  { code: "+81",  iso: "jp", name: "JP",  maxDigits: 10 },
  { code: "+55",  iso: "br", name: "BR",  maxDigits: 11 },
  { code: "+27",  iso: "za", name: "ZA",  maxDigits: 9  },
  { code: "+234", iso: "ng", name: "NG",  maxDigits: 10 },
  { code: "+20",  iso: "eg", name: "EG",  maxDigits: 10 },
  { code: "+62",  iso: "id", name: "ID",  maxDigits: 12 },
  { code: "+880", iso: "bd", name: "BD",  maxDigits: 10 },
  { code: "+90",  iso: "tr", name: "TR",  maxDigits: 10 },
  { code: "+98",  iso: "ir", name: "IR",  maxDigits: 10 },
  { code: "+7",   iso: "ru", name: "RU",  maxDigits: 10 },
];

function FlagImg({ iso }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${iso}.png`}
      srcSet={`https://flagcdn.com/w40/${iso}.png 2x`}
      alt={iso}
      className="rounded-sm object-cover flex-shrink-0"
      style={{ width: "18px", height: "13px" }}
    />
  );
}

function CountryCodePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ minWidth: "82px" }}
        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700
                   rounded-lg px-2.5 py-2 text-xs font-medium
                   text-slate-800 dark:text-white
                   hover:bg-slate-200 dark:hover:bg-slate-600
                   transition-colors focus:outline-none"
      >
        <FlagImg iso={selected.iso} />
        <span>{selected.code}</span>
        <span className="material-symbols-outlined text-slate-400 dark:text-slate-300" style={{ fontSize: "14px" }}>
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-slate-800
                     rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden"
          style={{ minWidth: "148px" }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: "176px" }}>
            {COUNTRY_CODES.map(({ code, iso, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => { onChange(code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs
                  hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left
                  ${code === value
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold"
                    : "text-slate-800 dark:text-white"
                  }`}
              >
                <FlagImg iso={iso} />
                <span className="font-medium">{name}</span>
                <span className="ml-auto text-slate-400 dark:text-slate-300">{code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
const ParentPortalSettings = () => {

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("parent_theme") === "dark"
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("parent_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("parent_theme", "light");
    }
  }, [isDark]);

  const [notifs, setNotifs]           = useState({ email: true, push: true, sms: false });
  const [saved, setSaved]             = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone]             = useState("5550123456");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls =
    "w-full rounded-lg px-3 py-2 text-xs border-none outline-none " +
    "bg-slate-100 dark:bg-slate-700 " +
    "text-slate-800 dark:text-white " +
    "placeholder:text-slate-400 dark:placeholder:text-slate-400 " +
    "focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <DashboardLayout>
      <div className="h-full p-4 md:p-5 max-w-7xl mx-auto flex flex-col gap-4">

        {/* Header */}
        <div>
          <h1 className="text-base font-bold font-headline text-slate-800 dark:text-white">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
            Manage your account preferences and configuration.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 flex-1">

          {/* ── Account Profile ── */}
          <section className="col-span-12 lg:col-span-7
                              bg-white dark:bg-slate-800
                              rounded-xl shadow-sm border border-slate-200 dark:border-slate-700
                              p-4 flex flex-col transition-colors duration-300">

            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-lg material-symbols-outlined text-base">person</span>
              <h2 className="text-sm font-bold font-headline text-slate-800 dark:text-white">Account Profile</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                <input type="text" defaultValue="Alex Harrison" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
                <input type="email" defaultValue="alex.harrison@edu-mail.com" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-1.5">
                  <CountryCodePicker value={countryCode} onChange={(c) => { setCountryCode(c); setPhone(""); }} />
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        const sel = COUNTRY_CODES.find((c) => c.code === countryCode);
                        if (onlyNums.length <= (sel?.maxDigits || 10)) setPhone(onlyNums);
                      }}
                      placeholder="Phone number"
                      className={inputCls}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-300 pointer-events-none">
                      {phone.length}/{COUNTRY_CODES.find((c) => c.code === countryCode)?.maxDigits || 10}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Relationship</label>
                <select className={inputCls}>
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Legal Guardian</option>
                </select>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all"
              >
                <span className="material-symbols-outlined text-sm">{saved ? "check" : "save"}</span>
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </section>

          {/* ── Right column ── */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">

            {/* Language & Appearance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm
                            border border-slate-200 dark:border-slate-700
                            p-4 flex flex-col gap-3 transition-colors duration-300">

              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg material-symbols-outlined text-base">language</span>
                <h2 className="text-sm font-bold font-headline text-slate-800 dark:text-white">Language &amp; Appearance</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Language</label>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <span className="text-xs font-medium text-slate-800 dark:text-white">English (US)</span>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-300 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Timezone</label>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <span className="text-xs font-medium text-slate-800 dark:text-white">GMT−05:00 ET</span>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-300 text-sm">expand_more</span>
                  </div>
                </div>
              </div>

              {/* ── LIGHT / DARK BUTTONS ── */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDark(false)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg
                              border text-xs font-semibold transition-all duration-200
                              ${!isDark
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300"
                                : "border-transparent bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                              }`}
                >
                  <span className="material-symbols-outlined text-base">light_mode</span>
                  Light
                </button>

                <button
                  type="button"
                  onClick={() => setIsDark(true)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg
                              border text-xs font-semibold transition-all duration-200
                              ${isDark
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                                : "border-transparent bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                              }`}
                >
                  <span className="material-symbols-outlined text-base">dark_mode</span>
                  Dark
                </button>
              </div>
            </div>

            {/* AI Configuration */}
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4
                            border-l-4 border-amber-500 flex items-center justify-between gap-3
                            transition-colors duration-300">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-300 text-base mt-0.5">auto_awesome</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">AI Configuration</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5 leading-relaxed">Customize how AI analyzes your child's performance.</p>
                </div>
              </div>
              <button className="flex-shrink-0 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
                Manage →
              </button>
            </div>

            {/* Account Security */}
            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4
                            flex items-center justify-between gap-3
                            transition-colors duration-300">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 dark:text-red-300 text-base mt-0.5">warning</span>
                <div>
                  <h3 className="text-xs font-bold text-red-600 dark:text-red-300">Account Security</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5 leading-relaxed">Reset password or sign out of all devices.</p>
                </div>
              </div>
              <button className="flex-shrink-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors whitespace-nowrap">
                Sign Out All
              </button>
            </div>
          </div>

          {/* ── Notifications ── */}
          <section className="col-span-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm
                              border border-slate-200 dark:border-slate-700
                              p-4 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-lg material-symbols-outlined text-base">notifications_active</span>
              <h2 className="text-sm font-bold font-headline text-slate-800 dark:text-white">Notification Preferences</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "email", icon: "mail",      label: "Email Summaries",    desc: "Weekly digests of child progress"   },
                { key: "push",  icon: "smartphone", label: "Push Notifications", desc: "Real-time alerts for absences"      },
                { key: "sms",   icon: "sms",        label: "SMS Alerts",         desc: "Emergency weather or security info" },
              ].map(({ key, icon, label, desc }) => (
                <div key={key}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl
                             bg-slate-50 dark:bg-slate-700/50
                             hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className={`material-symbols-outlined text-base ${notifs[key] ? "text-blue-600 dark:text-blue-300" : "text-slate-400 dark:text-slate-300"}`}>{icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Toggle enabled={notifs[key]} onToggle={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))} />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentPortalSettings;