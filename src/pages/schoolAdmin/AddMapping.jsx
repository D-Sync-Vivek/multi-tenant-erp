import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function AddMapping() {
  const navigate = useNavigate();

  // API Data
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);

  // Form State
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [relation, setRelation] = useState("Father");
  const [isPrimaryContact, setIsPrimaryContact] = useState(true);
  const [canViewAcademics, setCanViewAcademics] = useState(true);
  const [canPayFees, setCanPayFees] = useState(true);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Parents and Students for the dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem("accessToken");
        const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };

        const [parentRes, studentRes] = await Promise.all([
          fetch(`${baseUrl}v1/profiles/parents/`, { headers }),
          fetch(`${baseUrl}v1/profiles/students/`, { headers })
        ]);

        if (parentRes.ok) {
          const pData = await parentRes.json();
          setParents(pData.results || pData);
        }
        
        if (studentRes.ok) {
          const sData = await studentRes.json();
          setStudents(sData.results || sData);
        }
      } catch (err) {
        console.error("Error fetching entities:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedParent || !selectedStudent) {
      setError("Please select both a parent and a student.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const payload = {
        relationship: relation,
        is_primary_contact: isPrimaryContact,
        can_view_academics: canViewAcademics,
        can_pay_fees: canPayFees,
        parent: selectedParent,
        student: selectedStudent
      };

      const response = await fetch(`${baseUrl}v1/profiles/parent-student-mappings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to create mapping.";
        if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMsg);
      }

      alert("Parent-Student mapped successfully!");
      navigate("/school-admin/mapping");

    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* breadcrumb */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#8b93a7] mb-3">
              <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin")}>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin/mapping")}>Parent-Student Mapping</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#0b1c30]">Add Mapping</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Relationship Link</h1>
            <p className="text-[#6b7280] mt-2 max-w-2xl">
              Establish a secure relational bridge between a guardian's profile and a student's academic record.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/mapping")}
            className="flex items-center gap-2 px-4 py-2 text-[#0058be] font-bold hover:bg-[#eff4ff] rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Directory
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">error</span>
             <div>
               <p className="font-bold text-sm">Mapping Failed</p>
               <p className="text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        {/* main grid */}
        <div className="grid lg:grid-cols-12 gap-10">

          {/* LEFT FORM */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">link</span>
                Entity Selection
              </h2>

              {/* selects */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Select Guardian Profile</label>
                  <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person_search</span>
                    <select 
                      required
                      value={selectedParent}
                      onChange={e => setSelectedParent(e.target.value)}
                      className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md text-sm outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                    >
                      <option value="">Select Guardian...</option>
                      {initialLoading ? (
                        <option disabled>Loading data...</option>
                      ) : (
                        parents.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.first_name || p.last_name ? `${p.first_name} ${p.last_name}` : p.email}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Select Student Profile</label>
                  <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">school</span>
                    <select 
                      required
                      value={selectedStudent}
                      onChange={e => setSelectedStudent(e.target.value)}
                      className="w-full pl-10 pr-10 py-3.5 bg-[#f8f9ff] rounded-md text-sm outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all font-medium text-slate-700 appearance-none"
                    >
                      <option value="">Select Student...</option>
                      {initialLoading ? (
                        <option disabled>Loading data...</option>
                      ) : (
                        students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.first_name || s.last_name ? `${s.first_name} ${s.last_name}` : s.email} {s.enrollment_number ? `(${s.enrollment_number})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              {/* relationship */}
              <div className="mb-10">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-3 block">Relationship Designation</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {key: "Father", icon: "man"},
                    {key: "Mother", icon: "woman"},
                    {key: "Guardian", icon: "shield"}
                  ].map(item => (
                    <div
                      key={item.key}
                      onClick={() => setRelation(item.key)}
                      className={`p-4 rounded-lg cursor-pointer flex flex-col items-center gap-2 transition-all border-2 ${
                        relation === item.key
                          ? "border-[#0058be] bg-[#e5eeff] shadow-sm"
                          : "border-transparent bg-[#f8f9ff] hover:border-blue-100"
                      }`}
                    >
                      <span className={`material-symbols-outlined ${relation === item.key ? "text-[#0058be]" : "text-gray-500"}`}>
                        {item.icon}
                      </span>
                      <span className={`text-xs font-bold tracking-wider uppercase ${relation === item.key ? "text-[#0058be]" : "text-gray-500"}`}>
                        {item.key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Flags */}
              <div className="border-t border-gray-100 pt-8 mb-8">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Access Permissions</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-md cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">Primary Contact</span>
                      <p className="text-xs text-gray-500 mt-0.5">Receive priority emergency and institutional broadcasts.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isPrimaryContact} 
                      onChange={() => setIsPrimaryContact(!isPrimaryContact)}
                      className="w-5 h-5 rounded text-[#0058be] focus:ring-[#0058be]" 
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-md cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">Academic View Access</span>
                      <p className="text-xs text-gray-500 mt-0.5">Allow parent to view grades, attendance, and assignments.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={canViewAcademics} 
                      onChange={() => setCanViewAcademics(!canViewAcademics)}
                      className="w-5 h-5 rounded text-[#0058be] focus:ring-[#0058be]" 
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-md cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">Fee Payment Access</span>
                      <p className="text-xs text-gray-500 mt-0.5">Allow parent to view invoices and process fee payments.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={canPayFees} 
                      onChange={() => setCanPayFees(!canPayFees)}
                      className="w-5 h-5 rounded text-[#0058be] focus:ring-[#0058be]" 
                    />
                  </label>
                </div>
              </div>

              {/* buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/school-admin/mapping")}
                  className="px-8 py-3.5 text-[#6b7280] font-semibold hover:bg-gray-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md shadow-lg shadow-[#0058be]/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Securing Link...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">link</span>
                      Establish Connection
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-4 space-y-6">

            {/* insight */}
            <div className="bg-gradient-to-br from-[#0058be] to-[#2170e4] p-8 rounded-xl relative shadow-lg text-white overflow-hidden">
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10">account_tree</span>
              
              <h3 className="text-xl font-bold mb-3 relative z-10 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-200">database</span>
                Data Architecture
              </h3>

              <p className="text-sm text-blue-100 mb-6 leading-relaxed relative z-10">
                This operation creates a strict link in Django's relational database. A parent can be mapped to multiple students, creating dynamic access arrays.
              </p>

              <div className="space-y-4 text-sm relative z-10">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-sm">verified_user</span>
                  </div>
                  <span className="pt-1">Validates both endpoints exist in the system.</span>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-sm">policy</span>
                  </div>
                  <span className="pt-1">Updates Parent Portal routing immediately upon save.</span>
                </div>
              </div>
            </div>

            {/* preview visual */}
            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm text-center">
              <p className="text-xs font-bold text-gray-400 tracking-widest mb-8">CONNECTION PREVIEW</p>
              
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm border ${selectedParent ? 'bg-blue-50 border-blue-200 text-[#0058be]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <span className="material-symbols-outlined text-[28px]">person</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guardian</span>
                </div>

                <div className="flex-1 border-t-2 border-dashed border-gray-200 relative">
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${selectedParent && selectedStudent ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <span className="material-symbols-outlined text-sm">link</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm border ${selectedStudent ? 'bg-purple-50 border-purple-200 text-[#6b38d4]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <span className="material-symbols-outlined text-[28px]">school</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}