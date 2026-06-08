import React, { useState } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function CreateClass() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [numericOrder, setNumericOrder] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const payload = {
        name: name,
        numeric_order: parseInt(numericOrder, 10)
      };

      const response = await fetch(`${baseUrl}v1/academics/class-levels/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to create Class Level.";
        if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMsg);
      }

      alert("Class Level created successfully!");
      navigate("/school-admin");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Create Class Level">
      <div className="px-8 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE FORM */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0058be]">meeting_room</span>
                  Define Class Level
                </h3>
                <p className="text-[#6b7280] mt-1">
                  Establish a base academic grade (e.g. "Grade 10"). You will map specific sections to this later.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Class Level Name</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Grade 10"
                    className="w-full bg-[#eff4ff] rounded-md px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Numeric Sort Order</label>
                  <input
                    type="number"
                    required
                    value={numericOrder}
                    onChange={e => setNumericOrder(e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full bg-[#eff4ff] rounded-md px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
                  />
                  <p className="text-xs text-gray-500 ml-1 mt-1">
                    Used to accurately sort classes logically (Grade 9 comes before Grade 10) instead of alphabetically.
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
                    className="px-8 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">save</span>
                    )}
                    Save Class Level
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="w-full lg:w-[350px] space-y-6">
            <div className="bg-[#dce9ff] rounded-xl p-6 relative overflow-hidden border border-blue-100">
              <h4 className="font-bold text-[#0058be] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">api</span>
                Django ORM Logic
              </h4>
              <ul className="space-y-4 text-sm text-[#374151]">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0058be] rounded-full mt-2 shrink-0"></span>
                  <p><strong>Separation of Concerns:</strong> You are creating the `ClassLevel` parent object. Sections (A, B, C) are child objects.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0058be] rounded-full mt-2 shrink-0"></span>
                  <p>Tenant filtering ensures this Class Level is strictly bound to your School ID.</p>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">account_tree</span>
              <h4 className="font-bold text-slate-800 mb-2">Next Step</h4>
              <p className="text-sm text-gray-600 mb-4">
                Once the base level is created, proceed to generate individual sections for student assignments.
              </p>
              <button 
                onClick={() => navigate("/school-admin/create-section")}
                className="text-sm font-bold text-[#0058be] border border-[#0058be]/30 px-4 py-2 rounded-md hover:bg-blue-50 w-full transition-colors"
              >
                Go to Create Section
              </button>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}