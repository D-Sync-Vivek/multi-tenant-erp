import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Mock layout for preview environment (uncomment your import locally)
// import SchoolLayout from "../../components/erp/school/SchoolLayout";
const SchoolLayout = ({ title, children }) => (
  <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
    <header className="bg-white shadow-sm px-8 py-4 border-b border-slate-200">
      <h1 className="text-xl font-bold text-[#0058be]">{title}</h1>
    </header>
    <main>{children}</main>
  </div>
);

export default function CreateAcademicYear() {
  const navigate = useNavigate();
  const { id } = useParams(); // Extract ID from URL if it exists
  const isEditMode = Boolean(id);

  // Form states mapping to Django AcademicYear fields
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(isEditMode); // True if we need to fetch data first
  const [error, setError] = useState(null);

  // Fetch existing data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      fetchAcademicYearDetails();
    }
  }, [id]);

  const fetchAcademicYearDetails = async () => {
    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/academics/academic-years/${id}/`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to load academic year details.");

      const data = await response.json();
      
      // Populate the form with the fetched data
      setName(data.name || "");
      setStartDate(data.start_date || "");
      setEndDate(data.end_date || "");
      setIsActive(data.is_active ?? true);

    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      // Dynamically set endpoint and method based on mode
      const endpoint = isEditMode 
        ? `${baseUrl}v1/academics/academic-years/${id}/` 
        : `${baseUrl}v1/academics/academic-years/`;
        
      const method = isEditMode ? "PATCH" : "POST";

      console.log(`${isEditMode ? "Updating" : "Posting new"} academic year to:`, endpoint);

      const payload = {
        name: name,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle DRF validation errors gracefully
        let errorMessage = `Failed to ${isEditMode ? "update" : "create"} Academic Year.`;
        if (typeof data === "object") {
          errorMessage = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMessage);
      }

      alert(`Academic Year ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/school-admin/academic-years");

    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this academic year? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/academics/academic-years/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete the academic year.");
      }

      alert("Academic Year deleted successfully!");
      navigate("/school-admin/academic-years");

    } catch (err) {
      console.error("Delete Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/school-admin/academic-years");
  };

  // Show a loading screen while fetching initial data for edit mode
  if (initialLoad) {
    return (
      <SchoolLayout title="Academic Years">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[#0058be] font-semibold flex items-center gap-2">
             <span className="material-symbols-outlined animate-spin">progress_activity</span>
             Loading data...
          </div>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Academic Years">
      <div className="p-12 max-w-5xl mx-auto">
        {/* breadcrumb + go back */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="cursor-pointer hover:text-[#0058be]" onClick={() => navigate("/school-admin")}>
              Dashboard
            </span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="cursor-pointer hover:text-[#0058be]" onClick={goBack}>
              Academic Years
            </span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#0058be] font-semibold">
              {isEditMode ? "Edit Year" : "Create Year"}
            </span>
          </div>

          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 text-[#0058be] font-semibold hover:bg-[#eff4ff] rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Go Back
          </button>
        </div>

        {/* heading */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            {isEditMode ? "Edit Academic Year" : "Create Academic Year"}
          </h1>
          <p className="text-gray-500">
            {isEditMode 
              ? "Update the timeline or status for this academic session." 
              : "Define timeline for upcoming academic session."}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* form */}
          <div className="col-span-8 bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* year */}
              <div>
                <label className="text-sm font-semibold block mb-2">Year Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2024-2025"
                  className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#0058be]/30 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">format YYYY-YYYY</p>
              </div>

              {/* dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold block mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#0058be]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-[#0058be]/30 transition-all"
                  />
                </div>
              </div>

              {/* toggle */}
              <div className="flex justify-between items-center p-4 bg-[#eff4ff] rounded-md">
                <div>
                  <h4 className="font-semibold">Year Status</h4>
                  <p className="text-xs text-gray-500">Set active or inactive</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${!isActive ? 'text-[#0058be]' : 'text-gray-500'}`}>
                    Inactive
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${isActive ? "bg-[#0058be]" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                  <span className={`text-xs font-semibold ${isActive ? 'text-[#0058be]' : 'text-gray-500'}`}>
                    Active
                  </span>
                </div>
              </div>

              {/* actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <div>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </button>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="px-6 py-3 text-[#0058be] font-semibold hover:bg-[#eff4ff] rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-white font-bold rounded-md bg-gradient-to-r from-[#0058be] to-[#2170e4] hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : (isEditMode ? "Update Academic Year" : "Save Academic Year")}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* right panel */}
          <div className="col-span-4 space-y-6">
            <div className="bg-[#eff4ff] p-6 rounded-lg border border-blue-100">
              <h3 className="font-bold mb-3 flex gap-2 text-[#0058be]">
                <span className="material-symbols-outlined text-[#924700]">lightbulb</span>
                Admin Insights
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Academic year helps track student & teacher records accurately in Django.
              </p>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[#0058be] text-sm">check_circle</span>
                  Prevents duplicate student enrollments
                </div>
                <div className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[#0058be] text-sm">check_circle</span>
                  Links assignments & report cards
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold mb-2">Quick Action</h3>
              <p className="text-xs text-gray-500 mb-4">Import previous configuration</p>
              <button className="w-full py-2 border rounded-md text-[#0058be] font-semibold hover:bg-[#eff4ff] transition-colors">
                Review Past Configurations
              </button>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}