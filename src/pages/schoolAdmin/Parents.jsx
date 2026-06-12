import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination, sorting & search state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
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

  // Fetch parents whenever the search changes.
  // NOTE: page is intentionally NOT sent to the API — the backend returns
  // its result set for page 1, and pagination for display is handled
  // entirely client-side below to avoid requesting backend pages that
  // don't exist (which causes a 404 "Invalid page").
  useEffect(() => {
    fetchParents(debouncedSearch);
  }, [debouncedSearch]);

  const fetchParents = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getParents(1, search);

      if (data.results) {
        setParents(data.results);
        setTotalCount(data.count);
      } else {
        setParents(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Fetch Parents Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch parent directory.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "PR";
  };

  const getColorClass = (index) => {
    const colors = ["bg-[#e9ddff] text-[#6b38d4]", "bg-[#d8e2ff] text-[#0058be]", "bg-[#ffdcc6] text-[#924700]", "bg-[#eff4ff] text-[#2170e4]"];
    return colors[index % colors.length];
  };

  // --- Sort the fetched dataset ---
  const sortedParents = useMemo(() => {
    if (!sortKey) return parents;
    const list = [...parents];
    list.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "name":
          aVal = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
          bVal = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
          break;
        case "contact":
          aVal = (a.phone_number || "").toLowerCase();
          bVal = (b.phone_number || "").toLowerCase();
          break;
        case "occupation":
          aVal = (a.occupation || "").toLowerCase();
          bVal = (b.occupation || "").toLowerCase();
          break;
        case "emergency":
          aVal = (a.emergency_contact_number || "").toLowerCase();
          bVal = (b.emergency_contact_number || "").toLowerCase();
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [parents, sortKey, sortDir]);

  // --- Client-side pagination over the fetched dataset ---
  const totalPages = Math.max(1, Math.ceil(sortedParents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedParents = sortedParents.slice(startIdx, startIdx + pageSize);

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
        active ? "text-[#0058be]" : "text-gray-300"
      }`}
    >
      {active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );

  const SortableHeader = ({ label, sortKeyName }) => (
    <th className="px-6 py-4 font-semibold tracking-wider">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleSort(sortKeyName);
        }}
        className="flex items-center gap-1.5 hover:text-[#0058be] transition-colors"
      >
        {label}
        <SortIcon active={sortKey === sortKeyName} dir={sortDir} />
      </button>
    </th>
  );

  return (
    <SchoolLayout title="Parents">
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-12">
        
        {/* top intro */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8 bg-white border-l-4 border-[#0058be] p-6 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Guardian Directory</h3>
              <p className="text-sm text-[#6b7280] mt-1">
                Manage emergency contacts and parental access for students.
              </p>
            </div>

            <button
              onClick={() => navigate("/school-admin/parents/create")}
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              Add Parent
            </button>
          </div>

          <div className="lg:col-span-4 bg-[#eff4ff] rounded-xl p-6 flex items-center gap-4 shadow-sm border border-blue-50">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0058be] shadow-sm">
              <span className="material-symbols-outlined text-[28px]">family_history</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-[#0058be]">Total Profiles</p>
              <p className="text-3xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* table container */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 flex flex-wrap gap-4 justify-between items-center bg-[#f8f9ff] border-b border-gray-100">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guardians..."
                className="w-full bg-white pl-9 pr-9 py-2.5 rounded-md text-sm border border-gray-200 focus:border-[#0058be]/30 outline-none transition-all shadow-sm"
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

            <div className="flex items-center gap-3 text-xs text-[#6b7280] font-medium">
              {/* Row count selector */}
              <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 shadow-sm px-3 py-2">
                <label htmlFor="page-size" className="font-bold uppercase tracking-wide">
                  Rows
                </label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <span>
                Showing {sortedParents.length} of {totalCount} records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs uppercase text-[#6b7280] border-b border-gray-100">
                <tr>
                  <SortableHeader label="Parent Details" sortKeyName="name" />
                  <SortableHeader label="Contact Info" sortKeyName="contact" />
                  <SortableHeader label="Occupation" sortKeyName="occupation" />
                  <SortableHeader label="Emergency Contact" sortKeyName="emergency" />
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[#0058be]">progress_activity</span>
                        Loading guardian profiles...
                      </div>
                    </td>
                  </tr>
                ) : paginatedParents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      {searchQuery ? "No guardians match your search." : "No parents found in the directory."}
                    </td>
                  </tr>
                ) : (
                  paginatedParents.map((p, i) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#fcfdff] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/school-admin/parents/${p.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {p.profile_picture ? (
                            <img 
                              src={p.profile_picture} 
                              alt="Profile" 
                              className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getColorClass(i)}`}>
                              {getInitials(p.first_name, p.last_name, p.email)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {p.first_name || p.last_name ? `${p.first_name} ${p.last_name}` : "Pending Name"}
                            </p>
                            <p className="text-xs text-[#6b7280] mt-0.5">
                              {p.email || "No email provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#475569] font-medium">
                        {p.phone_number || "N/A"}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#475569]">
                        {p.occupation || "Unspecified"}
                      </td>

                      <td className="px-6 py-5">
                        {p.emergency_contact_number ? (
                          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-max border border-red-100">
                            <span className="material-symbols-outlined text-[14px]">emergency</span>
                            {p.emergency_contact_number}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not setup</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button 
                disabled={safePage === 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                className={`flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors ${safePage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                  <button
                    key={p}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p); }}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${
                      p === safePage
                        ? "bg-[#0058be] text-white shadow-sm"
                        : "text-[#0058be] hover:bg-blue-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button 
                disabled={safePage >= totalPages}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                className={`flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors ${safePage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* insights */}
        <div className="grid lg:grid-cols-12 gap-8 mt-12">
          <div className="lg:col-span-5 bg-gradient-to-br from-[#ffdcc6] to-[#ffc9aa] rounded-xl p-8 relative overflow-hidden shadow-sm">
            <span className="material-symbols-outlined text-[#924700] text-4xl mb-4 relative z-10">
              lightbulb
            </span>
            <h4 className="text-xl font-bold mb-2 text-[#924700] relative z-10">
              Data Architecture Tip
            </h4>
            <p className="text-sm text-[#924700]/90 mb-6 relative z-10">
              In your Django structure, guardians are standard Users. By assigning multiple `StudentProfiles` to one `ParentProfile`, you create efficient One-to-Many mappings, drastically reducing duplicate data.
            </p>
            <button className="flex items-center gap-2 text-[#924700] font-bold bg-white/40 hover:bg-white/60 px-4 py-2 rounded-md transition-colors relative z-10">
              Review Mappings
              <span className="material-symbols-outlined text-sm">east</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h4 className="text-xl font-bold text-slate-800">Contact Health Status</h4>
                <p className="text-sm text-[#6b7280] mt-1">
                  Ensure emergency protocols are functional
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#0058be]">94%</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0058be] mt-1">Verified</p>
              </div>
            </div>

            <div className="w-full bg-[#eff4ff] h-3 rounded-full mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0058be] to-[#2170e4] h-full w-[94%] rounded-full shadow-sm"></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm font-medium">
              <div className="flex flex-col text-[#0f9d58]">
                <span className="text-2xl font-bold">88%</span>
                <span className="text-xs uppercase tracking-wider mt-1">Phone Ready</span>
              </div>
              <div className="flex flex-col text-[#ba1a1a]">
                <span className="text-2xl font-bold">2%</span>
                <span className="text-xs uppercase tracking-wider mt-1">Email Bounce</span>
              </div>
              <div className="flex flex-col text-[#924700]">
                <span className="text-2xl font-bold">6%</span>
                <span className="text-xs uppercase tracking-wider mt-1">Needs Update</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}