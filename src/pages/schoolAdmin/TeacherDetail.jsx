import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getTeacherById(id);
        console.log("Fetched Teacher Data:", data);
        setTeacher(data);
      } catch (err) {
        console.error("Failed to load teacher", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <SchoolLayout title="Teacher Details">
        <div className="p-8 flex justify-center items-center h-64 text-[#0058be]">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Teacher Details">
      <div className="p-8 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-[#0058be] font-medium flex items-center gap-1 hover:underline transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Directory
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Faculty Profile</h1>
        
        {teacher ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            {/* Header section */}
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 rounded-full bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center text-2xl font-bold">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {teacher.first_name || teacher.user?.first_name || "N/A"} {teacher.last_name || teacher.user?.last_name || ""}
                </h2>
                <p className="text-gray-500 font-mono">UUID: {id}</p>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Employee ID</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {teacher.employee_id || "N/A"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {teacher.email || teacher.user?.email || "No Email Provided"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Qualification</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {teacher.qualification || "Unspecified"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Joining Date</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {teacher.joining_date || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3 font-medium">
            <span className="material-symbols-outlined">error</span>
            Teacher data could not be parsed.
          </div>
        )}
      </div>
    </SchoolLayout>
  );
}