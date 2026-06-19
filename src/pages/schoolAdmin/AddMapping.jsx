import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { schoolAdminApi } from "../../services/schoolAdminApi";

// ── Skeleton shimmer ──
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
function AddMappingSkeleton() {
  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <Sk w={140} h={20} />
          <div className="flex gap-2">
            <Sk w={80} h={36} r={8} />
            <Sk w={120} h={36} r={8} />
          </div>
        </div>

        {/* Entity Selection SectionCard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={120} h={16} />
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relationship Designation SectionCard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={140} h={16} />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Sk key={i} w="100%" h={44} r={8} />
              ))}
            </div>
          </div>
        </div>

        {/* Access Permissions SectionCard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={140} h={16} />
          </div>
          <div className="p-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <Sk w={120} h={16} />
                  <Sk w={180} h={12} r={4} style={{ marginTop: 4 }} />
                </div>
                <Sk w={40} h={20} r={999} />
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
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Toggle row for permissions ──
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full p-0.5 transition-colors shrink-0 ${checked ? "bg-[#0058be]" : "bg-gray-300"
          }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
}

// ── Main Component ──
export default function AddMapping() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedParent, setSelectedParent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [relationship, setRelationship] = useState("Guardian");

  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [canViewAcademics, setCanViewAcademics] = useState(true);
  const [canPayFees, setCanPayFees] = useState(true);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch dropdowns ──
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [parentsData, studentsData] = await Promise.all([
          schoolAdminApi.getParents(1, ""),
          schoolAdminApi.getStudents(1, ""),
        ]);
        setParents(parentsData.results || parentsData || []);
        setStudents(studentsData.results || studentsData || []);
      } catch (err) {
        setError("Failed to load Guardians or Students.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  // ── Submit ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedParent || !selectedStudent) {
      setError("Please select both a Guardian and a Student.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post(`profiles/parent-student-mappings/`, {
        parent: selectedParent,
        student: selectedStudent,
        relationship,
        is_primary_contact: isPrimaryContact,
        can_view_academics: canViewAcademics,
        can_pay_fees: canPayFees,
      });
      showToast("Relationship mapping created successfully!");
      setTimeout(() => navigate("/school-admin/mapping"), 1000);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        setError(
          Object.entries(data)
            .map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`)
            .join(" | ")
        );
      } else {
        setError("Failed to create mapping.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (obj) => {
    if (!obj) return "Unknown";
    const f = obj.first_name || obj.user?.first_name || "";
    const l = obj.last_name || obj.user?.last_name || "";
    return (f || l) ? `${f} ${l}`.trim() : obj.email || "No Name";
  };

  // ── Skeleton ──
  if (initialLoading) {
    return <AddMappingSkeleton />;
  }

  // ── Render ──
  return (
    <SchoolLayout title="Parent-Student Mapping">
      <form onSubmit={handleSave}>
        <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
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
              onClick={() => navigate("/school-admin/mapping")}
              className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Directory
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/school-admin/mapping")}
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
                {loading ? "Saving..." : "Establish Link"}
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

          {/* ── Entity Selection SectionCard ── */}
          <SectionCard title="Entity Selection" icon="link">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className={labelClass}>Select Guardian</p>
                <select
                  required
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className={editFieldClass}
                >
                  <option value="">
                    {initialLoading ? "Loading..." : "Select Guardian..."}
                  </option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getDisplayName(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className={labelClass}>Select Student</p>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className={editFieldClass}
                >
                  <option value="">
                    {initialLoading ? "Loading..." : "Select Student..."}
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getDisplayName(s)}{s.enrollment_number ? ` (${s.enrollment_number})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ── Relationship Designation SectionCard ── */}
          <SectionCard title="Relationship Designation" icon="diversity_3">
            <div className="grid grid-cols-3 gap-4">
              {["Father", "Mother", "Guardian"].map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setRelationship(rel)}
                  className={`py-3 rounded-lg border-2 text-sm font-bold uppercase tracking-wide transition-all ${relationship === rel
                    ? "border-[#0058be] bg-[#eff4ff] text-[#0058be]"
                    : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* ── Permissions SectionCard ── */}
          <SectionCard title="Access Permissions" icon="shield_person">
            <ToggleRow
              label="Primary Contact"
              description="This guardian will be the main point of contact."
              checked={isPrimaryContact}
              onChange={setIsPrimaryContact}
            />
            <ToggleRow
              label="Academic Visibility"
              description="Guardian can view grades, attendance, and reports."
              checked={canViewAcademics}
              onChange={setCanViewAcademics}
            />
            <ToggleRow
              label="Financial Authorization"
              description="Guardian is authorized to pay fees on behalf of the student."
              checked={canPayFees}
              onChange={setCanPayFees}
            />
          </SectionCard>

        </div>
      </form>
    </SchoolLayout>
  );
}