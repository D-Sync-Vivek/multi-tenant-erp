import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function ParentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParent = async () => {
      setLoading(true);
      try {
        const data = await schoolAdminApi.getParentDetails(id);
        setParent(data);
      } catch (err) {
        console.error("Fetch Parent Error:", err);
        setError("Failed to load parent details.");
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  return (
    <SchoolLayout title="Guardian Details">
      <div className="max-w-4xl mx-auto p-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-[#0058be] font-bold hover:underline"
        >
          <span className="material-symbols-outlined">arrow_back</span> Back to Directory
        </button>

        {loading ? (
          <div>Loading details...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
        ) : parent ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold mb-6">{parent.first_name} {parent.last_name}</h1>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <p><span className="font-bold text-gray-500">Email:</span> {parent.email}</p>
              <p><span className="font-bold text-gray-500">Phone:</span> {parent.phone_number}</p>
              <p><span className="font-bold text-gray-500">Occupation:</span> {parent.occupation}</p>
              <p><span className="font-bold text-gray-500">Emergency Contact:</span> {parent.emergency_contact_number}</p>
            </div>
          </div>
        ) : null}
      </div>
    </SchoolLayout>
  );
}