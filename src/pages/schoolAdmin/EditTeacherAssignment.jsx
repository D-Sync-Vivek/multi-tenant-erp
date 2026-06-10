import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function EditTeacherAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({ 
      role: "" 
  });
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getTeacherAssignmentById(id);
        setDisplayData(data);
        
        // Populate the form data with the existing values
        setFormData({
            role: data.role || ""
        });
      } catch (err) {
        console.error("Error loading assignment:", err);
      } finally {
        setLoading(false); // Stop loading regardless of success/fail
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schoolAdminApi.updateTeacherAssignment(id, formData);
      alert("Updated successfully!");
      navigate("/school-admin/teacher-assignment");
    } catch (err) {
      console.error("Error updating assignment:", err);
      alert("Failed to update.");
    }
  };

  // Safe loading UI to prevent crashes before data arrives
  if (loading) {
    return (
      <SchoolLayout title="Edit Assignment">
        <div className="p-8 flex justify-center items-center h-64 text-[#0058be]">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Edit Assignment">
      <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-[#0058be] font-medium flex items-center gap-1 hover:underline transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Assignment</h1>
        
        {displayData && (
           <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
               <p className="font-semibold text-gray-800 text-lg mb-1">{displayData.teacher_name}</p>
               <div className="flex flex-col gap-1 text-sm text-gray-500">
                 <p><strong>Subject:</strong> {displayData.subject_name}</p>
                 <p><strong>Class/Section:</strong> {displayData.class_level_name} - {displayData.section_name}</p>
                 <p><strong>Academic Year:</strong> {displayData.academic_year_name}</p>
               </div>
           </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Assignment Role
                </label>
                <input 
                  type="text"
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all" 
                  placeholder="e.g. Class Teacher, Subject Teacher"
                />
            </div>
            
            <div className="flex gap-3">
                <button type="submit" className="bg-[#0058be] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={() => navigate(-1)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
            </div>
        </form>
      </div>
    </SchoolLayout>
  );
}