import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

// ─────────────────────────────────────────────
// Shimmer keyframe injected once into <head>
// ─────────────────────────────────────────────
function InjectShimmer() {
  useEffect(() => {
    if (document.getElementById("skeleton-shimmer-style")) return;
    const tag = document.createElement("style");
    tag.id = "skeleton-shimmer-style";
    tag.textContent = `
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(tag);
  }, []);
  return null;
}

// ─────────────────────────────────────────────
// Skeleton atom (inline styles — no Tailwind dep)
// ─────────────────────────────────────────────
function Sk({ w, h, r = 6, mt = 0, mb = 0, full = false }) {
  return (
    <div
      style={{
        width: full ? "100%" : w,
        height: h,
        borderRadius: r,
        marginTop: mt,
        marginBottom: mb,
        flexShrink: 0,
        background: "linear-gradient(90deg,#ececec 25%,#d8d8d8 50%,#ececec 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
      }}
    />
  );
}

// ─────────────────────────────────────────────
// Full-page skeleton — mirrors exact layout
// ─────────────────────────────────────────────
function PageSkeleton() {
  const card = {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ maxWidth: 896, padding: "16px 32px 48px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Sk w={160} h={18} />
        <div style={{ display: "flex", gap: 8 }}>
          <Sk w={80} h={36} r={8} />
          <Sk w={110} h={36} r={8} />
        </div>
      </div>

      {/* ── Identity card ── */}
      <div style={{ ...card, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Avatar */}
            <Sk w={64} h={64} r={14} />
            {/* Name + subtitle */}
            <div>
              <Sk w={200} h={26} mb={8} />
              <Sk w={120} h={12} />
            </div>
          </div>
          {/* Role badge */}
          <Sk w={120} h={36} r={8} />
        </div>
      </div>

      {/* ── Assignment Details card ── */}
      <div style={{ ...card, overflow: "hidden" }}>
        {/* Card header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 20, borderRadius: 4, background: "#60a5fa", flexShrink: 0 }} />
          <Sk w={18} h={18} r={4} />
          <Sk w={140} h={14} />
        </div>
        {/* Card body — 2-col grid */}
        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Sk w={90} h={10} mb={8} />
              <Sk full h={36} r={6} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// Shared style tokens (same as Student)
// ─────────────────────────────────────────────
const labelClass =
  "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";
const viewFieldClass =
  "text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100";
const editFieldClass =
  "w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md";

// ─────────────────────────────────────────────
// SectionCard + Field (same as Student)
// ─────────────────────────────────────────────
function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-blue-400 shrink-0" />
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
export default function EditTeacherAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [assignment, setAssignment] = useState(null);

  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classLevelId, setClassLevelId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const assignData = await schoolAdminApi.getTeacherAssignmentById(id);
      setAssignment(assignData);
      setTeacherId(assignData.teacher_id || "");
      setSubjectId(assignData.subject_id || "");
      setClassLevelId(assignData.class_level_id || "");
      setSectionId(assignData.section_id || "");
      setAcademicYearId(assignData.academic_year_id || "");
      setIsClassTeacher(assignData.is_class_teacher || false);

      const [teachersRes, subjectsRes, classLevelsRes, academicYearsRes] = await Promise.all([
        api.get("/profiles/teachers/"),
        api.get("/academics/subjects/"),
        api.get("/academics/class-levels/"),
        api.get("/academics/academic-years/"),
      ]);

      setTeachers(teachersRes.data.results || teachersRes.data || []);
      setSubjects(subjectsRes.data.results || subjectsRes.data || []);
      setClassLevels(classLevelsRes.data.results || classLevelsRes.data || []);
      setAcademicYears(academicYearsRes.data.results || academicYearsRes.data || []);

      if (assignData.class_level_id) {
        const sectionsRes = await api.get(`/academics/sections/?class_level=${assignData.class_level_id}`);
        setSections(sectionsRes.data.results || sectionsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showToast("Failed to load assignment data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (!classLevelId) { setSections([]); setSectionId(""); return; }
    api.get(`/academics/sections/?class_level=${classLevelId}`)
      .then((res) => setSections(res.data.results || res.data || []))
      .catch(() => setSections([]));
  }, [classLevelId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        teacher: teacherId,
        subject: subjectId,
        class_level: classLevelId,
        section: sectionId || null,
        academic_year: academicYearId,
        is_class_teacher: isClassTeacher,
      };
      await schoolAdminApi.updateTeacherAssignment(id, payload);
      const updated = await schoolAdminApi.getTeacherAssignmentById(id);
      setAssignment(updated);
      setTeacherId(updated.teacher_id || "");
      setSubjectId(updated.subject_id || "");
      setClassLevelId(updated.class_level_id || "");
      setSectionId(updated.section_id || "");
      setAcademicYearId(updated.academic_year_id || "");
      setIsClassTeacher(updated.is_class_teacher || false);
      showToast("Assignment updated successfully!");
      setIsEditing(false);
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        : "Failed to update assignment.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await schoolAdminApi.deleteTeacherAssignment(id);
      showToast("Assignment deleted successfully!", "success");
      setTimeout(() => navigate("/school-admin/teacher-assignment"), 1000);
    } catch (err) {
      showToast("Failed to delete assignment.", "error");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (assignment) {
      setTeacherId(assignment.teacher_id || "");
      setSubjectId(assignment.subject_id || "");
      setClassLevelId(assignment.class_level_id || "");
      setSectionId(assignment.section_id || "");
      setAcademicYearId(assignment.academic_year_id || "");
      setIsClassTeacher(assignment.is_class_teacher || false);
    }
    setIsEditing(false);
  };

  // ── Skeleton ──
  if (loading) {
    return (
      <SchoolLayout title="Assignment Details">
        <InjectShimmer />
        <PageSkeleton />
      </SchoolLayout>
    );
  }

  // ── Derived values ──
  const teacherName = assignment?.teacher_name || "Unknown Teacher";
  const subjectName = assignment?.subject_name || "N/A";
  const classLevelName = assignment?.class_level_name || "N/A";
  const sectionName = assignment?.section_name || "N/A";
  const academicYearName = assignment?.academic_year_name || "N/A";
  const role = assignment?.is_class_teacher ? "Class Teacher" : "Subject Teacher";

  const nameParts = teacherName.trim().split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : teacherName.slice(0, 2).toUpperCase();

  return (
    <SchoolLayout title="Assignment Details">
      <InjectShimmer />
      <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success" ? "bg-green-600 text-white"
            : toast.type === "error" ? "bg-red-600 text-white"
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
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Assignment</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete the assignment for{" "}
                <span className="font-bold text-gray-900">{teacherName}</span> — {subjectName} ({classLevelName})?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                  {deleting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>) : "Delete Assignment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Top Bar ── */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <button onClick={() => navigate("/school-admin/teacher-assignment")}
            className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Directory
          </button>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-md hover:bg-red-100 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">delete</span>Delete
                </button>
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-md hover:bg-[#dce9ff] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">edit</span>Edit Profile
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70">
                  {saving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Identity Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e5eeff] text-[#0058be] flex items-center justify-center font-bold text-xl border border-blue-100">
                {initials}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <p className={labelClass}>Teacher</p>
                      <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={editFieldClass} required>
                        <option value="">Select Teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.first_name} {t.last_name}{t.employee_id ? ` (${t.employee_id})` : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className={labelClass}>Subject</p>
                      <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={editFieldClass} required>
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{teacherName}</h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">{subjectName}</p>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {isEditing ? (
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors select-none">
                  <input type="checkbox" checked={isClassTeacher} onChange={() => setIsClassTeacher(!isClassTeacher)}
                    className="w-4 h-4 rounded text-[#0058be] focus:ring-[#0058be]/50 border-gray-300" />
                  <span className="text-sm font-bold text-[#0058be]">Class Teacher</span>
                </label>
              ) : assignment?.is_class_teacher ? (
                <span className="bg-[#eff4ff] text-[#0058be] border border-blue-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">stars</span>Class Teacher
                </span>
              ) : (
                <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>Subject Teacher
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Assignment Details SectionCard ── */}
        <SectionCard title="Assignment Details" icon="assignment_ind">
          <Field label="Class Level" viewValue={classLevelName} isEditing={isEditing}>
            <select value={classLevelId} onChange={(e) => { setClassLevelId(e.target.value); setSectionId(""); }} className={editFieldClass} required>
              <option value="">Select Class</option>
              {classLevels.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </Field>

          <Field label="Section" viewValue={sectionName} isEditing={isEditing}>
            <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className={editFieldClass} disabled={!classLevelId}>
              <option value="">{classLevelId ? (sections.length ? "Select Section" : "No sections available") : "Pick class first"}</option>
              {sections.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </Field>

          <Field label="Academic Year" viewValue={academicYearName} isEditing={isEditing}>
            <select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)} className={editFieldClass} required>
              <option value="">Select Academic Year</option>
              {academicYears.map((y) => (<option key={y.id} value={y.id}>{y.name}</option>))}
            </select>
          </Field>

          <Field label="Role" viewValue={role} isEditing={false} />
        </SectionCard>

      </div>
    </SchoolLayout>
  );
}