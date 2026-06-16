import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

export default function RolesPermissions() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchRoles(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchRoles = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getRoles(page, search);
      
      if (data.results) {
        setRoles(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setRoles(data);
        setTotalCount(data.length || 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Roles Error:", err);
      setError(err.message || "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleAesthetics = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) {
      return { icon: "admin_panel_settings", bg: "bg-primary/10", text: "text-primary" };
    }
    if (name.includes("teacher")) {
      return { icon: "school", bg: "bg-secondary/10", text: "text-secondary" };
    }
    if (name.includes("finance") || name.includes("account")) {
      return { icon: "account_balance", bg: "bg-success/10", text: "text-success" };
    }
    if (name.includes("lib")) {
      return { icon: "menu_book", bg: "bg-tertiary/10", text: "text-tertiary" };
    }
    return { icon: "verified_user", bg: "bg-outline/10", text: "text-outline" };
  };

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
            <p className="text-xs font-headline font-bold text-on-surface-variant uppercase">Total Roles</p>
            <h3 className="text-3xl font-headline font-bold text-primary">{totalCount}</h3>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg border-l-4 border-secondary shadow-sm border border-outline-variant/10">
            <p className="text-xs font-headline font-bold text-on-surface-variant uppercase">Custom Permissions</p>
            <h3 className="text-3xl font-headline font-bold text-on-surface">Active</h3>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
            <p className="text-xs font-headline font-bold text-on-surface-variant uppercase">System Health</p>
            <h3 className="text-3xl font-headline font-bold text-success">Secure</h3>
          </div>
          <div className="flex justify-end items-center">
            <button
              onClick={() => navigate("/school-admin/roles/create")}
              className="px-6 py-3 bg-primary text-white rounded-md font-semibold flex gap-2 items-center shadow-lg hover:bg-primary/90 transition-all font-body"
            >
              <span className="material-symbols-outlined">add</span>
              Create Role
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-md border border-error/20 font-body">
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-high/50 border-b border-outline-variant/10">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full bg-surface-container-low rounded-md pl-10 pr-4 py-2 outline-none border border-outline-variant/20 focus:border-primary/30 transition-all shadow-sm font-body text-on-surface placeholder:text-outline"
              />
            </div>
            <div className="text-sm text-on-surface-variant font-medium font-body">
              Showing {roles.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs uppercase text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-headline font-bold">Role Name</th>
                  <th className="px-6 py-4 font-headline font-bold text-center">Permissions</th>
                  <th className="px-6 py-4 font-headline font-bold">Description</th>
                  <th className="px-6 py-4 font-headline font-bold text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                   <tr>
                     <td colSpan="4" className="text-center py-10 text-on-surface-variant font-body">Loading roles...</td>
                   </tr>
                ) : roles.length === 0 ? (
                   <tr>
                     <td colSpan="4" className="text-center py-10 text-on-surface-variant font-body">No roles found.</td>
                   </tr>
                ) : (
                  roles.map((r) => {
                    const aes = getRoleAesthetics(r.name);
                    return (
                      <tr key={r.id} className="hover:bg-surface-container-high/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${aes.bg}`}>
                              <span className={`material-symbols-outlined ${aes.text}`}>{aes.icon}</span>
                            </div>
                            <span className="font-semibold text-on-surface font-body">{r.name}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm border border-primary/20 font-body">
                            {r.permissions?.length || 0} assigned
                          </span>
                        </td>
                        <td className="text-sm text-on-surface-variant max-w-xs truncate pr-4 font-body">
                          {r.description || "No description provided."}
                        </td>
                        <td className="text-right pr-6">
                          <button 
                            onClick={() => navigate(`/school-admin/roles/edit/${r.id}`)}
                            className="px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors font-body"
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

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-outline-variant/10 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant font-medium font-body">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="w-8 h-8 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded text-sm font-bold shadow-sm">{currentPage}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="w-8 h-8 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}