import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getStudentById(id);
        
        // Safely extract the nested user data so the form pre-fills correctly
        setFormData({
          first_name: data.first_name || data.user?.first_name || "",
          last_name: data.last_name || data.user?.last_name || "",
          email: data.email || data.user?.email || ""
        });
      } catch (err) {
        console.error("Error loading student:", err);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send ONLY flat fields to bypass Django's strict UUID validation
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      };

      await schoolAdminApi.updateStudent(id, payload);
      alert("Updated successfully!");
      navigate("/school-admin/students");
    } catch (err) {
      console.error("Error updating student:", err);
      alert("Failed to update.");
    }
  };

  return (
    <SchoolLayout title="Edit Student">
      <form onSubmit={handleSubmit} className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h1>
        
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">First Name</label>
            <input 
              value={formData.first_name} 
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all" 
              placeholder="First Name"
            />
        </div>

        <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Last Name</label>
            <input 
              value={formData.last_name} 
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all" 
              placeholder="Last Name"
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
    </SchoolLayout>
  );
}