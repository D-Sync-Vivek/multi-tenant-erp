import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { schoolAdminApi } from "../../services/schoolAdminApi";

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
function AddMappingSkeleton() {
  return (
    <SchoolLayout>
      <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 animate-pulse">
        {/* Top Bar Navigation Strip */}
        <div className="flex justify-between items-center gap-3">
          <Sk w={50} h={30} />
          <div className="flex gap-2">
            <Sk w={60} h={36}/>
            <Sk w={130} h={36}/>
          </div>
        </div>

        {/* Form Components Loading Shimmers */}
        {Array.from({ length: 3 }).map((_, sIdx) => (
          <div key={sIdx} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
              <Sk w={16} h={16} r={999} />
              <Sk w={130} h={16} />
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Sk h={38} className="w-full" />
                <Sk h={38} className="w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SchoolLayout>
  );
}

/* ─────────────────────────────────────────────
   Design System Variables & Tokens
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
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

// ── Toggle row for permissions ──
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-outline-variant/10 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-bold text-on-surface">{label}</p>
        {description && (
          <p className="text-[11px] md:text-xs text-on-surface-variant/70 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full p-0.5 transition-colors shrink-0 outline-none"
        style={{ backgroundColor: checked ? "var(--color-primary)" : "color-mix(in srgb, var(--color-outline-variant) 40%, transparent)" }}
      >
        <div
          className="w-4 h-4 bg-surface-container-lowest rounded-full shadow transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Link Framework Entry Module
───────────────────────────────────────────── */
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
        setError("Failed to load Guardians or Students parameters.");
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
      setError("Please select both a Guardian and a Student parameter.");
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
        setError(Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" | "));
      } else {
        setError("Failed to generate relational link authorization.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (obj) => {
    if (!obj) return "Unknown";
    const f = obj.first_name || obj.user?.first_name || "";
    const l = obj.last_name || obj.user?.last_name || "";
    return (f || l) ? `${f} ${l}`.trim() : obj.email || "No Name Designated";
  };

  if (initialLoading) return <AddMappingSkeleton />;

  // ── Render ──
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

          {/* ── Top Bar Action Navigation Strip ── */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/school-admin/mapping")}
              className="flex items-center gap-1.5 text-primary text-xs md:text-sm font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate("/school-admin/mapping")}
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
                {loading ? "Saving..." : "Establish Link"}
              </button>
            </div>
          </div>

          {/* Managed System Error Dashboard Banner */}
          {error && (
            <div className="p-3.5 bg-error/10 text-error rounded-xl border border-error/20 text-xs md:text-sm font-medium flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <div className="break-all">{error}</div>
            </div>
          )}

          
          <SectionCard title="Entity Selection" icon="link">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className={labelClass}>Select Guardian</label>
                <select
                  required
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className={editFieldClass}
                >
                  <option value="">Select Guardian...</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>{getDisplayName(p)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Select Student</label>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className={editFieldClass}
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getDisplayName(s)}{s.enrollment_number ? ` (${s.enrollment_number})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ── Relationship Designation Segment ── */}
          <SectionCard title="Relationship Designation" icon="diversity_3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["Father", "Mother", "Guardian"].map((rel) => {
                const isSelected = relationship === rel;
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationship(rel)}
                    className="py-2.5 md:py-3 rounded-xl border-2 text-xs md:text-sm font-bold uppercase tracking-wide transition-all outline-none"
                    style={{
                      borderColor: isSelected ? "var(--color-primary)" : "color-mix(in srgb, var(--color-outline-variant) 30%, transparent)",
                      backgroundColor: isSelected ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "var(--color-surface-container-lowest)",
                      color: isSelected ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                    }}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Permissions Control Module ── */}
          <SectionCard title="Access Permissions" icon="shield_person">
            <div className="flex flex-col">
              <ToggleRow
                label="Primary Contact"
                description="This guardian will be configured as the main operational node of contact."
                checked={isPrimaryContact}
                onChange={setIsPrimaryContact}
              />
              <ToggleRow
                label="Academic Visibility"
                description="Guardian token authorized to inspect grading, records, logs, and attendance rosters."
                checked={canViewAcademics}
                onChange={setCanViewAcademics}
              />
              <ToggleRow
                label="Financial Authorization"
                description="Guardian identity clearance granted to execute billing fee items on behalf of student profile."
                checked={canPayFees}
                onChange={setCanPayFees}
              />
            </div>
          </SectionCard>

        </div>
      </form>
    </SchoolLayout>
  );
}