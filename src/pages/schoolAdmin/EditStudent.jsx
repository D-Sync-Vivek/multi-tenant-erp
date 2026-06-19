import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
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

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function StudentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/profiles/students/${id}/`);
        setStudent(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load student details.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/profiles/students/${id}/`);
      showToast("Student deleted successfully!", "success");
      setTimeout(() => navigate("/school-admin/students"), 1000);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete student.", "error");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "ST";
  };

  // ── Skeleton Loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-4 pb-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Skeleton style={{ width: 40, height: 40, borderRadius: 999 }} />
              <div className="flex-1">
                <Skeleton style={{ width: 200, height: 24 }} />
                <Skeleton style={{ width: 150, height: 14, marginTop: 4 }} />
              </div>
              <div className="flex gap-3">
                <Skeleton style={{ width: 80, height: 36, borderRadius: 8 }} />
                <Skeleton style={{ width: 80, height: 36, borderRadius: 8 }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="py-3 border-b border-outline-variant/10 last:border-0">
                    <Skeleton style={{ width: 100, height: 12 }} />
                    <Skeleton style={{ width: 150, height: 16, marginTop: 4 }} />
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-3 border-b border-outline-variant/10 last:border-0">
                    <Skeleton style={{ width: 100, height: 12 }} />
                    <Skeleton style={{ width: 120, height: 16, marginTop: 4 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  if (error || !student) {
    return (
      <SchoolLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
            <p className="text-on-surface-variant">{error || "Student not found."}</p>
            <button
              onClick={() => navigate("/school-admin/students")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  const { first_name, last_name, email, enrollment_number, date_of_birth, phone_number, blood_group, address, is_archived } = student;

  return (
    <SchoolLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-4 pb-12">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
              ? "bg-success text-white"
              : toast.type === "error"
                ? "bg-error text-white"
                : "bg-surface-container-high text-on-surface"
            }`}>
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
            </span>
            {toast.msg}
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-outline-variant/10 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Delete Student</h3>
                  <p className="text-sm text-on-surface-variant">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                Are you sure you want to delete <span className="font-bold text-on-surface">
                  {first_name} {last_name}
                </span>?
                All associated data will be permanently removed.
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
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-error text-white hover:bg-error/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {deleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Student"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/school-admin/students")}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-outline-variant/20">
                  {getInitials(first_name, last_name, email)}
                </div>
                <div>
                  <h1 className="text-2xl font-headline font-extrabold text-on-surface">
                    {first_name} {last_name}
                  </h1>
                  <p className="text-sm text-on-surface-variant">{email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-error font-bold text-sm rounded-lg bg-error/10 hover:bg-error/20 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Delete
            </button>
            <button
              onClick={() => navigate(`/school-admin/students/edit/${id}`)}
              className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg shadow-md hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Profile */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
            <h3 className="text-sm font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">badge</span>
              Academic Profile
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Enrollment Number</p>
                <p className="font-mono text-sm font-semibold text-on-surface mt-0.5">{enrollment_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Date of Birth</p>
                <p className="text-sm text-on-surface mt-0.5">{date_of_birth || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number</p>
                <p className="text-sm text-on-surface mt-0.5">{phone_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Blood Group</p>
                <p className="text-sm text-on-surface mt-0.5">{blood_group || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Residential Address</p>
                <p className="text-sm text-on-surface mt-0.5">{address || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Status</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${is_archived
                    ? "bg-outline-variant/20 text-outline"
                    : "bg-success/20 text-success"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${is_archived ? "bg-outline" : "bg-success animate-pulse"}`} />
                  {is_archived ? "Archived" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Class Enrollment */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
            <h3 className="text-sm font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">class</span>
              Class Enrollment
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Academic Year</p>
                <p className="text-sm text-on-surface mt-0.5">{student.academic_year_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Class Level</p>
                <p className="text-sm text-on-surface mt-0.5">{student.class_level_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant">Section</p>
                <p className="text-sm text-on-surface mt-0.5">{student.section_name || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}