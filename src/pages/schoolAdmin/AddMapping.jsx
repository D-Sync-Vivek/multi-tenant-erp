import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import { schoolAdminApi } from "../../services/schoolAdminApi";

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
        const [parentData, studentData] = await Promise.all([
          schoolAdminApi.getParents(),
          schoolAdminApi.getStudents()
        ]);
        
        setParents(parentData.results || parentData);
        setStudents(studentData.results || studentData);
      } catch (err) {
        console.error("Error fetching entities:", err);
        setError("Failed to load students/parents list.");
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
      const payload = {
        relationship: relation,
        is_primary_contact: isPrimaryContact,
        can_view_academics: canViewAcademics,
        can_pay_fees: canPayFees,
        parent: selectedParent,
        student: selectedStudent
      };

      await schoolAdminApi.createMapping(payload);
      
      alert("Parent-Student mapped successfully!");
      navigate("/school-admin/mapping");

    } catch (err) {
      console.error("Mapping Error:", err);
      // Use the service layer error handling pattern
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ")
        : (err.message || "Failed to create mapping.");
      
      setError(errorMsg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-6xl mx-auto space-y-10 px-8 py-10">

        {/* breadcrumb */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin")}>Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin/mapping")}>Guardians</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-[#0058be] font-bold">Add Mapping</span>
          </div>

          <button
            onClick={() => navigate("/school-admin/mapping")}
            className="flex items-center gap-2 px-4 py-2 text-[#0058be] font-bold hover:bg-[#eff4ff] rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Directory
          </button>
        </div>

        {/* heading */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Create Relationship Link</h1>
          <p className="text-[#6b7280] mt-2 text-lg max-w-2xl">
            Establish a secure relational bridge between a guardian's profile and a student's academic record.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">error</span>
             <div>
               <p className="font-bold text-sm">Mapping Failed</p>
               <p className="text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid lg:grid-cols-12 gap-10">

            {/* LEFT FORM */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0058be]">link</span>
                  Entity Selection
                </h2>

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

                <div className="border-t border-gray-100 pt-8 mb-8 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Access Permissions</h3>
                  <label className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-md cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">Primary Contact</span>
                    </div>
                    <input type="checkbox" checked={isPrimaryContact} onChange={() => setIsPrimaryContact(!isPrimaryContact)} className="w-5 h-5 rounded text-[#0058be]" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-md cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">Academic View Access</span>
                    </div>
                    <input type="checkbox" checked={canViewAcademics} onChange={() => setCanViewAcademics(!canViewAcademics)} className="w-5 h-5 rounded text-[#0058be]" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-md cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800">Fee Payment Access</span>
                    </div>
                    <input type="checkbox" checked={canPayFees} onChange={() => setCanPayFees(!canPayFees)} className="w-5 h-5 rounded text-[#0058be]" />
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => navigate("/school-admin/mapping")} className="px-8 py-3.5 text-[#6b7280] font-semibold hover:bg-gray-50 rounded-md transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="px-10 py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                    {loading ? "Syncing..." : "Establish Connection"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-[#0058be] to-[#2170e4] p-8 rounded-xl shadow-lg text-white">
                <h3 className="font-bold mb-3">Data Architecture</h3>
                <p className="text-sm text-blue-100 leading-relaxed">This operation creates a strict link in Django's relational database. A parent can be mapped to multiple students, creating dynamic access arrays.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}