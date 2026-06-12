import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import ActionMenu from "./ActionMenu";
import Pagination from "../../components/erp/global/Pagination";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Page size + sorting (client-side) ---
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize]);

  // Fetch students whenever the search changes.
  // NOTE: page is intentionally NOT passed to the API here — the backend
  // returns its own full/paginated result set for the search term, and
  // pagination for display is handled entirely client-side below to avoid
  // requesting backend pages that don't exist (causing 404 "Invalid page").
  useEffect(() => {
    fetchStudents(debouncedSearch);
  }, [debouncedSearch]);

  const fetchStudents = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getStudents(1, search);

      if (data.results) {
        setStudents(data.results);
        setTotalCount(data.count);
      } else {
        setStudents(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Fetch Students Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch student directory.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "ST";
  };

  // --- Sort the full fetched dataset ---
  const sortedStudents = useMemo(() => {
    if (!sortKey) return students;
    const list = [...students];
    list.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "name":
          aVal = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
          bVal = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
          break;
        case "enrollment":
          aVal = (a.enrollment_number || "").toLowerCase();
          bVal = (b.enrollment_number || "").toLowerCase();
          break;
        case "contact":
          aVal = (a.phone_number || "").toLowerCase();
          bVal = (b.phone_number || "").toLowerCase();
          break;
        case "status":
          aVal = a.is_archived ? 1 : 0;
          bVal = b.is_archived ? 1 : 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [students, sortKey, sortDir]);

  // --- Client-side pagination over the fetched dataset ---
  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedStudents = sortedStudents.slice(startIdx, startIdx + pageSize);

  // Keep currentPage in range if data shrinks (e.g. after a search)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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
        active ? "text-blue-600" : "text-slate-300"
      }`}
    >
      {active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );

  const SortableHeader = ({ label, sortKeyName, align = "left" }) => (
    <th className={`px-6 py-5 font-bold ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""}`}>
      <button
        onClick={() => toggleSort(sortKeyName)}
        className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors ${
          align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""
        }`}
      >
        {label}
        <SortIcon active={sortKey === sortKeyName} dir={sortDir} />
      </button>
    </th>
  );

  return (
    <SchoolLayout title="Student Directory">
      <div className="pt-8 px-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out flex flex-col h-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Institution Students</h2>
            <p className="text-slate-500 text-sm font-medium">
              Manage student profiles, track enrollment status, and view basic records.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/students/add")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2 outline-none border border-blue-500"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Register Student
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-center gap-3 shadow-sm animate-in fade-in zoom-in-95">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-600 text-lg">error</span>
            </div>
            <span>{error}</span>
          </div>
        )}

        {/* Main Table Container (Bento Box Style) */}
        <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden flex flex-col flex-1 mb-8">
          
          {/* Top Filter Bar */}
          <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 border-b border-slate-100">
            
            <div className="relative w-full sm:w-96 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-blue-500">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or enrollment no..."
                className="w-full bg-white border border-slate-200/80 pl-11 pr-10 py-2.5 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors outline-none"
                >
                  <span className="material-symbols-outlined text-[14px] font-bold">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Row count selector */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-100 shadow-sm px-3 py-2">
                <label htmlFor="page-size" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Rows
                </label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs font-bold text-slate-500 tracking-wide uppercase px-4 py-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                <span className="text-blue-600 mr-1">{sortedStudents.length}</span> of {totalCount} Records
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <SortableHeader label="Student Details" sortKeyName="name" />
                  <SortableHeader label="Enrollment No." sortKeyName="enrollment" />
                  <SortableHeader label="Contact Info" sortKeyName="contact" />
                  <SortableHeader label="Status" sortKeyName="status" align="center" />
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50/80">
                {loading ? (
                  /* Premium Loading State */
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                          <span className="material-symbols-outlined text-blue-600 text-lg animate-pulse">school</span>
                        </div>
                        <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">Syncing Directory...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  /* Premium Empty State */
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                          <span className="material-symbols-outlined text-3xl text-slate-300">
                            {searchQuery ? "search_off" : "person_search"}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-700 tracking-tight">
                          {searchQuery ? "No matching records found" : "Directory is empty"}
                        </h4>
                        <p className="text-sm font-medium text-slate-400 max-w-sm">
                          {searchQuery 
                            ? `We couldn't find any students matching "${searchQuery}". Try adjusting your search terms.` 
                            : "There are currently no students enrolled in the system. Click 'Register Student' to begin."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Actual Data Rows */
                  paginatedStudents.map((s) => (
                    <tr key={s.id} className="group hover:bg-blue-50/30 transition-colors duration-200">
                      
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex gap-4 items-center">
                          <div className="relative shrink-0">
                            {s.profile_picture ? (
                              <img src={s.profile_picture} alt="Profile" className="w-11 h-11 rounded-2xl object-cover shadow-sm border border-slate-200/60 group-hover:border-blue-300 transition-colors" />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/80 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm border border-blue-200/50 group-hover:border-blue-300 transition-colors">
                                {getInitials(s.first_name, s.last_name, s.email)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {s.first_name || s.last_name ? `${s.first_name} ${s.last_name}` : "Pending Name"}
                            </p>
                            <p className="text-[11px] font-bold tracking-wider text-slate-400 mt-0.5">
                              {s.email || "NO EMAIL"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Enrollment Number */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md group-hover:bg-white transition-colors">
                          {s.enrollment_number || "N/A"}
                        </span>
                      </td>

                      {/* Phone Number */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-500">
                          {s.phone_number || "—"}
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 text-center">
                        {!s.is_archived ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 w-max mx-auto shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200/60 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 w-max mx-auto">
                            <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                          <ActionMenu studentId={s.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Area */}
          {!loading && totalPages > 1 && (
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
              <Pagination 
                currentPage={safePage} 
                totalPages={totalPages} 
                onPageChange={(page) => setCurrentPage(page)} 
              />
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}