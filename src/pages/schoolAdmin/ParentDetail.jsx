import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useTheme } from "../../context/ThemeContext";

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
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-primary font-bold hover:underline transition-all font-body"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Directory
        </button>

        {loading ? (
          <div className="flex items-center justify-center min-h-[20vh] text-primary font-semibold gap-2 font-body">
            <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            Loading details...
          </div>
        ) : error ? (
          <div className="p-4 bg-error/10 text-error rounded-md border border-error/20 font-body">
            {error}
          </div>
        ) : parent ? (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-6">
              {parent.first_name} {parent.last_name}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-body">
              <p>
                <span className="font-bold text-on-surface-variant">Email:</span>{" "}
                <span className="text-on-surface">{parent.email}</span>
              </p>
              <p>
                <span className="font-bold text-on-surface-variant">Phone:</span>{" "}
                <span className="text-on-surface">{parent.phone_number}</span>
              </p>
              <p>
                <span className="font-bold text-on-surface-variant">Occupation:</span>{" "}
                <span className="text-on-surface">{parent.occupation}</span>
              </p>
              <p>
                <span className="font-bold text-on-surface-variant">Emergency Contact:</span>{" "}
                <span className="text-on-surface">{parent.emergency_contact_number}</span>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </SchoolLayout>
  );
}