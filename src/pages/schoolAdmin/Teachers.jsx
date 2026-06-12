import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const SortIcon = ({ column, sortConfig }) => {
  const isActive = sortConfig.key === column;
  const isAsc = isActive && sortConfig.dir === "asc";
  return (
    <span
      className="material-symbols-outlined text-[16px] ml-1 align-middle"
      style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)" }}
    >
      {isActive ? (isAsc ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );
};

export default function Teachers() {
  const navigate = useNavigate();

  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });

  // Debounce search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 on search change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  // Always fetch page 1 from backend — paginate client-side
  useEffect(() => { fetchTeachers(debouncedSearch); }, [debouncedSearch]);

  // Clamp currentPage if range shrinks after search/sort
  const computedTotalPages = Math.ceil(
    (sortConfig.key ? allTeachers.length : allTeachers.length) / pageSize
  );
  useEffect(() => {
    if (currentPage > computedTotalPages && computedTotalPages > 0) {
      setCurrentPage(computedTotalPages);
    }
  }, [computedTotalPages, currentPage]);

  const fetchTeachers = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getTeachers(1, search);
      const results = data.results ?? data;
      setAllTeachers(results);
      setTotalCount(data.count ?? results.length);
    } catch (err) {
      console.error("Fetch Teachers Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch teacher directory.");
    } finally {
      setLoading(false);
    }
  };

  // --- Sort ---
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
    setCurrentPage(1);
  };

  const sortedTeachers = useMemo(() => {
    if (!sortConfig.key) return allTeachers;
    return [...allTeachers].sort((a, b) => {
      let aVal = "";
      let bVal = "";
      if (sortConfig.key === "name") {
        aVal = `${a.first_name ?? ""} ${a.last_name ?? ""}`.toLowerCase().trim();
        bVal = `${b.first_name ?? ""} ${b.last_name ?? ""}`.toLowerCase().trim();
      } else if (sortConfig.key === "qualification") {
        aVal = (a.qualification ?? "").toLowerCase();
        bVal = (b.qualification ?? "").toLowerCase();
      } else if (sortConfig.key === "employee_id") {
        aVal = a.employee_id ?? "";
        bVal = b.employee_id ?? "";
      } else if (sortConfig.key === "joining_date") {
        aVal = a.joining_date ?? "";
        bVal = b.joining_date ?? "";
      }
      if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [allTeachers, sortConfig]);

  // --- Client-side pagination slice ---
  const realTotalPages = Math.ceil(sortedTeachers.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedTeachers = sortedTeachers.slice(startIdx, startIdx + pageSize);

  // --- Page number array with ellipsis ---
  const getPageNumbers = () => {
    const pages = [];
    if (realTotalPages <= 7) {
      for (let i = 1; i <= realTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(realTotalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < realTotalPages - 2) pages.push("...");
      pages.push(realTotalPages);
    }
    return pages;
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "TR";
  };

  // Sort header for the blue thead background
  const SortHeader = ({ label, column, className = "" }) => (
    <th
      className={`px-6 py-5 cursor-pointer select-none hover:bg-white/10 transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      {label}
      <SortIcon column={column} sortConfig={sortConfig} />
    </th>
  );

  return (
    <SchoolLayout title="Teachers">
      {/* header */}
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

        {/* table card */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">

          {/* Toolbar */}
          <div className="p-6 flex justify-between items-center bg-[#eff4ff] border-b border-blue-50">
            {/* Search */}
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty..."
                className="w-full bg-white pl-9 pr-9 py-2 rounded-md text-sm border-transparent focus:border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4 text-sm text-[#6b7280] font-medium">
              {searchQuery && (
                <span className="text-[#0058be] text-xs">
                  {sortedTeachers.length} match{sortedTeachers.length !== 1 ? "es" : ""}
                </span>
              )}
              <span className="text-xs">
                Showing{" "}
                {sortedTeachers.length === 0
                  ? "0"
                  : `${startIdx + 1}–${Math.min(startIdx + pageSize, sortedTeachers.length)}`}{" "}
                of {sortedTeachers.length} records
              </span>

              {/* Rows per page */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6b7280]">Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white text-gray-700 focus:border-[#0058be]/40 outline-none cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5 font-semibold">Profile</th>
                  <SortHeader label="Name & Contact" column="name" className="font-semibold" />
                  <SortHeader label="Qualification" column="qualification" className="font-semibold" />
                  <SortHeader label="Employee ID" column="employee_id" className="font-semibold" />
                  <SortHeader label="Joining Date" column="joining_date" className="font-semibold" />
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6">
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="h-3.5 w-36 bg-gray-200 rounded" />
                          <div className="h-2.5 w-28 bg-gray-100 rounded" />
                          <div className="h-2.5 w-20 bg-gray-100 rounded" />
                        </div>
                      </td>
                      {[1, 2, 3].map((c) => (
                        <td key={c} className="px-6 py-6">
                          <div className="h-3 w-20 bg-gray-200 rounded" />
                        </td>
                      ))}
                      <td className="px-6 py-6" />
                    </tr>
                  ))
                ) : paginatedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <span className="material-symbols-outlined text-4xl">
                          {searchQuery ? "search_off" : "person_off"}
                        </span>
                        <p className="text-sm font-medium">
                          {searchQuery
                            ? "No teachers match your search."
                            : "No teachers found in this institution."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-xs text-[#0058be] underline underline-offset-2 hover:opacity-70"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTeachers.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-[#fcfdff] cursor-pointer transition-colors group"
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
                          {t.first_name || t.last_name
                            ? `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim()
                            : "Pending Name"}
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
                        {t.joining_date
                          ? new Date(t.joining_date).toLocaleDateString()
                          : "Unknown"}
                      </td>

                      <td className="px-6 text-right">
                        <span className="material-symbols-outlined text-[#c2c6d6] group-hover:text-[#0058be] transition-colors">
                          chevron_right
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {realTotalPages > 1 && (
            <div className="flex justify-between items-center px-8 py-4 border-t border-gray-100 bg-gray-50 text-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`text-[#0058be] flex gap-1 items-center text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors ${
                  currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-[#0058be] text-white shadow-sm"
                          : "text-gray-600 hover:bg-blue-50 hover:text-[#0058be]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                disabled={currentPage >= realTotalPages}
                onClick={() => setCurrentPage((p) => Math.min(realTotalPages, p + 1))}
                className={`text-[#0058be] flex gap-1 items-center text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors ${
                  currentPage >= realTotalPages ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                Next
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
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

          <div className="bg-white border border-[#d9b39a] rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f2dfd0] rounded-full opacity-50"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-[#9a4d00] mb-4 text-3xl">
                database
              </span>
              <h4 className="font-bold text-[#3a1f0b] text-lg">Relational Logic</h4>
              <p className="text-sm text-[#6b3b13] mt-2 leading-relaxed">
                This table pulls directly from your{" "}
                <code className="bg-[#f2dfd0] px-1 rounded text-xs">TeacherProfile</code> ViewSet,
                providing domain-specific fields like Employee ID linked securely to the base user identity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}