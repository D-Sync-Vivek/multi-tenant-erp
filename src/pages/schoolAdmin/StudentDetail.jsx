import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getStudentById(id);
        
        // This will print the exact backend response to your browser console
        console.log("Fetched Backend Data:", data); 
        
        setStudent(data);
      } catch (err) {
        console.error("Failed to load student", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <SchoolLayout title="Student Details">
        <div className="p-8 flex justify-center items-center h-64 text-[#0058be]">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Student Details">
      <div className="p-8 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-[#0058be] font-medium flex items-center gap-1 hover:underline transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Directory
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Profile</h1>
        
        {student ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            {/* Header section of the profile card */}
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 rounded-full bg-[#e5eeff] text-[#0058be] flex items-center justify-center text-2xl font-bold">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {student.first_name || student.user?.first_name || "N/A"} {student.last_name || student.user?.last_name || ""}
                </h2>
                <p className="text-gray-500 font-mono">ID: {id}</p>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Enrollment Number</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {student.enrollment_number || "N/A"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {student.email || student.user?.email || "No Email Provided"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {student.phone_number || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center gap-2">
                  {!student.is_archived ? (
                    <><span className="w-3 h-3 rounded-full bg-green-500"></span> Active Profile</>
                  ) : (
                    <><span className="w-3 h-3 rounded-full bg-gray-400"></span> Archived Profile</>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3 font-medium">
            <span className="material-symbols-outlined">error</span>
            Student data could not be parsed. Check your console to see the fetched JSON.
          </div>
        )}
      </div>
    </SchoolLayout>
  );
}