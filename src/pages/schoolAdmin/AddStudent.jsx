import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

// ── Skeleton shimmer (injected once) ──
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
    <SchoolLayout title="Student Registration">
      <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <Sk w={140} h={20} />
          <div className="flex gap-2">
            <Sk w={80} h={36} r={8} />
            <Sk w={120} h={36} r={8} />
          </div>
        </div>

        {/* Identity Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-5">
            <Sk w={64} h={64} r={16} />
            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Profile SectionCard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={100} h={16} />
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={i === 4 ? "md:col-span-2" : ""}>
                <Sk w={80} h={12} />
                <Sk w="100%" h={42} r={6} />
              </div>
            ))}
          </div>
        </div>

        {/* Class Enrollment SectionCard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={100} h={16} />
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={i === 2 ? "md:col-span-2" : ""}>
                <Sk w={80} h={12} />
                <Sk w="100%" h={42} r={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}

// ── Style tokens ──
const labelClass =
  "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";
const editFieldClass =
  "w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md";

// ── SectionCard ──
function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-blue-400 shrink-0" />
        <span className="material-symbols-outlined text-[18px] text-gray-400">
          {icon}
        </span>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

// ── Main Component ──
export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromQuickAdd = location.state?.fromQuickAdd || false;

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

  // Dropdown data
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true); // ← new
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch dropdowns ──
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [clRes, secRes, yearRes] = await Promise.all([
          schoolAdminApi.getClassLevels(),
          schoolAdminApi.getSections(),
          schoolAdminApi.getAcademicYears(),
        ]);
        setClassLevels(Array.isArray(clRes.results ?? clRes) ? (clRes.results ?? clRes) : []);
        setSections(Array.isArray(secRes.results ?? secRes) ? (secRes.results ?? secRes) : []);
        setAcademicYears(Array.isArray(yearRes.results ?? yearRes) ? (yearRes.results ?? yearRes) : []);
      } catch (err) {
        console.error("Failed to fetch options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // ── Filter sections by class ──
  useEffect(() => {
    if (classLevel) {
      setFilteredSections(
        sections.filter(
          (s) =>
            String(s.class_level) === String(classLevel) ||
            String(s.class_level?.id) === String(classLevel)
        )
      );
    } else {
      setFilteredSections(sections);
    }
    setSection("");
  }, [classLevel, sections]);

  // Derived initials for avatar preview
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
        ? firstName.slice(0, 2).toUpperCase()
        : "ST";

  // ── Submit ──
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userPayload = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      };
      const userData = await schoolAdminApi.createUser(userPayload);

      if (userData.id) {
        const profilePayload = {
          user: userData.id,
          enrollment_number: enrollmentNumber,
          is_archived: false,
        };
        if (dateOfBirth) profilePayload.date_of_birth = dateOfBirth;
        if (phoneNumber) profilePayload.phone_number = phoneNumber;
        if (bloodGroup) profilePayload.blood_group = bloodGroup;
        if (address) profilePayload.address = address;

        const studentProfile = await schoolAdminApi.createStudentProfile(profilePayload);

        if (classLevel && academicYear && studentProfile?.id) {
          await api.post(`academics/enrollments/`, {
            student: studentProfile.id,
            academic_year: academicYear,
            class_level: classLevel,
            section: section || null,
          });
        }
      }

      showToast("Student registered successfully!");
      setTimeout(() => navigate("/school-admin/students"), 1000);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string" && data.includes("<!DOCTYPE")) {
          setError("Server Error (500). Please check Django terminal.");
        } else {
          setError(
            Object.entries(data)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" | ")
          );
        }
      } else {
        setError(err.message);
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // ── Render Skeleton if options are loading ──
  if (loadingOptions) {
    return <AddStudentSkeleton />;
  }

  // ── Main render ──
  return (
    <SchoolLayout title="Student Registration">
      <form onSubmit={handleSave}>
        <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-800"
                }`}
            >
              <span className="material-symbols-outlined text-base">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* ── Top Bar ── */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(fromQuickAdd ? "/school-admin" : "/school-admin/students")
              }
              className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {fromQuickAdd ? "Back to Dashboard" : "Back to Directory"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(fromQuickAdd ? "/school-admin" : "/school-admin/students")
                }
                className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70"
              >
                {loading && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">
                    progress_activity
                  </span>
                )}
                {loading ? "Saving..." : "Register Student"}
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm font-medium flex gap-2">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              {error}
            </div>
          )}

          {/* ── Identity Card ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-5">
              {/* Live-preview avatar */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e5eeff] text-[#0058be] flex items-center justify-center font-bold text-xl border border-blue-100">
                {initials}
              </div>

              {/* Name + email + password */}
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className={labelClass}>First Name</p>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Aryan"
                      className={editFieldClass}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={labelClass}>Last Name</p>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className={editFieldClass}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className={labelClass}>Email Address</p>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@school.com"
                      className={`${editFieldClass} font-mono text-xs`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={labelClass}>Temporary Password</p>
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

          {/* ── Academic Profile SectionCard ── */}
          <SectionCard title="Academic Profile" icon="assignment_ind">
            <div>
              <p className={labelClass}>Enrollment Number</p>
              <input
                required
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                placeholder="e.g. STU-2024-001"
                className={editFieldClass}
              />
            </div>

            <div>
              <p className={labelClass}>Date of Birth</p>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={editFieldClass}
              />
            </div>

            <div>
              <p className={labelClass}>Phone Number</p>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className={editFieldClass}
              />
            </div>

            <div>
              <p className={labelClass}>Blood Group</p>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className={editFieldClass}
              >
                <option value="">Select Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <p className={labelClass}>Residential Address</p>
              <textarea
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State"
                className={`${editFieldClass} resize-none`}
              />
            </div>
          </SectionCard>

          {/* ── Class Enrollment SectionCard ── */}
          <SectionCard title="Class Enrollment" icon="school">
            <div>
              <p className={labelClass}>Academic Year</p>
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
              <p className={labelClass}>Class Level</p>
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

            <div>
              <p className={labelClass}>Section</p>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!classLevel}
                className={`${editFieldClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {classLevel
                    ? filteredSections.length
                      ? "Select Section"
                      : "No sections available"
                    : "Pick class first"}
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