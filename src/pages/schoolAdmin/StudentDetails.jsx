import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

// ─────────────────────────────────────────────
// Skeleton Loader (shimmer)
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
// Helpers (unchanged)
// ─────────────────────────────────────────────
const labelClass = "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";
const viewFieldClass = "text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100";
const editFieldClass = "w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md";

function SectionCard({ title, icon, borderColor = "border-blue-400", children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className={`w-1 h-5 ${borderColor} rounded-full`} style={{ background: "currentColor" }}></span>
        <span className="material-symbols-outlined text-[18px] text-gray-400">{icon}</span>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Field({ label, viewValue, isEditing, children }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      {isEditing ? children : <p className={viewFieldClass}>{viewValue || "N/A"}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "",
    enrollment_number: "", date_of_birth: "",
    phone_number: "", blood_group: "", address: "",
    is_archived: false,
  });

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch all data ──
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [studentData, enrollmentRes, yearsRes, classRes] = await Promise.all([
        schoolAdminApi.getStudentById(id),
        api.get(`academics/enrollments/?student=${id}`),
        schoolAdminApi.getAcademicYears(),
        schoolAdminApi.getClassLevels(),
      ]);

      setStudent(studentData);
      setFormData({
        first_name: studentData.first_name || "",
        last_name: studentData.last_name || "",
        email: studentData.email || studentData.user?.email || "",
        enrollment_number: studentData.enrollment_number || "",
        date_of_birth: studentData.date_of_birth || "",
        phone_number: studentData.phone_number || "",
        blood_group: studentData.blood_group || "",
        address: studentData.address || "",
        is_archived: !!studentData.is_archived,
      });

      const years = yearsRes?.results ?? yearsRes ?? [];
      const classes = classRes?.results ?? classRes ?? [];
      setAcademicYears(Array.isArray(years) ? years : []);
      setClassLevels(Array.isArray(classes) ? classes : []);

      const results = enrollmentRes.data?.results || enrollmentRes.data || [];
      if (results.length > 0) {
        const enr = results[0];
        setEnrollment(enr);
        setEnrollmentId(enr.id);
        setSelectedYear(String(enr.academic_year || ""));
        setSelectedClass(String(enr.class_level || ""));
        setSelectedSection(String(enr.section || ""));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load student details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id, location.state?.refresh]);

  // ── Fetch sections on class change ──
  useEffect(() => {
    if (!selectedClass) { setSections([]); return; }
    api.get(`academics/sections/?class_level=${selectedClass}`)
      .then(res => setSections(res.data?.results || res.data || []))
      .catch(() => setSections([]));
  }, [selectedClass]);

  // ── Save handler ──
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await schoolAdminApi.updateStudent(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        enrollment_number: formData.enrollment_number,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        address: formData.address || null,
        is_archived: formData.is_archived,
      });

      if (selectedClass && selectedYear) {
        const enrollmentPayload = {
          student: id,
          academic_year: selectedYear,
          class_level: selectedClass,
          section: selectedSection || null,
        };
        if (enrollmentId) {
          await api.patch(`academics/enrollments/${enrollmentId}/`, enrollmentPayload);
        } else {
          await api.post(`academics/enrollments/`, enrollmentPayload);
        }
      }

      await fetchAll();
      setIsEditing(false);
      showToast("Student updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        showToast(
          "Failed to save: " + Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" | "),
          "error"
        );
      } else {
        showToast("Failed to save changes. Please check your connection.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/profiles/students/${id}/`);
      showToast("Student deleted successfully!", "success");
      setTimeout(() => navigate("/school-admin/students"), 1000);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete student. Please try again.", "error");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <SchoolLayout title="Student Details">
        <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12">
          <div className="flex flex-col gap-6">
            {/* Top bar skeleton */}
            <div className="flex justify-between items-center">
              <Skeleton style={{ width: 140, height: 20 }} />
              <div className="flex gap-3">
                <Skeleton style={{ width: 80, height: 36, borderRadius: 8 }} />
                <Skeleton style={{ width: 80, height: 36, borderRadius: 8 }} />
              </div>
            </div>
            {/* Identity card skeleton */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-5">
                <Skeleton style={{ width: 64, height: 64, borderRadius: 16 }} />
                <div className="flex-1">
                  <Skeleton style={{ width: 200, height: 24 }} />
                  <Skeleton style={{ width: 150, height: 14, marginTop: 4 }} />
                </div>
                <Skeleton style={{ width: 100, height: 36, borderRadius: 8 }} />
              </div>
            </div>
            {/* Profile and enrollment skeletons */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                    <Skeleton style={{ width: 120, height: 12 }} />
                    <Skeleton style={{ width: 160, height: 16, marginTop: 4 }} />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                    <Skeleton style={{ width: 120, height: 12 }} />
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
      <SchoolLayout title="Student Details">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
            <p className="text-gray-500">{error || "Student not found."}</p>
            <button
              onClick={() => navigate("/school-admin/students")}
              className="mt-4 px-4 py-2 bg-[#0058be] text-white rounded-lg text-sm font-bold"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  // ── Render ──
  const fName = student.first_name || student.user?.first_name || "";
  const lName = student.last_name || student.user?.last_name || "";
  const displayName = `${fName} ${lName}`.trim() || student.user?.email || "Unknown Student";
  const emailAddr = student.email || student.user?.email || "No Email";
  const initials = fName && lName ? `${fName[0]}${lName[0]}`.toUpperCase() : "ST";

  const yearName = academicYears.find(y => String(y.id) === String(selectedYear))?.name || "N/A";
  const className = classLevels.find(c => String(c.id) === String(selectedClass))?.name || "N/A";
  const sectionName = sections.find(s => String(s.id) === String(selectedSection))?.name
    || (enrollment?.section_name) || (selectedSection ? `Section ${selectedSection}` : "N/A");

  return (
    <SchoolLayout title="Student Details">
      <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">

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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Student</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-900">{displayName}</span>?
                All associated data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
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

        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={() => navigate("/school-admin/students")}
            className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Directory
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-md hover:bg-red-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-md hover:bg-[#dce9ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit Profile
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(false); fetchAll(); }}
                  className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70"
                >
                  {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Identity Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e5eeff] text-[#0058be] flex items-center justify-center font-bold text-xl border border-blue-100">
                {initials}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={formData.first_name}
                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="First Name"
                        className={editFieldClass}
                      />
                      <input
                        value={formData.last_name}
                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Last Name"
                        className={editFieldClass}
                      />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email Address"
                      className={`${editFieldClass} font-mono text-xs`}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">{emailAddr}</p>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, is_archived: false }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${!formData.is_archived ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, is_archived: true }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${formData.is_archived ? "bg-gray-100 text-gray-600 border-gray-300" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">inventory_2</span> Archived
                  </button>
                </div>
              ) : (
                student.is_archived
                  ? <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">Archived Profile</span>
                  : <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Active
                  </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <SectionCard title="Academic Profile" icon="assignment_ind">
          <Field label="Enrollment Number" viewValue={student.enrollment_number} isEditing={isEditing}>
            <input value={formData.enrollment_number} onChange={e => setFormData({ ...formData, enrollment_number: e.target.value })} className={editFieldClass} placeholder="e.g. STU-2024-001" />
          </Field>
          <Field label="Date of Birth" viewValue={student.date_of_birth} isEditing={isEditing}>
            <input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className={editFieldClass} />
          </Field>
          <Field label="Phone Number" viewValue={student.phone_number} isEditing={isEditing}>
            <input value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className={editFieldClass} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Blood Group" viewValue={student.blood_group} isEditing={isEditing}>
            <select value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })} className={editFieldClass}>
              <option value="">Select Group</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Residential Address" viewValue={student.address} isEditing={isEditing}>
              <textarea rows="2" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={`${editFieldClass} resize-none`} placeholder="Street, City, State" />
            </Field>
          </div>
        </SectionCard>

        {/* Class Enrollment */}
        <SectionCard title="Class Enrollment" icon="school">
          <Field label="Academic Year" viewValue={yearName} isEditing={isEditing}>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={editFieldClass}>
              <option value="">Select Year</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </Field>
          <Field label="Class Level" viewValue={className} isEditing={isEditing}>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className={editFieldClass}>
              <option value="">Select Class</option>
              {classLevels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Section" viewValue={sectionName} isEditing={isEditing}>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className={editFieldClass} disabled={!selectedClass}>
              <option value="">{selectedClass ? (sections.length ? "Select Section" : "No sections") : "Pick class first"}</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </SectionCard>

      </div>
    </SchoolLayout>
  );
}