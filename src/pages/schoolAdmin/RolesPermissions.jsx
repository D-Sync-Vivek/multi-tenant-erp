import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function RolesPermissions() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // --- NEW: Pagination & sorting state ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

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

  const getRoleAesthetics = (roleName) => {
    const name = (roleName || "").toLowerCase();
    if (name.includes("admin")) return { icon: "admin_panel_settings", color: "#0058be" };
    if (name.includes("teacher")) return { icon: "school", color: "#6b38d4" };
    if (name.includes("finance") || name.includes("account")) return { icon: "account_balance", color: "#0f9d58" };
    if (name.includes("lib")) return { icon: "menu_book", color: "#924700" };
    return { icon: "verified_user", color: "#727785" };
  };

  // --- Filter ---
  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        (role.description || "").toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  // --- Sort ---
  const sortedRoles = useMemo(() => {
    const list = [...filteredRoles];
    list.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "permissions":
          aVal = a.permissions?.length || 0;
          bVal = b.permissions?.length || 0;
          break;
        case "description":
          aVal = (a.description || "").toLowerCase();
          bVal = (b.description || "").toLowerCase();
          break;
        default:
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredRoles, sortKey, sortDir]);

  // --- Pagination math ---
  const totalPages = Math.max(1, Math.ceil(sortedRoles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedRoles = sortedRoles.slice(startIdx, startIdx + pageSize);
  const rangeStart = sortedRoles.length === 0 ? 0 : startIdx + 1;
  const rangeEnd = Math.min(startIdx + pageSize, sortedRoles.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const handleEditClick = (e, id) => {
    e.stopPropagation();
    navigate(`/school-admin/roles/edit/${id}`);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ active, dir }) => (
    <span
      className={`material-symbols-outlined text-[16px] transition-colors ${
        active ? "text-[#0058be]" : "text-gray-300"
      }`}
    >
      {active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );

  // --- Page number list with ellipses for large counts ---
  const getPageList = () => {
    const pages = [];
    const windowSize = 1;
    const add = (p) => pages.push(p);

    add(1);
    if (safePage - windowSize > 2) add("…");
    for (
      let p = Math.max(2, safePage - windowSize);
      p <= Math.min(totalPages - 1, safePage + windowSize);
      p++
    ) {
      add(p);
    }
    if (safePage + windowSize < totalPages - 1) add("…");
    if (totalPages > 1) add(totalPages);

    return pages;
  };

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="pt-6 px-8 max-w-7xl mx-auto pb-12">
        {/* --- Stat cards --- */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Roles</p>
            <h3 className="text-3xl font-bold text-[#0058be] mt-1">{totalCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-lg border-l-4 border-[#6b38d4] shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom Permissions</p>
            <h3 className="text-3xl font-bold mt-1">Active</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">System Health</p>
            <h3 className="text-3xl font-bold text-[#0f9d58] mt-1">Secure</h3>
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
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* --- Table card --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* Toolbar */}
          <div className="p-6 flex flex-wrap gap-4 justify-between items-center bg-[#eff4ff] border-b border-blue-100">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                placeholder="Search roles or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-md pl-10 pr-4 py-2 outline-none border border-transparent focus:border-[#0058be]/30 transition-all shadow-sm text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              {searchQuery && (
                <span>
                  {sortedRoles.length} result{sortedRoles.length === 1 ? "" : "s"}
                </span>
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="page-size" className="font-medium text-gray-500">
                  Rows
                </label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:border-[#0058be]/40 shadow-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#eff4ff] text-xs uppercase text-gray-500 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-4">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1.5 hover:text-[#0058be] transition-colors"
                    >
                      Role Name
                      <SortIcon active={sortKey === "name"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="text-center">
                    <button
                      onClick={() => toggleSort("permissions")}
                      className="flex items-center gap-1.5 mx-auto hover:text-[#0058be] transition-colors"
                    >
                      Permissions
                      <SortIcon active={sortKey === "permissions"} dir={sortDir} />
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => toggleSort("description")}
                      className="flex items-center gap-1.5 hover:text-[#0058be] transition-colors"
                    >
                      Description
                      <SortIcon active={sortKey === "description"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-gray-100 animate-pulse" />
                          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse mx-auto" />
                      </td>
                      <td>
                        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                      </td>
                      <td className="text-right pr-6">
                        <div className="h-8 w-24 bg-gray-100 rounded-md animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedRoles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16">
                      <div className="flex flex-col items-center text-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-gray-300">
                          {searchQuery ? "search_off" : "shield"}
                        </span>
                        <p className="text-gray-700 font-medium">
                          {searchQuery ? "No roles match your search" : "No roles yet"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchQuery
                            ? "Try a different name or clear the search to see all roles."
                            : "Create your first role to start assigning permissions."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-sm font-medium text-[#0058be] hover:underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((r) => {
                    const aes = getRoleAesthetics(r.name);
                    return (
                      <tr key={r.id} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
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

          {/* --- Pagination footer --- */}
          {!loading && sortedRoles.length > 0 && (
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{rangeStart}</span>–
                <span className="font-medium text-gray-700">{rangeEnd}</span> of{" "}
                <span className="font-medium text-gray-700">{sortedRoles.length}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className="p-2 rounded-md text-gray-400 hover:text-[#0058be] hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="First page"
                >
                  <span className="material-symbols-outlined text-[20px]">first_page</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-2 rounded-md text-gray-400 hover:text-[#0058be] hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {getPageList().map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[36px] h-9 px-2 rounded-md text-sm font-medium transition-colors ${
                        p === safePage
                          ? "bg-[#0058be] text-white shadow-sm"
                          : "text-gray-600 hover:bg-[#eff4ff] hover:text-[#0058be]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-2 rounded-md text-gray-400 hover:text-[#0058be] hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="p-2 rounded-md text-gray-400 hover:text-[#0058be] hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Last page"
                >
                  <span className="material-symbols-outlined text-[20px]">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}