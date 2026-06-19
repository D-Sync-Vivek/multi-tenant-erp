import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

// ─────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────
function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background: "linear-gradient(90deg, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 25%, color-mix(in srgb, var(--color-outline-variant) 28%, var(--color-surface-container-lowest)) 50%, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

function MappingSkeleton() {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <Skeleton style={{ width: 120, height: 20 }} />
      <Skeleton style={{ width: 200, height: 32, marginTop: 20 }} />
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant/10">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8">
          <div className="flex flex-col items-center">
            <Skeleton style={{ width: 56, height: 56, borderRadius: 999 }} />
            <Skeleton style={{ width: 100, height: 16, marginTop: 8 }} />
            <Skeleton style={{ width: 80, height: 10, marginTop: 4 }} />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <Skeleton style={{ width: 80, height: 24, borderRadius: 999 }} />
            <Skeleton style={{ width: "100%", height: 2, marginTop: 8 }} />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton style={{ width: 56, height: 56, borderRadius: 999 }} />
            <Skeleton style={{ width: 100, height: 16, marginTop: 8 }} />
            <Skeleton style={{ width: 80, height: 10, marginTop: 4 }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-outline-variant/10 rounded-lg">
              <Skeleton style={{ width: 24, height: 24 }} />
              <Skeleton style={{ width: 120, height: 14, marginTop: 8 }} />
              <Skeleton style={{ width: 160, height: 10, marginTop: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Helper: Toggle Switch
// ─────────────────────────────────────────────
function ToggleSwitch({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-outline-variant/10 last:border-0 last:pb-0 first:pt-0">
      <div>
        <p className="font-headline font-bold text-on-surface text-sm">{label}</p>
        {description && <p className="text-xs text-on-surface-variant">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1 flex-shrink-0 ${enabled ? "bg-primary" : "bg-surface-container-high"
          }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${enabled ? "translate-x-5" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function MappingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    relationship: "",
    is_primary_contact: false,
    can_view_academics: false,
    can_pay_fees: false,
  });

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch mapping ──
  const fetchMapping = async () => {
    try {
      setLoading(true);
      const data = await schoolAdminApi.getMappingById(id);
      setMapping(data);
      setFormData({
        relationship: data.relationship || "",
        is_primary_contact: data.is_primary_contact || false,
        can_view_academics: data.can_view_academics || false,
        can_pay_fees: data.can_pay_fees || false,
      });
    } catch (err) {
      console.error("Failed to load mapping", err);
      setError("Failed to load mapping details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapping();
  }, [id]);

  // ── Save handler ──
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        relationship: formData.relationship,
        is_primary_contact: formData.is_primary_contact,
        can_view_academics: formData.can_view_academics,
        can_pay_fees: formData.can_pay_fees,
      };
      await api.patch(`/profiles/parent-student-mappings/${id}/`, payload);
      await fetchMapping();
      setIsEditing(false);
      showToast("Mapping updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      const msg = err.response?.data
        ? Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ")
        : "Failed to save changes.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/profiles/parent-student-mappings/${id}/`);
      showToast("Mapping deleted successfully!", "success");
      setTimeout(() => navigate("/school-admin/mapping"), 1000);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete mapping. Please try again.", "error");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Skeleton Loading ──
  if (loading) {
    return (
      <SchoolLayout title="Mapping Details">
        <MappingSkeleton />
      </SchoolLayout>
    );
  }

  if (error || !mapping) {
    return (
      <SchoolLayout title="Mapping Details">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
            <p className="text-on-surface-variant">{error || "Mapping not found."}</p>
            <button
              onClick={() => navigate("/school-admin/mapping")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  // ── Render ──
  return (
    <SchoolLayout title="Mapping Details">
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
            ? "bg-green-600 text-white"
            : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-800"
            }`}>
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
            </span>
            {toast.msg}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-outline-variant/10 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Delete Mapping</h3>
                  <p className="text-sm text-on-surface-variant">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                Are you sure you want to delete the mapping between <span className="font-bold text-on-surface">
                  {mapping.parent_name || "Unknown Parent"}
                </span> and <span className="font-bold text-on-surface">
                  {mapping.student_name || "Unknown Student"}
                </span>?
                All associated permissions will be removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/10 text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-error text-white hover:bg-error/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Mapping"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-primary font-medium flex items-center gap-1 hover:underline transition-all font-body"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Directory
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error text-sm font-bold rounded-lg hover:bg-error/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(false); fetchMapping(); }}
                  className="px-4 py-2 text-sm text-on-surface-variant font-bold hover:bg-surface-container-high rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-70"
                >
                  {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-6">
          Connection Details
        </h1>

        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">

          {/* Header section: Parent ↔ Student */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b border-outline-variant/10 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 mb-2 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">escalator_warning</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface">
                {mapping.parent_name || "Unknown Parent"}
              </h3>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-body">
                Parent/Guardian
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full sm:w-auto">
              {/* Relationship – dropdown in edit mode */}
              {isEditing ? (
                <div className="w-full flex flex-col items-center gap-2">
                  <label className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full max-w-xs px-4 py-2 rounded-lg border border-outline-variant/20 text-sm font-body text-center bg-surface-container-low text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              ) : (
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-1 font-body">
                  {mapping.relationship || "Linked"}
                </span>
              )}
              <div className="w-full h-px bg-outline-variant/30 relative">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">
                  arrow_forward
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 mb-2 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface">
                {mapping.student_name || "Unknown Student"}
              </h3>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-body">
                Student
              </span>
            </div>
          </div>

          {/* Permissions */}
          <h3 className="text-lg font-headline font-bold text-on-surface mb-4">
            Granted Permissions
          </h3>

          {isEditing ? (
            // Edit mode: toggles
            <div className="space-y-2">
              <ToggleSwitch
                label="Primary Contact"
                description="Main point of contact for emergencies."
                enabled={formData.is_primary_contact}
                onChange={() => setFormData({ ...formData, is_primary_contact: !formData.is_primary_contact })}
              />
              <ToggleSwitch
                label="View Academics"
                description="Access to grades, attendance, and reports."
                enabled={formData.can_view_academics}
                onChange={() => setFormData({ ...formData, can_view_academics: !formData.can_view_academics })}
              />
              <ToggleSwitch
                label="Pay Fees"
                description="Authorized to view and pay school fees."
                enabled={formData.can_pay_fees}
                onChange={() => setFormData({ ...formData, can_pay_fees: !formData.can_pay_fees })}
              />
            </div>
          ) : (
            // View mode: cards
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant/10 flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${mapping.is_primary_contact ? "text-success" : "text-outline"
                    }`}
                >
                  {mapping.is_primary_contact ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="font-semibold text-on-surface text-sm font-headline">
                    Primary Contact
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 font-body">
                    Main point of contact for emergencies.
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant/10 flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${mapping.can_view_academics ? "text-success" : "text-outline"
                    }`}
                >
                  {mapping.can_view_academics ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="font-semibold text-on-surface text-sm font-headline">
                    View Academics
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 font-body">
                    Access to grades, attendance, and reports.
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant/10 flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${mapping.can_pay_fees ? "text-success" : "text-outline"
                    }`}
                >
                  {mapping.can_pay_fees ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="font-semibold text-on-surface text-sm font-headline">
                    Pay Fees
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 font-body">
                    Authorized to view and pay school fees.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}