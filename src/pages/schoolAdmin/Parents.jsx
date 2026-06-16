import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

export default function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
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
    fetchParents(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchParents = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);

    try {
      const data = await schoolAdminApi.getParents(page, search);
      
      if (data.results) {
        setParents(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setParents(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Parents Error:", err);
      setError(err.message || "Failed to fetch parent directory.");
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
    const colors = [
      "bg-secondary/20 text-secondary",
      "bg-primary/20 text-primary", 
      "bg-tertiary/20 text-tertiary",
      "bg-surface-container-high text-on-surface-variant"
    ];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Parents">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8 bg-surface-container-lowest border-l-4 border-primary p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface tracking-tight">Guardian Directory</h3>
              <p className="text-sm text-on-surface-variant mt-1 font-body">Manage emergency contacts and parental access for students.</p>
            </div>
            <button 
              onClick={() => navigate("/school-admin/parents/create")} 
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition-all font-body"
            >
              <span className="material-symbols-outlined">add</span> Add Parent
            </button>
          </div>
          <div className="lg:col-span-4 bg-surface-container-high/50 rounded-xl p-6 flex items-center gap-4 shadow-sm border border-outline-variant/10">
            <div className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[28px]">family_history</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-primary font-headline">Total Profiles</p>
              <p className="text-3xl font-headline font-bold text-on-surface">{totalCount}</p>
            </div>
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
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search guardians..." 
                className="w-full bg-surface-container-low pl-9 pr-4 py-2.5 rounded-md text-sm border border-outline-variant/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm font-body text-on-surface placeholder:text-outline" 
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium font-body">
              Showing {parents.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs uppercase text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Parent Details</th>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Occupation</th>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Emergency Contact</th>
                  <th className="px-6 py-4 font-headline font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-12 text-on-surface-variant font-body">Loading guardian profiles...</td></tr>
                ) : parents.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-on-surface-variant font-body">No parents found.</td></tr>
                ) : (
                  parents.map((p, i) => (
                    <tr 
                      key={p.id} 
                      className="hover:bg-surface-container-high/30 transition-colors cursor-pointer group" 
                      onClick={() => navigate(`/school-admin/parents/${p.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {p.profile_picture ? (
                            <img src={p.profile_picture} alt="Profile" className="w-11 h-11 rounded-full object-cover border border-outline-variant/20 shadow-sm" />
                          ) : (
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getColorClass(i)}`}>
                              {getInitials(p.first_name, p.last_name, p.email)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-on-surface font-body">{p.first_name || p.last_name ? `${p.first_name} ${p.last_name}` : "Pending Name"}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{p.email || "No email provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{p.phone_number || "N/A"}</td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{p.occupation || "Unspecified"}</td>
                      <td className="px-6 py-5">
                        {p.emergency_contact_number ? (
                          <span className="px-3 py-1 bg-error/10 text-error rounded-full text-xs font-semibold flex items-center gap-1 w-max border border-error/20">
                            <span className="material-symbols-outlined text-[14px]">emergency</span>{p.emergency_contact_number}
                          </span>
                        ) : <span className="text-xs text-outline italic font-body">Not setup</span>}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                      </td>
                    </tr>
                  ))
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