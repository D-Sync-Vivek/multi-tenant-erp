import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from "../../components/erp/parent/DashboardLayout";

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${enabled ? "bg-primary" : "bg-outline-variant/40"}`}
  >
    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${enabled ? "right-1" : "left-1"}`} />
  </button>
);

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

function FlagImg({ iso, className = "" }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${iso}.png`}
      srcSet={`https://flagcdn.com/w40/${iso}.png 2x`}
      alt={iso}
      className={`rounded-sm object-cover flex-shrink-0 ${className}`}
      style={{ width: "18px", height: "13px" }}
    />
  );
}

/* Custom flag dropdown — opens downward, compact, shows flag */
function CountryCodePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-surface-container-low rounded-lg px-2.5 py-2 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-surface-tint"
        style={{ minWidth: "82px" }}
      >
        <FlagImg iso={selected.iso} />
        <span>{selected.code}</span>
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "14px" }}>
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Dropdown panel — opens downward */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden"
          style={{ minWidth: "148px" }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: "176px" }}>
            {COUNTRY_CODES.map(({ code, iso, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => { onChange(code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-surface-container-low transition-colors text-left ${
                  code === value ? "bg-primary/5 text-primary font-semibold" : "text-on-surface"
                }`}
              >
                <FlagImg iso={iso} />
                <span className="font-medium">{name}</span>
                <span className="ml-auto text-on-surface-variant">{code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ParentPortalSettings = () => {
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false });
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("5550123-4567");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="h-full p-4 md:p-5 max-w-7xl mx-auto flex flex-col gap-4">

        {/* Header */}
        <div>
          <h1 className="text-base font-bold font-headline text-on-surface">Settings</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Manage your account preferences and configuration.</p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 flex-1">

          {/* ── Account Profile ── */}
          <section className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-primary/10 text-primary rounded-lg material-symbols-outlined text-base">person</span>
              <h2 className="text-sm font-bold font-headline text-on-surface">Account Profile</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alex Harrison"
                  className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-surface-tint focus:outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  defaultValue="alex.harrison@edu-mail.com"
                  className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-surface-tint focus:outline-none transition-all"
                />
              </div>

              {/* Phone with country code */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="flex gap-1.5">
                  <CountryCodePicker value={countryCode} onChange={(c) => { setCountryCode(c); setPhone(""); }} />
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        const selected = COUNTRY_CODES.find(c => c.code === countryCode);
                        const max = selected?.maxDigits || 10;
                        if (onlyNums.length <= max) setPhone(onlyNums);
                      }}
                      placeholder={`${COUNTRY_CODES.find(c => c.code === countryCode)?.maxDigits || 10} digits`}
                      maxLength={COUNTRY_CODES.find(c => c.code === countryCode)?.maxDigits || 10}
                      className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-surface-tint focus:outline-none transition-all"
                    />
                    {/* digit counter */}
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant pointer-events-none">
                      {phone.length}/{COUNTRY_CODES.find(c => c.code === countryCode)?.maxDigits || 10}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relationship */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Relationship</label>
                <select className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs text-on-surface focus:ring-2 focus:ring-surface-tint focus:outline-none transition-all">
                  <option>Mother</option>
                  <option>Father</option>
                  <option defaultValue>Legal Guardian</option>
                </select>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-outline-variant/10 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">{saved ? "check" : "save"}</span>
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </section>

          {/* ── Right column ── */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">

            {/* Language & Appearance in one card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-secondary/10 text-secondary rounded-lg material-symbols-outlined text-base">language</span>
                <h2 className="text-sm font-bold font-headline text-on-surface">Language &amp; Appearance</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Language</label>
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="text-xs font-medium text-on-surface">English (US)</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Timezone</label>
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="text-xs font-medium text-on-surface">GMT−05:00 ET</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Theme toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">light_mode</span>
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">dark_mode</span>
                  Dark
                </button>
              </div>
            </div>

            {/* AI Configuration */}
            <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-500 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">auto_awesome</span>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">AI Configuration</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Customize how AI analyzes your child's performance.</p>
                </div>
              </div>
              <button className="flex-shrink-0 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
                Manage →
              </button>
            </div>

            {/* Account Security */}
            <div className="bg-red-50 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-base mt-0.5">warning</span>
                <div>
                  <h3 className="text-xs font-bold text-red-600">Account Security</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Reset password or sign out of all devices.</p>
                </div>
              </div>
              <button className="flex-shrink-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors whitespace-nowrap">
                Sign Out All
              </button>
            </div>
          </div>

          {/* ── Notifications ── */}
          <section className="col-span-12 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-primary/10 text-primary rounded-lg material-symbols-outlined text-base">notifications_active</span>
              <h2 className="text-sm font-bold font-headline text-on-surface">Notification Preferences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "email", icon: "mail",       label: "Email Summaries",    desc: "Weekly digests of child progress"        },
                { key: "push",  icon: "smartphone",  label: "Push Notifications", desc: "Real-time alerts for absences"           },
                { key: "sms",   icon: "sms",         label: "SMS Alerts",         desc: "Emergency weather or security info"      },
              ].map(({ key, icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className={`material-symbols-outlined text-base ${notifs[key] ? "text-primary" : "text-on-surface-variant"}`}>{icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface leading-tight">{label}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Toggle
                    enabled={notifs[key]}
                    onToggle={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
                  />
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