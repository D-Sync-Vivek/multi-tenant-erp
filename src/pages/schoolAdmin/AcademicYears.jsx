import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

export default function AcademicYears() {
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get(`academics/academic-years/`);
        setYears(response.data.results || response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  return (
    <SchoolLayout title="Academic Years">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface">Academic Years</h2>
          <button 
            onClick={() => navigate("/school-admin/academic-years/create")} 
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors font-body"
          >
            Create Year
          </button>
        </div>
        
        <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-headline font-bold">Name</th>
                  <th className="px-6 py-4 font-headline font-bold">Start Date</th>
                  <th className="px-6 py-4 font-headline font-bold">End Date</th>
                  <th className="px-6 py-4 font-headline font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-on-surface-variant font-body">Loading...</td>
                  </tr>
                ) : years.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-on-surface-variant font-body">No academic years found.</td>
                  </tr>
                ) : (
                  years.map((y) => (
                    <tr 
                      key={y.id} 
                      className="hover:bg-surface-container-high/30 cursor-pointer transition-colors" 
                      onClick={() => navigate(`/school-admin/academic-years/edit/${y.id}`)}
                    >
                      <td className="px-6 py-4 font-semibold text-on-surface font-body">{y.name}</td>
                      <td className="text-on-surface-variant font-body">{y.start_date}</td>
                      <td className="text-on-surface-variant font-body">{y.end_date}</td>
                      <td>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          y.is_active 
                            ? 'bg-success/20 text-success dark:bg-success/30' 
                            : 'bg-outline-variant/20 text-outline'
                        }`}>
                          {y.is_active ? "Active" : "Archived"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}