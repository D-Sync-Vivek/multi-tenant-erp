import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useSchoolAdmin } from "../../context/SchoolAdminProvider";
import api from "../../services/axiosClient";

/* ─────────────────────────────────────────────
   Skeleton Shimmer Styles Injection
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
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
function AddStudentSkeleton() {
  return (
    <SchoolLayout>
      <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 animate-pulse">
        <div className="flex justify-between items-start gap-3">
          <Sk w={50} h={20} />
         <div className="flex gap-2">
           <Sk w={50} h={20} />
          <Sk w={100} h={20} />
         </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <Sk w={64} h={64} r={16} />
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5"><Sk w={70} h={10} /><Sk h={38} className="w-full" /></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {Array.from({ length: 2 }).map((_, sIdx) => (
          <div key={sIdx} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
              <Sk w={16} h={16} r={999} />
              <Sk w={120} h={16} />
            </div>
            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5"><Sk w={80} h={10} /><Sk h={38} className="w-full" /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SchoolLayout>
  );
}

/* ─────────────────────────────────────────────
   Unified Design System Specifications
───────────────────────────────────────────── */
const labelClass = "text-[10px] md:text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-1.5 block";
const editFieldClass = "w-full text-xs md:text-sm font-semibold text-on-surface bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 py-2 rounded-lg transition";

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary shrink-0" />
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant/60">{icon}</span>
        <h3 className="text-sm font-headline font-bold text-on-surface">{title}</h3>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Entry Component Architecture
───────────────────────────────────────────── */
export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromQuickAdd = location.state?.fromQuickAdd || false;
  const {
    classLevels,
    sections,
    academicYears,
    loading: loadingOptions,
    refreshStats,
    refreshAcademics,
  } = useSchoolAdmin();

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Profile fields
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");

  // Enrollment fields
  const [classLevel, setClassLevel] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [filteredSections, setFilteredSections] = useState([]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filter sections by class ──
  useEffect(() => {
    if (classLevel) {
      setFilteredSections(
        sections.filter(
          (s) => String(s.class_level) === String(classLevel) || String(s.class_level?.id) === String(classLevel)
        )
      );
    } else {
      setFilteredSections(sections);
    }
    setSection("");
  }, [classLevel, sections]);

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : firstName ? firstName.slice(0, 2).toUpperCase() : "ST";

  // ── Submit ──
  const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const registrationPayload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      enrollment_number: enrollmentNumber,
      is_archived: false,
      ...(dateOfBirth && { date_of_birth: dateOfBirth }),
      ...(phoneNumber && { phone_number: phoneNumber }),
      ...(bloodGroup && { blood_group: bloodGroup }),
      ...(address && { address }),
    };

  
    const studentProfile = await schoolAdminApi.createStudentProfile(registrationPayload);

    // Enroll the student if profile creation returned an ID and enrollment metrics are present
    if (classLevel && academicYear && studentProfile?.id) {
      await api.post(`academics/enrollments/`, {
        student: studentProfile.id,
        academic_year: academicYear,
        class_level: classLevel,
        section: section || null,
      });
    }

    showToast("Student registered successfully!");
    refreshStats();
    refreshAcademics();
    setTimeout(() => navigate("/school-admin/students"), 1000);
  } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string" && data.includes("<!DOCTYPE")) {
          setError("Server Error (500). Please check framework stack.");
        } else {
          setError(Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(" | "));
        }
      } else {
        setError(err.message);
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) return <AddStudentSkeleton />;

  // ── Main render ──
  return (
    <SchoolLayout>
      <form onSubmit={handleSave} className="w-full">
        <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 mx-auto">

          {/* Action Status Toast Notifications */}
          {toast && (
            <div className={`fixed top-6 right-4 md:right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl font-bold text-xs md:text-sm flex items-center gap-3 border border-outline-variant/10 transition-all ${
              toast.type === "success" ? "bg-success text-white" : "bg-error text-white"
            }`}>
              <span className="material-symbols-outlined text-base">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* ── Action Navigation Bar Strip ── */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(fromQuickAdd ? "/school-admin" : "/school-admin/students")}
              className="flex items-center gap-1.5 text-primary text-xs md:text-sm font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate(fromQuickAdd ? "/school-admin" : "/school-admin/students")}
                className="px-4 py-2 text-xs md:text-sm text-on-surface-variant font-bold hover:bg-surface-container-high rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg shadow-sm disabled:opacity-60 transition"
              >
                {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {loading ? "Saving..." : "Register Student"}
              </button>
            </div>
          </div>

          {/* Error Dashboard Banner */}
          {error && (
            <div className="p-3.5 bg-error/10 text-error rounded-xl border border-error/20 text-xs md:text-sm font-medium flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <div className="break-all">{error}</div>
            </div>
          )}

          {/* ── Core Identity Module Card ── */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              
              {/* Dynamic Live Preview Initials Avatar */}
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg md:text-xl border border-primary/20">
                {initials}
              </div>

              {/* Responsive Input Configurations for Identity */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Aryan"
                      className={editFieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className={editFieldClass}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@school.com"
                      className={`${editFieldClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={editFieldClass}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Academic Profile Grid Metrics ── */}
          <SectionCard title="Academic Profile" icon="assignment_ind">
            <div>
              <label className={labelClass}>Enrollment Number</label>
              <input
                required
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                placeholder="e.g. STU-2026-001"
                className={editFieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={editFieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Student phone details"
                className={editFieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className={editFieldClass}
              >
                <option value="">Select Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 w-full min-w-0">
              <label className={labelClass}>Residential Address</label>
              <textarea
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State details"
                className={`${editFieldClass} resize-none`}
              />
            </div>
          </SectionCard>

          {/* ── Allocation Parameters SectionCard ── */}
          <SectionCard title="Class Enrollment Setup" icon="school">
            <div>
              <label className={labelClass}>Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className={editFieldClass}
              >
                <option value="">Select Year</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Class Level</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className={editFieldClass}
              >
                <option value="">Select Class</option>
                {classLevels.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 w-full min-w-0">
              <label className={labelClass}>Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!classLevel}
                className={`${editFieldClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {classLevel
                    ? filteredSections.length ? "Select Section" : "No sections defined"
                    : "Select class parameter first"}
                </option>
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </SectionCard>

        </div>
      </form>
    </SchoolLayout>
  );
}