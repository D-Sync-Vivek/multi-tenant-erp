import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState } from "react";

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    schoolName: "St. Augustine International Academy",
    email: "admin@staugustine.edu",
    phone: "+1 (555) 0123-4567",
    country: "United States",
    address: "742 Evergreen Terrace, Springfield",
    language: "English",
    timezone: "GMT-05",
    grading: "4.0 GPA",
    attendance: true,
    academicYear: "2023-2024"
  });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  // FIXED TOGGLE: Uses a slightly wider container to prevent jumpiness
  const toggleAttendance = () => setForm({ ...form, attendance: !form.attendance });

  const save = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate server delay for presentation effect
    setTimeout(() => {
      setIsSaving(false);
      alert("Configuration updated successfully!");
    }, 1000);
  };

  return (
    <SchoolLayout title="Settings">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#0b1c30] mb-2">School Configuration</h1>
          <p className="text-[#6b7280]">Manage your institution's identity and academic parameters.</p>
        </div>

        <form onSubmit={save} className="space-y-14">
          {/* SCHOOL PROFILE */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl font-bold text-[#0b1c30] mb-2">School Profile</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">Public identity details for your reports and communication.</p>
            </div>

            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <div className="flex gap-8 items-start mb-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl bg-[#e5eeff] flex items-center justify-center border-2 border-dashed border-[#0058be]/30">
                    <span className="material-symbols-outlined text-4xl text-[#0058be]/50">school</span>
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 rounded-lg bg-[#0058be] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div>
                  <p className="font-bold text-[#0b1c30]">Institution Logo</p>
                  <p className="text-sm text-[#6b7280] mb-4">Recommended: 400x400px. PNG/SVG.</p>
                  <button type="button" className="px-5 py-2 bg-[#eff4ff] text-[#0058be] font-bold text-sm rounded-md hover:bg-[#e5eeff] transition-colors">Upload New Logo</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {['schoolName', 'email', 'phone'].map((field) => (
                  <div key={field}>
                    <label className="text-[10px] font-black tracking-widest text-[#6b7280] uppercase mb-2 block">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input name={field} value={form[field]} onChange={change} className="w-full bg-[#f9fbff] border border-slate-200 px-4 py-3 rounded-lg outline-none focus:border-[#0058be] transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#6b7280] uppercase mb-2 block">Country</label>
                  <select name="country" value={form.country} onChange={change} className="w-full bg-[#f9fbff] border border-slate-200 px-4 py-3 rounded-lg outline-none cursor-pointer">
                    <option>United States</option><option>India</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black tracking-widest text-[#6b7280] uppercase mb-2 block">Street Address</label>
                  <input name="address" value={form.address} onChange={change} className="w-full bg-[#f9fbff] border border-slate-200 px-4 py-3 rounded-lg outline-none focus:border-[#0058be] transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* ACADEMIC PREFERENCES */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl font-bold text-[#0b1c30] mb-2">Academic Preferences</h3>
              <p className="text-sm text-[#6b7280]">Define operational logic for grading and reporting cycles.</p>
            </div>

            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-8">
              {[
                { label: "Grading Scale System", sub: "Choose how performance is evaluated.", key: "grading", type: "select" },
                { label: "Attendance Tracking", sub: "Automated alerts for absences.", key: "attendance", type: "toggle" },
                { label: "Default Academic Year", sub: "Active period for registrations.", key: "academicYear", type: "select" }
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-center pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-[#0b1c30]">{item.label}</p>
                    <p className="text-xs text-[#6b7280]">{item.sub}</p>
                  </div>
                  {item.type === "toggle" ? (
                    <button type="button" onClick={toggleAttendance} className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${form.attendance ? "bg-[#0058be]" : "bg-slate-300"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.attendance ? "translate-x-7" : "translate-x-0"}`} />
                    </button>
                  ) : (
                    <select name={item.key} value={form[item.key]} onChange={change} className="bg-[#f9fbff] border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold">
                      <option>4.0 GPA Scale</option><option>Percentage (0-100)</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
            <button type="button" onClick={() => window.location.reload()} className="px-6 py-3 text-[#0b1c30] font-bold text-sm hover:underline">Discard</button>
            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[#0058be] text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-200 hover:bg-[#00489c] transition-all flex items-center gap-2">
              {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}