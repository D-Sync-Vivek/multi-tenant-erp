import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    enrollment_number: "",
    phone_number: "",
    is_archived: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getStudentById(id);

        // Safely extract the nested user data so the form pre-fills correctly
        setFormData({
          first_name: data.first_name || data.user?.first_name || "",
          last_name: data.last_name || data.user?.last_name || "",
          email: data.email || data.user?.email || "",
          enrollment_number: data.enrollment_number || "",
          phone_number: data.phone_number || "",
          is_archived: !!data.is_archived,
        });
      } catch (err) {
        console.error("Error loading student:", err);
        setError("Failed to load student profile.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Send flat fields to bypass Django's strict UUID validation.
      // Email is intentionally excluded — it lives on the User model and
      // is shown read-only below (see note near the email field).
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        enrollment_number: formData.enrollment_number,
        phone_number: formData.phone_number,
        is_archived: formData.is_archived,
      };

      await schoolAdminApi.updateStudent(id, payload);
      navigate("/school-admin/students");
    } catch (err) {
      console.error("Error updating student:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update student profile. Check console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SchoolLayout title="Edit Student">
        <div className="p-8 flex justify-center items-center h-64 text-[#0058be]">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Edit Student">
      <form onSubmit={handleSubmit} className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">Edit Profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Update the details below. Changes are saved to the student's profile record.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              First Name
            </label>
            <input
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all"
              placeholder="First Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Last Name
            </label>
            <input
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all"
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Enrollment Number
            </label>
            <input
              value={formData.enrollment_number}
              onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all"
              placeholder="e.g. STU-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] outline-none transition-all"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">
            Email Address
          </label>
          <input
            value={formData.email}
            disabled
            className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Email is the account login ID and can't be changed from this form.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
            Status
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_archived: false })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
                !formData.is_archived
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Active
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_archived: true })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
                formData.is_archived
                  ? "bg-slate-100 text-slate-600 border-slate-300"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Archived
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0058be] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </SchoolLayout>
  );
}