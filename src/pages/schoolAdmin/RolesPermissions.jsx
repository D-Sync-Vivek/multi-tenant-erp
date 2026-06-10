import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

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
      const data = await schoolAdminApi.getRoles();
      setRoles(data.results || data);
      setTotalCount(data.count || data.length || 0);
    } catch (err) {
      console.error("Fetch Roles Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Safe Navigation Handler ---
  const handleEditClick = (e, id) => {
    e.stopPropagation(); // Stops the click from bubbling up to the row/container
    navigate(`/school-admin/roles/edit/${id}`);
  };

  const getRoleAesthetics = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) return { icon: "admin_panel_settings", color: "#0058be" };
    if (name.includes("teacher")) return { icon: "school", color: "#6b38d4" };
    if (name.includes("finance") || name.includes("account")) return { icon: "account_balance", color: "#0f9d58" };
    if (name.includes("lib")) return { icon: "menu_book", color: "#924700" };
    return { icon: "verified_user", color: "#727785" }; 
  };

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="pt-6 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Roles</p>
            <h3 className="text-3xl font-bold text-[#0058be]">{totalCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-lg border-l-4 border-[#6b38d4] shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Custom Permissions</p>
            <h3 className="text-3xl font-bold">Active</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">System Health</p>
            <h3 className="text-3xl font-bold text-[#0f9d58]">Secure</h3>
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-[#eff4ff]">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                placeholder="Search roles..."
                className="w-full bg-white rounded-md pl-10 pr-4 py-2 outline-none border border-transparent focus:border-[#0058be]/30 transition-all shadow-sm"
              />
            </div>
          </div>

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
                    <td colSpan="4" className="text-center py-10 text-gray-500">Loading roles...</td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-500">No roles found.</td>
                  </tr>
                ) : (
                  roles.map((r) => {
                    const aes = getRoleAesthetics(r.name);
                    return (
                      <tr key={r.id} className="hover:bg-[#f8f9ff]">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: `${aes.color}22` }}>
                              <span className="material-symbols-outlined" style={{ color: aes.color }}>{aes.icon}</span>
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
                          {/* --- FIXED: Added Stop Propagation --- */}
                          <button 
                            onClick={(e) => handleEditClick(e, r.id)}
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
        </div>
      </div>
    </SchoolLayout>
  );
}