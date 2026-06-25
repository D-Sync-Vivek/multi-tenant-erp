import React, { useState } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";
import { useSchoolAdmin } from "../../context/SchoolAdminProvider";

// ── Skeleton shimmer ──
if (typeof document !== "undefined" && !document.getElementById("skeleton-shimmer-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-shimmer-style";
  s.textContent = `@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}
const SHIMMER = {
  background: "linear-gradient(90deg,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 25%,color-mix(in srgb,var(--color-outline-variant) 28%,var(--color-surface-container-lowest)) 50%,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.4s ease infinite",
};
function Sk({ w, h, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...SHIMMER, ...style }} />;
}

// ── Full‑page Skeleton ──
function AssignTeacherSkeleton() {
  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="px-4 sm:px-6 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Sk w={240} h={32} />
            <Sk w={340} h={16} style={{ marginTop: 4 }} />
          </div>
          <Sk w={100} h={36} r={8} />
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
          <h2 className="text-lg font-headline font-bold text-on-surface mb-5 flex items-center gap-2 border-b border-outline-variant/10 pb-3">
            <Sk w={24} h={24} r={4} />
            <Sk w={160} h={20} />
          </h2>

          <form className="space-y-5">
            {/* Select Educator */}
            <div>
              <Sk w={120} h={12} r={4} style={{ marginBottom: 6 }} />
              <Sk w="100%" h={44} r={8} />
            </div>

            {/* Two column grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Sk w={110} h={12} r={4} style={{ marginBottom: 6 }} />
                <Sk w="100%" h={44} r={8} />
              </div>
              <div>
                <Sk w={110} h={12} r={4} style={{ marginBottom: 6 }} />
                <Sk w="100%" h={44} r={8} />
              </div>
            </div>

            {/* Two column grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Sk w={100} h={12} r={4} style={{ marginBottom: 6 }} />
                <Sk w="100%" h={44} r={8} />
              </div>
              <div>
                <Sk w={100} h={12} r={4} style={{ marginBottom: 6 }} />
                <Sk w="100%" h={44} r={8} />
              </div>
            </div>

            {/* Class Teacher toggle */}
            <div className="pt-3 border-t border-outline-variant/10">
              <div className="flex items-center justify-between p-3 bg-tertiary/10 border border-tertiary/20 rounded-lg">
                <div>
                  <Sk w={160} h={16} />
                </div>
                <Sk w={20} h={20} r={4} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <Sk w={100} h={40} r={8} />
              <Sk w={160} h={40} r={8} />
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}

// ── Main Component ──
export default function AssignTeacher() {
  const navigate = useNavigate();
  const {
    teachers,
    academicYears,
    classLevels,
    sections,
    subjects,
    loading: initialLoading,
    refreshAcademics,
  } = useSchoolAdmin();

  // Form State
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        is_class_teacher: isClassTeacher,
        teacher: selectedTeacher,
        academic_year: selectedYear,
        class_level: selectedClass,
        section: selectedSection,
        subject: selectedSubject,
      };

      await api.post(`academics/teacher-assignments/`, payload);

      await refreshAcademics();
      alert("Teacher assigned successfully!");
      navigate("/school-admin/teacher-assignment");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        setError(
          Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ")
        );
      } else {
        setError(err.message || "Failed to assign teacher.");
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTeacher("");
    setSelectedYear("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
    setIsClassTeacher(false);
    setError(null);
  };

  // ── Skeleton ──
  if (initialLoading) {
    return <AssignTeacherSkeleton />;
  }

  // ── Render ──
  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="px-4 sm:px-6 py-6 md:py-8">
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
              Assign Teacher to Class
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body max-w-xl">
              Allocate faculty members to specific subjects, grade levels, and sections.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teacher-assignment")}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-lowest border border-outline-variant/10 text-primary text-sm font-semibold rounded-md hover:bg-surface-container-high transition shadow-sm font-body"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Directory
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/10 text-error rounded-md border border-error/20 flex gap-2 shadow-sm items-center">
            <span className="material-symbols-outlined text-xl">error</span>
            <p className="text-sm font-medium font-body">{error}</p>
          </div>
        )}

        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
          <h2 className="text-lg font-headline font-bold text-on-surface mb-5 flex items-center gap-2 border-b border-outline-variant/10 pb-3">
            <span className="material-symbols-outlined text-primary text-xl">engineering</span>
            Configuration Matrix
          </h2>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-body">
                Select Educator
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  person_search
                </span>
                <select
                  required
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 font-medium text-on-surface appearance-none font-body"
                >
                  <option value="">Select Teacher Profile...</option>
                  {initialLoading ? (
                    <option disabled>Loading data...</option>
                  ) : (
                    teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name || t.last_name
                          ? `${t.first_name} ${t.last_name}`
                          : t.email}{" "}
                        {t.employee_id ? `(EMP: ${t.employee_id})` : ""}
                      </option>
                    ))
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-body">
                  Academic Year
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    calendar_month
                  </span>
                  <select
                    required
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 font-medium text-on-surface appearance-none font-body"
                  >
                    <option value="">Select Academic Cycle...</option>
                    {initialLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-body">
                  Subject Selection
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    menu_book
                  </span>
                  <select
                    required
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 font-medium text-on-surface appearance-none font-body"
                  >
                    <option value="">Choose Subject/Course...</option>
                    {initialLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-body">
                  Class Level
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    school
                  </span>
                  <select
                    required
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 font-medium text-on-surface appearance-none font-body"
                  >
                    <option value="">Select Grade/Class...</option>
                    {initialLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      classLevels.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 font-body">
                  Section / Batch
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    groups
                  </span>
                  <select
                    required
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 font-medium text-on-surface appearance-none font-body"
                  >
                    <option value="">Select Section...</option>
                    {initialLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/10">
              <label className="flex items-center justify-between p-3 bg-tertiary/10 border border-tertiary/20 rounded-lg cursor-pointer hover:bg-tertiary/20 transition-colors">
                <div>
                  <span className="font-bold text-sm text-tertiary font-body">
                    Assign as Class Teacher
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isClassTeacher}
                  onChange={() => setIsClassTeacher(!isClassTeacher)}
                  className="w-4 h-4 rounded text-tertiary focus:ring-tertiary/50 border-outline-variant/20"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-5 py-2 text-sm text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md transition font-body"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-md shadow-md hover:bg-primary/90 transition flex items-center gap-1.5 font-body"
              >
                {loading ? "Processing..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}