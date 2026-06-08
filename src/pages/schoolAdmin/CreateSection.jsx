import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function CreateSection() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selectedClassLevel, setSelectedClassLevel] = useState("");
  
  // Data for foreign key dropdown
  const [classLevels, setClassLevels] = useState([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassLevels = async () => {
      try {
        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${baseUrl}v1/academics/class-levels/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setClassLevels(data.results || data);
        }
      } catch (err) {
        console.error("Failed to fetch class levels:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchClassLevels();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedClassLevel) {
      setError("Please select a parent Class Level.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const payload = {
        name: name,
        class_level: selectedClassLevel
      };

      const response = await fetch(`${baseUrl}v1/academics/sections/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to create Section.";
        if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMsg);
      }

      alert("Section created successfully!");
      navigate("/school-admin");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Create Section">
      <div className="px-8 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE FORM */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0f9d58]">groups</span>
                  Define New Section
                </h3>
                <p className="text-[#6b7280] mt-1">
                  Establish a specific classroom division linked to a primary Class Level.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Parent Class Level</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">school</span>
                    <select
                      required
                      value={selectedClassLevel}
                      onChange={e => setSelectedClassLevel(e.target.value)}
                      className="w-full bg-[#eff4ff] pl-12 pr-4 py-3.5 rounded-md outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all appearance-none font-medium text-slate-700"
                    >
                      <option value="">Select Base Class Level...</option>
                      {initialLoading ? (
                        <option disabled>Loading data...</option>
                      ) : (
                        classLevels.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.name} (Numeric Sort: {lvl.numeric_order})
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Section Identifier</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Section A, Batch Alpha, Honors"
                    className="w-full bg-[#eff4ff] rounded-md px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
                  />
                  <p className="text-xs text-gray-500 ml-1 mt-1">
                    Combined together, this will read as "[Class Level] - [Section]" in the frontend.
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => navigate("/school-admin")}
                    className="px-6 py-3 rounded-md text-gray-600 font-semibold hover:bg-[#eff4ff] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#0f9d58] to-[#0b8043] text-white rounded-md font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    )}
                    Create Section
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="w-full lg:w-[350px] space-y-6">
            <div className="bg-[#e6f4ea] rounded-xl p-6 relative overflow-hidden border border-green-200">
              <h4 className="font-bold text-[#0b8043] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">account_tree</span>
                Relational Database Map
              </h4>
              <ul className="space-y-4 text-sm text-green-900/80">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0b8043] rounded-full mt-2 shrink-0"></span>
                  <p>In Django, `Section` holds a ForeignKey to `ClassLevel`.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0b8043] rounded-full mt-2 shrink-0"></span>
                  <p>This strict schema ensures students can be queried via `student.enrollment.section.class_level` for powerful analytics.</p>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] text-white rounded-xl p-6 shadow-lg">
               <h4 className="font-bold mb-2">Did you know?</h4>
               <p className="text-sm text-slate-300">
                 Using UUIDs rather than integer IDs across these relations makes your SaaS architecture significantly more resilient against data enumeration attacks.
               </p>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}