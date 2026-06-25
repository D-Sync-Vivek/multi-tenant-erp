import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
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
function ClassLevelsSkeleton() {
  return (
    <SchoolLayout title="Class Framework Directory">
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="w-full sm:w-auto">
            <Sk w={240} h={32} />
            <Sk w="100%" h={16} style={{ marginTop: 6, maxWidth: "420px" }} />
          </div>
          <Sk w={140} h={36} r={8} />
        </div>

        {/* Search Bar */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Sk w="100%" h={40} r={8} />
          </div>
          <Sk w={120} h={16} r={4} />
        </div>

        {/* Responsive Skeleton Content */}
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                {[40, 150, 100, 120, 80, 60].map((w, i) => (
                  <th key={i} className="py-4 px-4"><Sk w={w} h={12} r={4} /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: 4 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="py-4 px-4"><Sk w={20} h={20} r={4} /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Sk w={36} h={36} r={8} />
                      <div><Sk w={120} h={16} /><Sk w={60} h={10} style={{ marginTop: 4 }} /></div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><Sk w={80} h={14} /></td>
                  <td className="py-4 px-4"><Sk w={90} h={20} r={999} /></td>
                  <td className="py-4 px-4"><Sk w={60} h={20} r={999} /></td>
                  <td className="py-4 px-4 text-right"><Sk w={32} h={32} r={999} style={{ marginLeft: "auto" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="block md:hidden space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 space-y-3">
              <div className="flex justify-between items-center"><Sk w={150} h={20} /><Sk w={32} h={32} r={999} /></div>
              <Sk w={100} h={14} />
              <div className="flex gap-2"><Sk w={80} h={20} r={999} /><Sk w={60} h={20} r={999} /></div>
            </div>
          ))}
        </div>
      </div>
    </SchoolLayout>
  );
}

// ── Main Component ──
export default function ClassLevels() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromQuickAdd = location.state?.fromQuickAdd || false;
  const { classLevels: contextClasses, loading, refreshAcademics } = useSchoolAdmin();

  const classes = useMemo(
    () => [...contextClasses].sort((a, b) => (a.numeric_order || 0) - (b.numeric_order || 0)),
    [contextClasses],
  );

  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedClassId, setExpandedClassId] = useState(null);
  const [sectionsCache, setSectionsCache] = useState({});
  const [loadingSections, setLoadingSections] = useState({});

  const fetchLiveClassStructures = useCallback(async () => {
    setError(null);
    try {
      await refreshAcademics();
    } catch (err) {
      console.error("Live configuration sync paused:", err);
      setError("Failed to synchronize active class levels with the data cluster.");
    }
  }, [refreshAcademics]);

  const toggleClassRow = async (classId) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }

    setExpandedClassId(classId);

    if (!sectionsCache[classId]) {
      setLoadingSections((prev) => ({ ...prev, [classId]: true }));
      try {
        const response = await schoolAdminApi.getSectionsByClass(classId);
        let liveSections = response?.results || response || [];

        if (liveSections.length > 0) {
          liveSections = liveSections.filter((sec) => {
            const secClassId = typeof sec.class_level === "object" ? sec.class_level?.id : sec.class_level;
            return !secClassId || secClassId === classId;
          });
        }
        setSectionsCache((prev) => ({ ...prev, [classId]: liveSections }));
      } catch (err) {
        console.error(`Failed to fetch sections for class ${classId}:`, err);
        setSectionsCache((prev) => ({ ...prev, [classId]: [] }));
      } finally {
        setLoadingSections((prev) => ({ ...prev, [classId]: false }));
      }
    }
  };

  const handleDeleteClass = async (classId, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this Class Level and all its Sections?"
    );
    if (!confirmDelete) return;

    try {
      await schoolAdminApi.deleteClassLevelById(classId);
      await refreshAcademics();
      if (expandedClassId === classId) setExpandedClassId(null);
    } catch (err) {
      console.error("Failed to delete class:", err);
      alert("Error: Could not delete class level. Please check server connection.");
    }
  };

  const handleDeleteSection = async (classId, sectionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this specific section?");
    if (!confirmDelete) return;

    try {
      await schoolAdminApi.deleteSectionById(sectionId);
      setSectionsCache((prev) => ({
        ...prev,
        [classId]: prev[classId].filter((sec) => sec.id !== sectionId),
      }));
      await refreshAcademics();
    } catch (err) {
      console.error("Failed to delete section:", err);
      alert("Error: Could not delete section.");
    }
  };

  const filteredClasses = classes.filter((c) => {
    const className = c?.name || "";
    const classCode = c?.code || "";
    return (
      className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return <ClassLevelsSkeleton />;
  }

  return (
    <SchoolLayout title="Class Framework Directory">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        
        {/* Top Banner / Header Container */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-headline font-black text-on-surface tracking-tight">
              Institution Class Levels
            </h2>
            <p className="text-xs sm:text-sm font-body font-medium text-on-surface-variant mt-1 max-w-2xl">
              Manage grade tiers, expand elements to view mapped section groupings, and govern framework structures.
            </p>
          </div>
          {fromQuickAdd && (
            <button
              onClick={() => navigate("/school-admin")}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/20 text-primary font-semibold rounded-md shadow-sm font-body transition-colors  justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
          )}
        </div>

        {/* Filter and Metrics Controls Container */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes by name or code..."
              className="w-full bg-surface-container-low pl-9 pr-4 py-2 rounded-lg text-xs font-semibold border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all font-body text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          <span className="text-xs font-bold text-on-surface-variant text-center sm:text-right font-body">
            {`Showing ${filteredClasses.length} of ${classes.length} database entries`}
          </span>
        </div>

        {/* Error Alert Pane */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold flex items-center justify-between gap-2 font-body">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">cloud_off</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchLiveClassStructures}
              className="underline text-xs font-bold hover:text-error/90 transition shrink-0"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Dynamic Context Block: No Records Found */}
        {filteredClasses.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl py-12 text-center text-on-surface-variant">
            <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-4">
              <span className="material-symbols-outlined text-3xl text-outline">grid_off</span>
              <p className="font-bold text-xs">No matching live class level clusters recorded.</p>
              <p className="text-xs text-on-surface-variant font-medium">
                Seed parameters through your administration interface panel.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── DESIGN VIEW 1: DESKTOP TABLE VIEW (>=768px) ── */}
            <div className="hidden md:block bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/50 border-b border-outline-variant/10 text-xs font-black text-on-surface-variant uppercase tracking-wider font-body">
                      <th className="py-4 px-6 w-10"></th>
                      <th className="py-4 px-4">Class Details</th>
                      <th className="py-4 px-4">Identification Code</th>
                      <th className="py-4 px-4">Allocated Sections</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface text-xs font-semibold font-body">
                    {filteredClasses.map((cls) => {
                      const isExpanded = expandedClassId === cls.id;
                      const sections = sectionsCache[cls.id] || [];
                      const isLoadingSections = loadingSections[cls.id];

                      return (
                        <React.Fragment key={cls.id}>
                          <tr
                            onClick={() => toggleClassRow(cls.id)}
                            className={`transition-colors cursor-pointer group ${isExpanded ? "bg-primary/5" : "hover:bg-surface-container-high/30"}`}
                          >
                            <td className="py-4 px-4 text-center">
                              <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                expand_more
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isExpanded ? "bg-primary text-white" : "bg-primary/10 text-primary border border-primary/20"}`}>
                                  <span className="material-symbols-outlined text-base">meeting_room</span>
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors font-headline">
                                    {cls.name || "Unnamed Class Level"}
                                  </p>
                                  <p className="text-2xs text-on-surface-variant mt-0.5 font-mono">
                                    ID: {String(cls.id).substring(0, 8).toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-on-surface-variant font-bold">
                              {cls.code || "UNASSIGNED"}
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-2xs font-bold">
                                {(cls.sectionCount || cls.sections?.length || sections.length || 0)} Active Sections
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-2xs font-black uppercase ${cls.status === "Active" || cls.is_active === true ? "bg-success/10 text-success border border-success/20" : "bg-surface-container-high text-on-surface-variant border border-outline-variant/20"}`}>
                                {cls.status || (cls.is_active ? "Active" : "Archived")}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={(e) => handleDeleteClass(cls.id, e)}
                                className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant/10 text-on-surface-variant hover:text-error hover:bg-error/10 hover:border-error/20 flex items-center justify-center ml-auto transition-all shadow-sm outline-none"
                                title="Delete Class Level"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </td>
                          </tr>

                          {/* Desktop Expandable Section */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="bg-surface-container-high/30 p-0 border-b border-outline-variant/10">
                                <div className="px-16 py-6 animate-fadeIn">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-wider font-headline">
                                      Sections under {cls.name}
                                    </h4>
                                  </div>
                                  <InnerSectionsList 
                                    isLoading={isLoadingSections} 
                                    sections={sections} 
                                    cls={cls} 
                                    onDelete={handleDeleteSection} 
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── DESIGN VIEW 2: MOBILE/TABLET CARD VIEW (<768px) ── */}
            <div className="block md:hidden space-y-4">
              {filteredClasses.map((cls) => {
                const isExpanded = expandedClassId === cls.id;
                const sections = sectionsCache[cls.id] || [];
                const isLoadingSections = loadingSections[cls.id];

                return (
                  <div 
                    key={cls.id} 
                    className={`bg-surface-container-lowest rounded-xl border transition-all ${isExpanded ? "border-primary/40 ring-1 ring-primary/25" : "border-outline-variant/10"}`}
                  >
                    {/* Card Header Content Area */}
                    <div 
                      onClick={() => toggleClassRow(cls.id)}
                      className="p-4 flex items-start gap-3 cursor-pointer justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isExpanded ? "bg-primary text-white" : "bg-primary/10 text-primary border border-primary/20"}`}>
                          <span className="material-symbols-outlined text-base">meeting_room</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-on-surface font-headline">{cls.name || "Unnamed Class Level"}</h3>
                          <p className="text-2xs font-mono text-on-surface-variant">Code: {cls.code || "UNASSIGNED"}</p>
                          <p className="text-2xs font-mono text-on-surface-variant opacity-70">ID: {String(cls.id).substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      
                      {/* Interactive Control Blocks */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDeleteClass(cls.id, e)}
                          className="w-8 h-8 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-error flex items-center justify-center"
                          title="Delete Class"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                        <button 
                          onClick={() => toggleClassRow(cls.id)}
                          className="w-8 h-8 flex items-center justify-center text-outline"
                        >
                          <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges Summary Bar */}
                    <div className="px-4 pb-4 flex flex-wrap gap-2 items-center border-b border-outline-variant/5">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-2xs font-bold">
                        {(cls.sectionCount || cls.sections?.length || sections.length || 0)} Sections
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-black uppercase ${cls.status === "Active" || cls.is_active === true ? "bg-success/10 text-success border border-success/20" : "bg-surface-container-high text-on-surface-variant border border-outline-variant/20"}`}>
                        {cls.status || (cls.is_active ? "Active" : "Archived")}
                      </span>
                    </div>

                    {/* Mobile Expandable Container Blocks */}
                    {isExpanded && (
                      <div className="bg-surface-container-high/20 p-4 rounded-b-xl animate-fadeIn">
                        <h4 className="text-2xs font-black text-on-surface-variant uppercase tracking-wider mb-3 font-headline">
                          Sections Matrix
                        </h4>
                        <InnerSectionsList 
                          isLoading={isLoadingSections} 
                          sections={sections} 
                          cls={cls} 
                          onDelete={handleDeleteSection} 
                          isMobile={true}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </SchoolLayout>
  );
}

// ── Reusable Component Extracted to clean standard rendering layout boundaries ──
function InnerSectionsList({ isLoading, sections, cls, onDelete, isMobile = false }) {
  if (isLoading) {
    return (
      <div className="text-center py-6 text-on-surface-variant text-xs font-bold flex justify-center items-center gap-2 font-body">
        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
        Validating structural layout data...
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-6 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-on-surface-variant text-xs font-bold shadow-2xs font-body">
        No sections currently deployed here.
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        {sections.map((sec) => (
          <div key={sec.id} className="bg-surface-container-lowest border border-outline-variant/10 p-3 rounded-lg flex items-center justify-between text-xs font-bold text-on-surface font-body">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
              <span>{cls.name} - {sec.name.replace("Section ", "Sec ")}</span>
            </div>
            <button
              onClick={() => onDelete(cls.id, sec.id)}
              className="text-outline hover:text-error p-1 transition-colors outline-none"
              title="Delete Section"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden shadow-2xs">
      <table className="w-full text-left">
        <thead className="bg-surface-container-high/50 border-b border-outline-variant/10 text-2xs text-on-surface-variant uppercase tracking-wider font-black font-body">
          <tr>
            <th className="py-2.5 px-4">Section Name</th>
            <th className="py-2.5 px-4">Section Level</th>
            <th className="py-2.5 px-4 text-right">Remove</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 text-xs font-bold text-on-surface font-body">
          {sections.map((sec) => (
            <tr key={sec.id} className="hover:bg-surface-container-high/30 transition-colors">
              <td className="py-3 px-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {cls.name} - {sec.name.replace("Section ", "Sec ")}
              </td>
              <td className="py-3 px-4 text-primary font-bold">{cls.name}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onDelete(cls.id, sec.id)}
                  className="text-outline hover:text-error transition-colors outline-none"
                  title="Delete Section"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}