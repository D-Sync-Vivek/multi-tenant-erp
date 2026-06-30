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

// ── Full‑page Responsive Skeleton ──
function CreateSectionSkeleton() {
  return (
    <SchoolLayout>
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 w-full">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/10 p-4 sm:p-6 md:p-8">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Sk w={28} h={28} r={8} />
                <div className="w-full">
                  <Sk w={160} h={24} />
                  <Sk w="85%" h={16} style={{ marginTop: 4, maxWidth: "220px" }} />
                </div>
              </div>
              <Sk w={80} h={32} r={6} className="w-full sm:w-auto" />
            </div>

            {/* Form fields Skeleton */}
            <div className="space-y-5">
              <div>
                <Sk w={140} h={12} r={4} style={{ marginBottom: 6 }} />
                <Sk w="100%" h={44} r={8} />
              </div>
              <div>
                <Sk w={140} h={12} r={4} style={{ marginBottom: 6 }} />
                <Sk w="100%" h={44} r={8} />
                <Sk w="90%" h={12} r={4} style={{ marginTop: 8, maxWidth: "300px" }} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Sk w="100%" h={40} r={8} className="sm:w-20" />
                <Sk w="100%" h={40} r={8} className="sm:w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}

// ── Main Component ──
export default function CreateSection() {
  const navigate = useNavigate();
  const { classLevels, loading: loadingLevels, refreshAcademics } = useSchoolAdmin();

  const [classLevelId, setClassLevelId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedLevel = classLevels.find(
    (cl) => String(cl.id) === String(classLevelId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classLevelId) {
      setError("Please select a parent class level.");
      return;
    }
    if (!sectionName.trim()) {
      setError("Section identifier is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("academics/sections/", {
        class_level: classLevelId,
        name: sectionName.trim(),
      });
      await refreshAcademics();
      navigate(-1);
    } catch (err) {
      console.error("Error creating section:", err);
      setError(
        err?.response?.data?.detail ||
        "Failed to create section. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLevels) {
    return <CreateSectionSkeleton />;
  }

  return (
    <SchoolLayout>
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 w-full">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/10 p-4 sm:p-6 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">groups</span>
                <div>
                  <h2 className="text-xl font-headline font-bold text-on-surface">
                    Define New Section
                  </h2>
                  <p className="text-sm text-on-surface-variant font-body mt-0.5">
                    Establish a specific classroom division linked to a primary Class Level.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-body border border-outline-variant/30 rounded px-3 py-1.5 shrink-0 ml-[35px]"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Go Back
              </button>
            </div>

            {/* Error Pane */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-body flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Parent Class Level Selection */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-body">
                  Parent Class Level <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base pointer-events-none">
                    meeting_room
                  </span>
                  <select
                    value={classLevelId}
                    onChange={(e) => setClassLevelId(e.target.value)}
                    disabled={loadingLevels}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition appearance-none disabled:opacity-60"
                  >
                    <option value="">
                      {loadingLevels ? "Loading..." : "Select Base Class Level..."}
                    </option>
                    {classLevels.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Section Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-body">
                  Section Identifier <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g., Section A, Batch Alpha, Honors"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container text-on-surface placeholder:text-outline text-sm font-body focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition"
                />
                <p className="text-xs text-on-surface-variant mt-1.5 font-body break-words">
                  Combined together, this will read as "
                  <span className="font-semibold text-on-surface">
                    {selectedLevel?.name || "[Class Level]"}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-on-surface">
                    {sectionName.trim() || "[Section]"}
                  </span>
                  " in the frontend.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition font-body text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || loadingLevels}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-success text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition font-body disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  {submitting ? "Creating..." : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}