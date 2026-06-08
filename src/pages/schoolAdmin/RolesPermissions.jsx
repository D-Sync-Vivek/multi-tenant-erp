import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";

export default function RolesPermissions() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/accounts/roles/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles.");
      }

      const data = await response.json();
      
      if (data.results) {
        setRoles(data.results);
        setTotalCount(data.count);
      } else {
        setRoles(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Fetch Roles Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Utility to dynamically assign a color and icon based on role name for aesthetic UI
  const getRoleAesthetics = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) return { icon: "admin_panel_settings", color: "#0058be" };
    if (name.includes("teacher")) return { icon: "school", color: "#6b38d4" };
    if (name.includes("finance") || name.includes("account")) return { icon: "account_balance", color: "#0f9d58" };
    if (name.includes("lib")) return { icon: "menu_book", color: "#924700" };
    return { icon: "verified_user", color: "#727785" }; // default
  };

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="pt-6 px-8 max-w-7xl mx-auto">
        {/* summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Total Roles
            </p>
            <h3 className="text-3xl font-bold text-[#0058be]">
              {totalCount}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-lg border-l-4 border-[#6b38d4] shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Custom Permissions
            </p>
            <h3 className="text-3xl font-bold">Active</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              System Health
            </p>
            <h3 className="text-3xl font-bold text-[#0f9d58]">
              Secure
            </h3>
          </div>

          <div className="flex justify-end items-center">
            <button
              onClick={() => navigate("/school-admin/roles/create")}
              className="px-6 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-semibold flex gap-2 items-center shadow-lg hover:shadow-xl transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              Create Role
            </button>
          </div>
        </div>

        {/* error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* table container */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* search */}
          <div className="p-6 flex justify-between items-center bg-[#eff4ff]">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                placeholder="Search roles..."
                className="w-full bg-white rounded-md pl-10 pr-4 py-2 outline-none border border-transparent focus:border-[#0058be]/30 transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-md shadow-sm text-sm font-medium border">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filter
              </button>
            </div>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#eff4ff] text-xs uppercase text-gray-500 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-4">Role Name</th>
                  <th className="text-center">Permissions</th>
                  <th>Description</th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                   <tr>
                     <td colSpan="4" className="text-center py-10 text-gray-500">
                       Loading roles...
                     </td>
                   </tr>
                ) : roles.length === 0 ? (
                   <tr>
                     <td colSpan="4" className="text-center py-10 text-gray-500">
                       No roles configured for this school yet.
                     </td>
                   </tr>
                ) : (
                  roles.map((r) => {
                    const aes = getRoleAesthetics(r.name);
                    return (
                      <tr key={r.id} className="hover:bg-[#f8f9ff]">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-md flex items-center justify-center"
                              style={{ background: `${aes.color}22` }}
                            >
                              <span className="material-symbols-outlined" style={{ color: aes.color }}>
                                {aes.icon}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">{r.name}</span>
                          </div>
                        </td>

                        <td className="text-center">
                          <span className="px-3 py-1 bg-[#eff4ff] text-[#0058be] font-medium rounded-full text-sm border border-blue-100">
                            {r.permissions?.length || 0} assigned
                          </span>
                        </td>

                        <td className="text-sm text-gray-500 max-w-xs truncate pr-4">
                          {r.description || "No description provided."}
                        </td>

                        <td className="text-right pr-6">
                          <button 
                            onClick={() => navigate(`/school-admin/roles/edit/${r.id}`)}
                            className="px-4 py-1.5 text-sm font-medium text-[#0058be] bg-[#eff4ff] hover:bg-[#dce9ff] rounded-md transition-colors"
                          >
                            Edit Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="px-6 py-4 flex justify-between items-center bg-[#f8f9ff] border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {roles.length} of {totalCount} roles
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md border bg-white hover:bg-gray-50 text-gray-500 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="px-4 py-1.5 bg-[#0058be] text-white rounded-md text-sm font-semibold shadow-sm">
                1
              </span>
              <button className="p-2 rounded-md border bg-white hover:bg-gray-50 text-gray-500 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* insights */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10 mb-10">
          <div className="lg:col-span-2 bg-[#0b1c30] text-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined text-blue-400">shield</span>
               Security & RBAC Infrastructure
            </h3>
            <p className="text-sm text-blue-100 mb-6 max-w-xl leading-relaxed">
              Academic Architect enforces strictly isolated tenant queries. All roles mapped here dynamically govern ViewSets across your institution, preventing cross-tenant data leakage or unauthorized module interactions.
            </p>
            <button className="px-5 py-2 bg-[#2170e4] hover:bg-[#3480f0] transition-colors rounded-md text-white font-semibold text-sm shadow-sm">
              Review Security Policy
            </button>
          </div>

          <div className="bg-[#e9ddff] p-8 rounded-xl shadow-sm border border-[#d6beff]">
            <h3 className="text-xl font-bold mb-4 text-[#4a249c]">
              Role Audit Log
            </h3>
            <p className="text-sm text-[#5d3baf] leading-relaxed">
              Active configuration syncing automatically with Django permissions framework.
            </p>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}