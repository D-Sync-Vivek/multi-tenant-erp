import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";

export default function Teachers() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      // DRF ViewSets use GET to list records
      const response = await fetch(`${baseUrl}v1/profiles/teachers/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teacher directory.");
      }

      const data = await response.json();
      
      // Handle DRF pagination structure
      if (data.results) {
        setTeachers(data.results);
        setTotalCount(data.count);
      } else {
        setTeachers(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Fetch Teachers Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate initials for avatar placeholder
  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "TR";
  };

  return (
    <SchoolLayout title="Teachers">
      {/* breadcrumb */}
      <div className="px-8 pt-8 mb-8 flex justify-between items-end max-w-7xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            Faculty Directory
          </h2>
          <p className="text-[#6b7280] mt-1">
            Manage and oversee all teaching staff across departments.
          </p>
        </div>

        <button
          onClick={() => navigate("/school-admin/teachers/create")}
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-to-br from-[#0058be] to-[#2170e4] text-white font-semibold shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] transition"
        >
          <span className="material-symbols-outlined">add</span>
          Add Teacher
        </button>
      </div>

      <div className="px-8 pb-12 max-w-7xl mx-auto">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* table */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <div className="p-6 flex justify-between bg-[#eff4ff] border-b border-blue-50">
            <div className="flex gap-3">
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  search
                </span>
                <input
                  placeholder="Search faculty..."
                  className="w-full bg-white pl-9 pr-4 py-2 rounded-md text-sm border-transparent focus:border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="text-sm text-[#6b7280] font-medium flex items-center">
              Showing {teachers.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-xs text-[#727785] uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5">Profile</th>
                  <th className="px-6 py-5">Name & Contact</th>
                  <th className="px-6 py-5">Qualification</th>
                  <th className="px-6 py-5">Employee ID</th>
                  <th className="px-6 py-5">Joining Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[#0058be]">progress_activity</span>
                        Loading faculty profiles...
                      </div>
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      No teachers found in this institution.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr 
                      key={t.id}
                      className="hover:bg-[#fcfdff] cursor-pointer transition-colors"
                      onClick={() => navigate(`/school-admin/teachers/${t.id}`)}
                    >
                      <td className="px-8 py-6">
                        {t.profile_picture ? (
                          <img
                            src={t.profile_picture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e5eeff] to-[#cce0ff] text-[#0058be] flex items-center justify-center font-bold text-sm shadow-inner border border-white">
                            {getInitials(t.first_name, t.last_name, t.email)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-6">
                        <div className="font-semibold text-gray-900">
                          {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}` : "Pending Name"}
                        </div>
                        <div className="text-xs text-[#6b7280] font-mono mt-1">
                          {t.email || "No email"}
                        </div>
                        <div className="text-xs text-[#6b7280] mt-0.5">
                          {t.phone_number || "No phone"}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e9ddff] text-[#6b38d4]">
                          {t.qualification || "Unspecified"}
                        </span>
                      </td>

                      <td className="px-6 py-6 text-sm text-slate-800 font-mono font-medium">
                        {t.employee_id || "N/A"}
                      </td>

                      <td className="px-6 py-6 text-sm text-[#6b7280]">
                        {t.joining_date ? new Date(t.joining_date).toLocaleDateString() : "Unknown"}
                      </td>

                      <td className="px-6 text-right">
                        <span className="material-symbols-outlined text-[#6b7280]">
                          chevron_right
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex justify-between items-center px-8 py-4 border-t border-gray-100 bg-gray-50 text-sm">
            <button className="text-[#0058be] flex gap-1 items-center text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Previous
            </button>

            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-md bg-[#0058be] text-white text-xs font-bold shadow-sm">
                1
              </button>
            </div>

            <button className="text-[#0058be] flex gap-1 items-center text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
              Next
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* analytics */}
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-[#0058be] to-[#2170e4] rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 opacity-10">
              <span className="material-symbols-outlined text-9xl">school</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 relative z-10">
              Faculty Capacity Overview
            </h3>
            <p className="text-blue-100 text-sm mb-6 max-w-md relative z-10">
              Tenant-isolated educator profiles currently active in your institutional database.
            </p>

            <div className="flex gap-10 relative z-10">
              <div>
                <p className="text-3xl font-bold">{totalCount}</p>
                <p className="text-xs uppercase opacity-70 mt-1">Total Faculty</p>
              </div>

              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-xs uppercase opacity-70 mt-1">Profile Sync</p>
              </div>
            </div>
          </div>

          {/* insight */}
          <div className="bg-white border border-[#d9b39a] rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f2dfd0] rounded-full opacity-50"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#9a4d00] mb-4 text-3xl">
                database
              </span>
              <h4 className="font-bold text-[#3a1f0b] text-lg">
                Relational Logic
              </h4>
              <p className="text-sm text-[#6b3b13] mt-2 leading-relaxed">
                This table pulls directly from your `TeacherProfile` ViewSet, providing domain-specific fields like Employee ID linked securely to the base user identity.
              </p>
            </div>
          </div>
        </div>

      </div>
    </SchoolLayout>
  );
}