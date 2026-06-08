import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function ParentStudentMapping() {
  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/profiles/parent-student-mappings/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch relationship mappings.");
      }

      const data = await response.json();
      
      if (data.results) {
        setMappings(data.results);
        setTotalCount(data.count);
      } else {
        setMappings(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Fetch Mappings Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "PR";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = ["bg-[#d8e2ff] text-[#0058be]", "bg-[#ffdcc6] text-[#924700]", "bg-[#e9ddff] text-[#6b38d4]"];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-6xl mx-auto px-8 pt-6 pb-12">
        
        {/* header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Relationship Management</h2>
            <p className="text-[#6b7280] mt-2 max-w-2xl">
              Configure and manage the legal and academic connections between students and their guardians. Ensure accurate data flow for emergency contacts and academic reporting.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/mapping/create")}
            className="px-6 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Add Mapping
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="md:col-span-2 bg-white p-6 rounded-xl flex justify-between shadow-sm border border-gray-100">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">Total Mappings</p>
              <h3 className="text-4xl font-bold text-[#0058be] mt-1">{totalCount}</h3>
              <p className="text-xs font-medium text-[#924700] mt-2 bg-orange-50 w-max px-2 py-1 rounded">
                Active Connections
              </p>
            </div>
            <div className="w-24 h-24 rounded-full bg-[#eff4ff] flex items-center justify-center border border-blue-50">
              <span className="material-symbols-outlined text-[#0058be] text-4xl">hub</span>
            </div>
          </div>

          <div className="bg-[#eff4ff] p-6 rounded-xl shadow-sm border border-blue-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0058be]">Sync Rate</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">100%</h3>
            <div className="h-1.5 bg-[#d8e2ff] rounded-full mt-4">
              <div className="bg-[#0058be] w-full h-full rounded-full"></div>
            </div>
          </div>

          <div className="bg-[#fff4ed] p-6 rounded-xl shadow-sm border border-orange-100">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#924700]">Orphaned Profiles</p>
            <h3 className="text-2xl font-bold text-[#924700] mt-1">0</h3>
            <p className="text-xs mt-2 font-medium text-orange-800">All students mapped</p>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 flex justify-between items-center bg-[#f8f9ff] border-b border-gray-100">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">
                search
              </span>
              <input
                placeholder="Search connections..."
                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-md outline-none border border-gray-200 focus:border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 transition-all shadow-sm"
              />
            </div>

            <div className="text-sm text-[#6b7280] font-medium flex items-center">
              Showing {mappings.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs text-[#6b7280] uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Guardian Info</th>
                  <th className="px-6 py-4 font-semibold">Student Info</th>
                  <th className="px-6 py-4 font-semibold">Relationship</th>
                  <th className="px-6 py-4 font-semibold text-center">Permissions</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[#0058be]">progress_activity</span>
                        Loading relationship mappings...
                      </div>
                    </td>
                  </tr>
                ) : mappings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No parent-student mappings established yet.
                    </td>
                  </tr>
                ) : (
                  mappings.map((m, i) => (
                    <tr key={m.id} className="hover:bg-[#fcfdff] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getColorClass(i)}`}>
                            {getInitials(m.parent_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{m.parent_name || "Unknown Parent"}</p>
                            {m.is_primary_contact && (
                              <span className="text-[10px] uppercase font-bold text-[#0058be] bg-blue-50 px-1.5 py-0.5 rounded">Primary Contact</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <span className="material-symbols-outlined text-slate-500 text-[16px]">school</span>
                          </div>
                          <span className="font-medium text-slate-800">{m.student_name || "Unknown Student"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#e9ddff] text-[#6b38d4] border border-[#d6beff]">
                          {m.relationship || "Guardian"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <span title="Academics Access" className={`material-symbols-outlined text-[18px] ${m.can_view_academics ? 'text-green-600' : 'text-gray-300'}`}>
                            menu_book
                          </span>
                          <span title="Fee Payment Access" className={`material-symbols-outlined text-[18px] ${m.can_pay_fees ? 'text-blue-600' : 'text-gray-300'}`}>
                            payments
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Verified Sync
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button className="flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Previous
            </button>
            <div className="flex gap-1">
              <span className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0058be] text-white text-sm font-bold shadow-sm">1</span>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
              Next
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* insight */}
        <div className="mt-10 bg-gradient-to-r from-[#ffdcc6]/60 to-[#ffc9aa]/40 p-6 rounded-xl flex gap-4 border border-[#ffc9aa] shadow-sm">
          <span className="material-symbols-outlined text-[#924700] text-3xl">lightbulb</span>
          <div>
            <h4 className="font-bold text-[#924700]">Data Architecture Insight</h4>
            <p className="text-sm text-[#924700]/90 mt-1 leading-relaxed">
              These mappings power Django's reverse relation queries. When a parent logs in, the backend filters the `StudentProfile` ViewSet specifically to these mapped IDs, ensuring zero data leakage.
            </p>
          </div>
        </div>

      </div>
    </SchoolLayout>
  );
}