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
      style={{ color: isActive ? "#0058be" : "#c2c6d6" }}
    >
      {isActive ? (isAsc ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );
};

export default function ParentStudentMapping() {
  const navigate = useNavigate();

  const [allMappings, setAllMappings] = useState([]);
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
  useEffect(() => { fetchMappings(debouncedSearch); }, [debouncedSearch]);

  // Clamp page if range shrinks
  const sortedMappings = useMemo(() => {
    if (!sortConfig.key) return allMappings;
    return [...allMappings].sort((a, b) => {
      let aVal = "";
      let bVal = "";
      if (sortConfig.key === "parent") {
        aVal = (a.parent_name ?? "").toLowerCase();
        bVal = (b.parent_name ?? "").toLowerCase();
      } else if (sortConfig.key === "student") {
        aVal = (a.student_name ?? "").toLowerCase();
        bVal = (b.student_name ?? "").toLowerCase();
      } else if (sortConfig.key === "relationship") {
        aVal = (a.relationship ?? "").toLowerCase();
        bVal = (b.relationship ?? "").toLowerCase();
      }
      if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [allMappings, sortConfig]);

  const realTotalPages = Math.ceil(sortedMappings.length / pageSize);

  useEffect(() => {
    if (currentPage > realTotalPages && realTotalPages > 0) {
      setCurrentPage(realTotalPages);
    }
  }, [realTotalPages, currentPage]);

  const fetchMappings = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getParentStudentMappings(1, search);
      const results = data.results ?? data;
      setAllMappings(results);
      setTotalCount(data.count ?? results.length);
    } catch (err) {
      console.error("Fetch Mappings Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch relationship mappings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
    setCurrentPage(1);
  };

  // Client-side slice
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedMappings = sortedMappings.slice(startIdx, startIdx + pageSize);

  // Page numbers with ellipsis
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

  const getInitials = (name) => {
    if (!name) return "PR";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = [
      "bg-[#d8e2ff] text-[#0058be]",
      "bg-[#ffdcc6] text-[#924700]",
      "bg-[#e9ddff] text-[#6b38d4]",
    ];
    return colors[index % colors.length];
  };

  const SortHeader = ({ label, column, className = "" }) => (
    <th
      className={`px-6 py-4 font-semibold tracking-wider cursor-pointer select-none hover:text-[#0058be] transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      {label}
      <SortIcon column={column} sortConfig={sortConfig} />
    </th>
  );

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-6xl mx-auto px-8 pt-6 pb-12">

        {/* header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Relationship Management</h2>
            <p className="text-[#6b7280] mt-2 max-w-2xl">
              Configure and manage the legal and academic connections between students and their
              guardians. Ensure accurate data flow for emergency contacts and academic reporting.
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
              <div className="bg-[#0058be] w-full h-full rounded-full" />
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

          {/* Toolbar */}
          <div className="p-6 flex justify-between items-center bg-[#f8f9ff] border-b border-gray-100">
            {/* Search */}
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connections..."
                className="w-full bg-white pl-10 pr-9 py-2.5 rounded-md outline-none border border-gray-200 focus:border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 transition-all shadow-sm text-sm"
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
            <div className="flex items-center gap-4 text-xs text-[#6b7280] font-medium">
              {searchQuery && (
                <span className="text-[#0058be]">
                  {sortedMappings.length} match{sortedMappings.length !== 1 ? "es" : ""}
                </span>
              )}
              <span>
                Showing{" "}
                {sortedMappings.length === 0
                  ? "0"
                  : `${startIdx + 1}–${Math.min(startIdx + pageSize, sortedMappings.length)}`}{" "}
                of {sortedMappings.length} records
              </span>

              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span>Rows</span>
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
              <thead className="bg-white text-xs uppercase text-[#6b7280] border-b border-gray-100">
                <tr>
                  <SortHeader label="Parent Details" column="parent" />
                  <SortHeader label="Student Info" column="student" />
                  <SortHeader label="Relationship" column="relationship" />
                  <th className="px-6 py-4 font-semibold tracking-wider text-center">Permissions</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div className="space-y-2">
                            <div className="h-3.5 w-28 bg-gray-200 rounded" />
                            <div className="h-2.5 w-16 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200" />
                          <div className="h-3 w-20 bg-gray-200 rounded" />
                        </div>
                      </td>
                      {[1, 2].map((c) => (
                        <td key={c} className="px-6 py-5">
                          <div className="h-3 w-16 bg-gray-200 rounded" />
                        </td>
                      ))}
                      <td className="px-6 py-5">
                        <div className="h-6 w-24 bg-gray-200 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : paginatedMappings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <span className="material-symbols-outlined text-4xl">
                          {searchQuery ? "search_off" : "hub"}
                        </span>
                        <p className="text-sm font-medium">
                          {searchQuery
                            ? "No mappings match your search."
                            : "No parent-student mappings established yet."}
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
                  paginatedMappings.map((m, i) => (
                    <tr
                      key={m.id}
                      className="hover:bg-[#fcfdff] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/school-admin/mapping/${m.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getColorClass(startIdx + i)}`}>
                            {getInitials(m.parent_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{m.parent_name || "Unknown Parent"}</p>
                            {m.is_primary_contact && (
                              <span className="text-[10px] uppercase font-bold text-[#0058be] bg-blue-50 px-1.5 py-0.5 rounded">
                                Primary Contact
                              </span>
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
                          <span
                            title="Academics Access"
                            className={`material-symbols-outlined text-[18px] ${m.can_view_academics ? "text-green-600" : "text-gray-300"}`}
                          >
                            menu_book
                          </span>
                          <span
                            title="Fee Payment Access"
                            className={`material-symbols-outlined text-[18px] ${m.can_pay_fees ? "text-blue-600" : "text-gray-300"}`}
                          >
                            payments
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Verified Sync
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
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors ${
                  currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Previous
              </button>

              <div className="flex gap-1">
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
                className={`flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors ${
                  currentPage >= realTotalPages ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                Next
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}