import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";

export default function AcademicYears() {
  const navigate = useNavigate();
  
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const endpoint = `${baseUrl}v1/academics/academic-years/`;
      console.log("Fetching academic years from:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch academic years. Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Academic Years API Response:", data);
      
      // DRF paginated responses contain the array in data.results
      if (data.results) {
        setYears(data.results);
        setTotalCount(data.count);
      } else {
        // Fallback in case pagination is turned off
        setYears(data);
        setTotalCount(data.length);
      }
      
    } catch (err) {
      console.error("Error fetching academic years:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format 'YYYY-MM-DD' from Django to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SchoolLayout title="Academic Years">
      <div className="pt-6">
        {/* header */}
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Cycle Management
            </h1>
            <p className="text-[#6b7280]">
              Configure and monitor the lifecycle of your institution's academic periods. Ensure seamless transitions between terms.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/academic-years/create")}
            className="px-6 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-[#0058be] to-[#2170e4] shadow-lg flex gap-2 items-center"
          >
            <span className="material-symbols-outlined">add</span>
            Add Academic Year
          </button>
        </div>

        {/* stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg border-l-4 border-[#0058be] shadow-sm">
            <p className="text-sm text-gray-500">Current Active Year</p>
            <h3 className="text-2xl font-bold text-[#0058be]">
              {years.find(y => y.is_active)?.name || "None"}
            </h3>
            <p className="text-xs text-green-600 mt-2 flex gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Live for all campuses
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border-l-4 border-[#924700] shadow-sm">
            <p className="text-sm text-gray-500">Total Cycles</p>
            <h3 className="text-2xl font-bold text-[#924700]">{totalCount}</h3>
            <p className="text-xs text-gray-500 mt-2">Recorded in system</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-l-4 border-[#6b38d4] shadow-sm">
            <p className="text-sm text-gray-500">Archived Periods</p>
            <h3 className="text-2xl font-bold text-[#6b38d4]">
              {years.filter(y => !y.is_active).length}
            </h3>
            <p className="text-xs text-gray-500 mt-2">Historical Data Retained</p>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 flex justify-between bg-[#eff4ff]">
            <h3 className="font-bold">Yearly Timeline</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white rounded-md">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 hover:bg-white rounded-md">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>

          {error && (
             <div className="p-4 text-red-600 bg-red-50 text-center border-b border-red-100">
               {error}
             </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="px-8 py-4">Year Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th className="text-right pr-8">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      Loading academic years...
                    </td>
                  </tr>
                ) : years.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      No academic years found.
                    </td>
                  </tr>
                ) : (
                  years.map((year) => (
                    <tr key={year.id} className={`hover:bg-[#f8f9ff] ${!year.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-8 py-5 font-semibold">{year.name}</td>
                      <td>{formatDate(year.start_date)}</td>
                      <td>{formatDate(year.end_date)}</td>
                      <td>
                        {year.is_active ? (
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                            Inactive / Archived
                          </span>
                        )}
                      </td>
                      <td className="text-right pr-8">
                        <button 
  onClick={() => navigate(`/school-admin/academic-years/edit/${year.id}`)}
  className="text-[#0058be] font-medium hover:underline"
>
  Edit
</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="px-8 py-5 flex justify-between items-center text-sm bg-[#eff4ff]">
            <p className="text-[#6b7280]">
              Showing {years.length} of {totalCount} years
            </p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-md border border-[#c2c6d6] flex items-center justify-center text-[#727785] hover:bg-white transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-md bg-[#0058be] text-white font-semibold flex items-center justify-center">
                1
              </button>
              <button className="w-10 h-10 rounded-md border border-[#c2c6d6] flex items-center justify-center text-[#727785] hover:bg-white transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* insight section */}
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          <div className="bg-[#0b1c30] text-white rounded-xl p-8">
            <h4 className="text-xl font-bold mb-4">Prepare for Next Shift</h4>
            <p className="text-sm text-blue-100">
              Ensure you have your sections and class levels configured before migrating students to the upcoming academic year.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border shadow-sm">
            <h4 className="text-xl font-bold mb-2">Automated Rollover</h4>
            <p className="text-sm text-gray-500 mb-6">
              Use the bulk promotion tool to securely transition student enrollments to the next year.
            </p>
            <button className="text-[#6b38d4] font-semibold hover:underline">
              Go to Promotions
            </button>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}