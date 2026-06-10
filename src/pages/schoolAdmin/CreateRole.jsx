import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function CreateRole() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // Available permissions
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [allPermissionsCount, setAllPermissionsCount] = useState(0);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);

  // Memoize functions to satisfy dependency rules
  const fetchGlobalPermissions = useCallback(async () => {
    try {
      const data = await schoolAdminApi.getPermissions();
      setAllPermissionsCount(data.length);

      const grouped = data.reduce((acc, perm) => {
        const mod = perm.module || "General Systems";
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(perm);
        return acc;
      }, {});

      setGroupedPermissions(grouped);
    } catch (err) {
      console.error("Fetch Permissions Error:", err);
      setError("Failed to load global system permissions.");
    }
  }, []);

  const fetchRoleDetails = useCallback(async () => {
    try {
      const data = await schoolAdminApi.getRoleDetails(id);
      setName(data.name || "");
      setDescription(data.description || "");
      setSelectedPermissions(data.permissions || []);
    } catch (err) {
      console.error("Fetch Role Error:", err);
      setError("Failed to load role details.");
    } finally {
      setInitialLoad(false);
    }
  }, [id]);

  useEffect(() => {
    const initData = async () => {
      await fetchGlobalPermissions();
      if (isEditMode) {
        await fetchRoleDetails();
      } else {
        setInitialLoad(false);
      }
    };
    initData();
  }, [fetchGlobalPermissions, fetchRoleDetails, isEditMode]); // These dependencies are now satisfied

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  const handleModuleToggle = (moduleName, isSelectingAll) => {
    const modulePermIds = groupedPermissions[moduleName].map(p => p.id);
    if (isSelectingAll) {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...modulePermIds])));
    } else {
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { name, description, permissions: selectedPermissions };

      if (isEditMode) {
        await schoolAdminApi.updateRole(id, payload);
      } else {
        await schoolAdminApi.createRole(payload);
      }

      alert(`Role ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/school-admin/roles");
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.response?.data?.detail || "Failed to save role.");
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await schoolAdminApi.deleteRole(id);
      alert("Role deleted successfully.");
      navigate("/school-admin/roles");
    } catch (err) {
      setError("Failed to delete role.");
      setLoading(false);
    }
  };

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
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0b1c30]">
              {isEditMode ? "Edit Role Configuration" : "Create New Role"}
            </h1>
            <p className="text-[#6b7280] mt-1 max-w-xl">
              Define administrative access and feature scope for institutional staff.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/roles")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0058be] font-semibold rounded-md shadow-sm transition mt-1 border border-[#0058be]/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Go Back
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 shadow-sm">{error}</div>
        )}

        <div className="grid xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-8">
            <form id="roleForm" onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-8 flex gap-3 items-center text-slate-800">
                  <span className="w-2 h-8 bg-[#0058be] rounded-full shadow-sm"></span> Role Identity
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold ml-1 block mb-2 text-slate-700">Role Name *</label>
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
                      placeholder="Briefly describe responsibilities..."
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none border border-transparent focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold flex gap-3 items-center text-slate-800">
                    <span className="w-2 h-8 bg-[#6b38d4] rounded-full shadow-sm"></span> Access Control Matrix
                  </h2>
                </div>

                <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                      const aes = getModuleAesthetics(moduleName);
                      const modulePermIds = perms.map(p => p.id);
                      const selectedCount = modulePermIds.filter(id => selectedPermissions.includes(id)).length;
                      const allSelected = selectedCount === modulePermIds.length && modulePermIds.length > 0;

                      return (
                        <div key={moduleName} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
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
                          <div className="p-4 grid md:grid-cols-2 gap-3">
                            {perms.map(p => (
                              <label key={p.id} className={`flex items-start gap-3 p-3 rounded-md cursor-pointer border ${selectedPermissions.includes(p.id) ? "bg-white border-[#0058be]/30 shadow-sm" : "border-transparent"}`}>
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(p.id)}
                                  onChange={() => togglePermission(p.id)}
                                  className="w-4 h-4 rounded text-[#0058be] cursor-pointer"
                                />
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
              </div>
            </form>
          </div>

          <div className="space-y-8 xl:sticky xl:top-8 self-start">
            <div className="bg-[#e5eeff] p-8 rounded-xl border border-blue-100 shadow-sm">
              <h4 className="font-bold mb-4 text-slate-800">Deployment Summary</h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex justify-between border-b pb-2"><span>Permissions</span> <span className="font-bold text-[#0058be]">{selectedPermissions.length} <span className="font-normal text-slate-500 text-xs">/ {allPermissionsCount}</span></span></div>
                <button type="submit" form="roleForm" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-bold hover:shadow-lg transition-all">
                  {loading ? "Syncing..." : (isEditMode ? "Update" : "Deploy")}
                </button>
                {isEditMode && (
                  <button type="button" onClick={handleDelete} className="w-full py-3 bg-white border text-red-600 rounded-md font-bold shadow-sm hover:bg-red-50">Revoke & Delete</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}