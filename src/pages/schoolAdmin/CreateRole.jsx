import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";

export default function CreateRole() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Array of specific Permission UUIDs assigned to this role
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // Available permissions fetched from the backend, grouped by module
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [allPermissionsCount, setAllPermissionsCount] = useState(0);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Always fetch global permissions first
    // 2. If edit mode, fetch role details
    const initData = async () => {
      await fetchGlobalPermissions();
      if (isEditMode) {
        await fetchRoleDetails();
      } else {
        setInitialLoad(false);
      }
    };
    initData();
  }, [id]);

  const fetchGlobalPermissions = async () => {
    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/accounts/permissions/`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to load global system permissions.");

      const permissionsData = await response.json();
      setAllPermissionsCount(permissionsData.length);

      // Group permissions by their 'module' field for UI organization
      const grouped = permissionsData.reduce((acc, perm) => {
        const mod = perm.module || "General Systems";
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(perm);
        return acc;
      }, {});

      setGroupedPermissions(grouped);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchRoleDetails = async () => {
    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/accounts/roles/${id}/`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to load role details.");

      const data = await response.json();
      setName(data.name || "");
      setDescription(data.description || "");
      
      // Django returns the list of UUIDs in `data.permissions`
      setSelectedPermissions(data.permissions || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setInitialLoad(false);
    }
  };

  // Toggle a single permission
  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  // Select or Deselect all permissions in a specific module group
  const handleModuleToggle = (moduleName, isSelectingAll) => {
    const modulePermIds = groupedPermissions[moduleName].map(p => p.id);
    
    if (isSelectingAll) {
      setSelectedPermissions(prev => {
        const unique = new Set([...prev, ...modulePermIds]);
        return Array.from(unique);
      });
    } else {
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const endpoint = isEditMode 
        ? `${baseUrl}v1/accounts/roles/${id}/` 
        : `${baseUrl}v1/accounts/roles/`;
      const method = isEditMode ? "PATCH" : "POST";

      const payload = {
        name,
        description,
        permissions: selectedPermissions
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = `Failed to ${isEditMode ? "update" : "create"} role.`;
        if (typeof data === "object") {
          errorMessage = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMessage);
      }

      alert(`Role ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/school-admin/roles");

    } catch (err) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this role? Users assigned to it will lose these permissions.")) {
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/accounts/roles/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete role.");
      
      alert("Role deleted successfully.");
      navigate("/school-admin/roles");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Aesthetic mappings for UI based on Module Names
  const getModuleAesthetics = (moduleName) => {
    const name = moduleName.toLowerCase();
    if (name.includes("user")) return { icon: "group", color: "#0058be" };
    if (name.includes("academic") || name.includes("class")) return { icon: "school", color: "#6b38d4" };
    if (name.includes("attend")) return { icon: "fact_check", color: "#924700" };
    if (name.includes("grade") || name.includes("exam")) return { icon: "grade", color: "#ba1a1a" };
    if (name.includes("finance") || name.includes("fee")) return { icon: "account_balance", color: "#0f9d58" };
    if (name.includes("ai") || name.includes("insight")) return { icon: "auto_awesome", color: "#6b38d4" };
    return { icon: "settings", color: "#475569" };
  };

  if (initialLoad) {
    return (
      <SchoolLayout title="Roles & Permissions">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[#0058be] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading RBAC Definitions...
          </div>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="px-12 py-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-10">
          {/* LEFT */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0b1c30]">
              {isEditMode ? "Edit Role Configuration" : "Create New Role"}
            </h1>
            <p className="text-[#6b7280] mt-1 max-w-xl">
              Define administrative access and feature scope for institutional staff. Permissions strictly govern API read/write operations.
            </p>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => navigate("/school-admin/roles")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0058be] font-semibold rounded-md shadow-sm transition mt-1 border border-[#0058be]/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Go Back
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-10">
          {/* LEFT (Form & Permissions) */}
          <div className="xl:col-span-2 space-y-8">
            <form id="roleForm" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Role Info */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-8 flex gap-3 items-center text-slate-800">
                  <span className="w-2 h-8 bg-[#0058be] rounded-full shadow-sm"></span>
                  Role Identity
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold ml-1 block mb-2 text-slate-700">Role Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Senior Department Head"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none border border-transparent focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold ml-1 block mb-2 text-slate-700">Description</label>
                    <textarea
                      rows="3"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Briefly describe the responsibilities associated with this role..."
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none border border-transparent focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced API Permissions Matrix */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold flex gap-3 items-center text-slate-800">
                    <span className="w-2 h-8 bg-[#6b38d4] rounded-full shadow-sm"></span>
                    Access Control Matrix
                  </h2>
                  <span className="text-xs font-bold text-[#6b38d4] bg-[#e9ddff] px-3 py-1 rounded-full border border-[#d6beff]">
                    Strict RBAC
                  </span>
                </div>

                {Object.keys(groupedPermissions).length === 0 ? (
                  <p className="text-center text-gray-500 py-6">No global permissions found in system.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                      const aes = getModuleAesthetics(moduleName);
                      
                      // Check how many permissions in this module are selected
                      const modulePermIds = perms.map(p => p.id);
                      const selectedCount = modulePermIds.filter(id => selectedPermissions.includes(id)).length;
                      const allSelected = selectedCount === modulePermIds.length && modulePermIds.length > 0;

                      return (
                        <div key={moduleName} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                          {/* Module Header */}
                          <div className="bg-slate-100 px-6 py-4 flex justify-between items-center border-b border-slate-200">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-lg" style={{ color: aes.color }}>{aes.icon}</span>
                              <h3 className="font-bold text-slate-800">{moduleName}</h3>
                              <span className="text-xs px-2 py-0.5 bg-white text-slate-500 rounded-full border border-slate-200 font-medium">
                                {selectedCount} / {modulePermIds.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleModuleToggle(moduleName, !allSelected)}
                              className="text-xs font-semibold text-[#0058be] hover:underline"
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                          
                          {/* Permissions List */}
                          <div className="p-4 grid md:grid-cols-2 gap-3">
                            {perms.map(p => (
                              <label key={p.id} className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors border ${selectedPermissions.includes(p.id) ? "bg-white border-[#0058be]/30 shadow-sm" : "border-transparent hover:bg-slate-200/50"}`}>
                                <div className="mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(p.id)}
                                    onChange={() => togglePermission(p.id)}
                                    className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800 leading-none mb-1">{p.name}</p>
                                  <p className="text-xs text-slate-500 font-mono">coden: {p.codename}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT (Sticky Summary Panel) */}
          <div className="space-y-8 xl:sticky xl:top-8 self-start">
            
            {/* Action Summary */}
            <div className="bg-[#e5eeff] p-8 rounded-xl border border-blue-100 shadow-sm">
              <h4 className="font-bold mb-4 text-slate-800">Deployment Summary</h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex justify-between items-center border-b border-[#0058be]/10 pb-2">
                  <span>Scope</span>
                  <span className="font-semibold text-xs bg-white px-2 py-1 rounded shadow-sm border border-slate-200">Tenant Isolated</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#0058be]/10 pb-2">
                  <span>Permissions</span>
                  <span className="font-bold text-[#0058be]">
                    {selectedPermissions.length} <span className="font-normal text-slate-500 text-xs">/ {allPermissionsCount}</span>
                  </span>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    form="roleForm"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Syncing Config..." : (isEditMode ? "Update Architecture" : "Deploy New Role")}
                  </button>

                  {isEditMode && (
                     <button
                       type="button"
                       onClick={handleDelete}
                       disabled={loading}
                       className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-md font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                     >
                       <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                       Revoke & Delete Role
                     </button>
                  )}
                </div>
              </div>
            </div>

            {/* Best Practices (Django specific context) */}
            <div className="bg-[#0b1c30] p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <span className="material-symbols-outlined text-8xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold mb-5 relative z-10">Zero Trust Architecture</h3>
              <ul className="space-y-4 text-sm relative z-10 text-slate-300">
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-[#2170e4] text-lg">check_circle</span>
                  <span><strong>Least Privilege:</strong> Only grant exact Read/Write operations required.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-[#2170e4] text-lg">check_circle</span>
                  <span><strong>Live Sync:</strong> Permissions update ViewSet access across all endpoints immediately upon save.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}