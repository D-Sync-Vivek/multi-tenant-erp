import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function MappingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getMappingById(id);
        console.log("Fetched Mapping Data:", data);
        setMapping(data);
      } catch (err) {
        console.error("Failed to load mapping", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <SchoolLayout title="Mapping Details">
        <div className="p-8 flex justify-center items-center h-64 text-[#0058be]">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Mapping Details">
      <div className="p-8 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-[#0058be] font-medium flex items-center gap-1 hover:underline transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Directory
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Connection Details</h1>
        
        {mapping ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            {/* Header section showing the relationship */}
            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
              
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-2 rounded-full bg-[#e5eeff] text-[#0058be] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">escalator_warning</span>
                </div>
                <h3 className="font-bold text-gray-800">{mapping.parent_name || "Unknown Parent"}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Parent/Guardian</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#0058be] bg-blue-50 px-3 py-1 rounded-full mb-1">
                      {mapping.relationship || "Linked"}
                  </span>
                  <div className="w-full h-px bg-gray-300 relative">
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">arrow_forward</span>
                  </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-2 rounded-full bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <h3 className="font-bold text-gray-800">{mapping.student_name || "Unknown Student"}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Student</span>
              </div>

            </div>

            {/* Permissions Grid */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">Granted Permissions</h3>
            <div className="grid md:grid-cols-3 gap-6">
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className={`material-symbols-outlined ${mapping.is_primary_contact ? 'text-green-600' : 'text-gray-400'}`}>
                  {mapping.is_primary_contact ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Primary Contact</p>
                  <p className="text-xs text-gray-500 mt-1">Main point of contact for emergencies.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className={`material-symbols-outlined ${mapping.can_view_academics ? 'text-green-600' : 'text-gray-400'}`}>
                  {mapping.can_view_academics ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">View Academics</p>
                  <p className="text-xs text-gray-500 mt-1">Access to grades, attendance, and reports.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                <span className={`material-symbols-outlined ${mapping.can_pay_fees ? 'text-green-600' : 'text-gray-400'}`}>
                  {mapping.can_pay_fees ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Pay Fees</p>
                  <p className="text-xs text-gray-500 mt-1">Authorized to view and pay school fees.</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3 font-medium">
            <span className="material-symbols-outlined">error</span>
            Mapping data could not be found.
          </div>
        )}
      </div>
    </SchoolLayout>
  );
}