import React, { useState, useEffect, useMemo } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";
import { schoolAdminApi } from "../../services/schoolAdminApi";

/* ─────────────────────────────────────────────
   Skeleton shimmer (injected once)
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

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 3rem - 2.5rem)" }}>
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1.5"><Sk w={160} h={14} /><Sk w={230} h={10} /></div>
        <Sk w={90} h={30} r={8} />
      </div>
      <div className="grid grid-cols-4 gap-2.5 shrink-0">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-xl p-3 flex flex-col justify-between"
            style={{ background: "var(--color-surface-container-lowest)", border: "1px solid color-mix(in srgb,var(--color-outline-variant) 12%,transparent)", borderLeft: "3px solid color-mix(in srgb,var(--color-outline-variant) 30%,transparent)", minHeight: 84 }}>
            <div className="flex items-start justify-between"><Sk w={24} h={24} r={6} /><Sk w={36} h={14} r={999} /></div>
            <div className="flex flex-col gap-1"><Sk w={60} h={8} /><Sk w={44} h={18} /></div>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-xl overflow-hidden flex min-h-0"
        style={{ background: "var(--color-surface-container-lowest)", border: "1px solid color-mix(in srgb,var(--color-outline-variant) 12%,transparent)" }}>
        <div className="flex flex-col flex-1 p-4 gap-3 min-w-0">
          <div className="flex items-start justify-between shrink-0">
            <div className="flex flex-col gap-1.5"><Sk w={130} h={13} /><Sk w={90} h={9} /></div>
          </div>
          <Sk w={180} h={10} />
          <div className="flex flex-1 min-h-0 gap-2">
            <div className="flex flex-col justify-between pb-5" style={{ width: 28 }}>
              {[0, 1, 2, 3, 4].map(i => <Sk key={i} w={26} h={8} />)}
            </div>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex-1 flex items-end gap-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <Sk key={i} style={{ flex: 1, height: `${20 + Math.abs(Math.sin(i * 0.9)) * 15 + (i / 12) * 55}%`, borderRadius: "4px 4px 0 0", alignSelf: "flex-end" }} />
                ))}
              </div>
              <div className="flex gap-1 shrink-0" style={{ height: 16 }}>
                {Array.from({ length: 12 }, (_, i) => <Sk key={i} style={{ flex: 1 }} h={8} r={4} />)}
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 my-3 w-px" style={{ background: "color-mix(in srgb,var(--color-outline-variant) 18%,transparent)" }} />
        <div className="flex flex-col shrink-0 p-3 gap-2" style={{ width: 186 }}>
          <div className="flex items-start justify-between"><div className="flex flex-col gap-1.5"><Sk w={70} h={12} /><Sk w={90} h={9} /></div><Sk w={28} h={16} r={999} /></div>
          <Sk h={44} r={8} />
          <div className="shrink-0 h-px" style={{ background: "color-mix(in srgb,var(--color-outline-variant) 18%,transparent)" }} />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-1 p-1">
              <div className="flex justify-between"><Sk w={60} h={9} /><Sk w={24} h={9} /></div>
              <Sk h={3} r={999} />
            </div>
          ))}
          <div className="shrink-0 flex items-center justify-between pt-1" style={{ borderTop: "1px solid color-mix(in srgb,var(--color-outline-variant) 18%,transparent)" }}>
            <Sk w={50} h={8} /><Sk w={50} h={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
function StatCard({ icon, label, value, badge, badgeColor, accentColor }) {
  return (
    <div className="relative overflow-hidden rounded-xl p-3 flex flex-col justify-between transition-all duration-200"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid color-mix(in srgb,var(--color-outline-variant) 12%,transparent)", borderLeft: `3px solid ${accentColor}`, minHeight: 84 }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px color-mix(in srgb,${accentColor} 12%,transparent)`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-[0.04] pointer-events-none" style={{ background: accentColor }} />
      <div className="flex items-start justify-between">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb,${accentColor} 12%,transparent)` }}>
          <span className="material-symbols-outlined" style={{ color: accentColor, fontSize: "14px" }}>{icon}</span>
        </div>
        {badge && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
            style={{ background: `color-mix(in srgb,${badgeColor || accentColor} 12%,transparent)`, color: badgeColor || accentColor }}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
        <p className="text-lg font-headline font-black leading-none" style={{ color: "var(--color-on-surface)" }}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helpers — scale-safe
───────────────────────────────────────────── */
const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function safeMax(arr, fn = x => x) {
  return arr.reduce((m, x) => { const v = fn(x); return v > m ? v : m; }, 0);
}

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function toMonthAbbr(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (/^\d{4}-\d{2}/.test(s)) return MONTH_ORDER[parseInt(s.split("-")[1], 10) - 1] ?? null;
  const parsed = new Date(`${s} 1, 2000`);
  if (!isNaN(parsed)) return MONTH_ORDER[parsed.getMonth()];
  return s.slice(0, 3).toUpperCase();
}

function buildBarsFromTrends(trendsData) {
  const arr = Array.isArray(trendsData) ? trendsData
    : trendsData?.results ?? trendsData?.data ?? [];

  const countMap = {};
  for (const item of arr) {
    const raw = item.month ?? item.month_year ?? item.date ?? item.period ?? item.label;
    const cnt = Number(item.count ?? item.student_count ?? item.students ?? item.total ?? item.value ?? 0);
    const abbr = toMonthAbbr(raw);
    if (abbr) countMap[abbr] = (countMap[abbr] || 0) + cnt;
  }

  const counts = Object.values(countMap);
  const maxCount = counts.reduce((m, v) => v > m ? v : m, 1);

  return MONTH_ORDER.map(m => {
    const count = countMap[m];
    const hasData = count !== undefined && count > 0;
    return {
      m,
      count: hasData ? count : 0,
      v: hasData ? Math.round((count / maxCount) * 100) : 0,
      hasData,
    };
  });
}

/* ─────────────────────────────────────────────
   Class Breakdown Panel
───────────────────────────────────────────── */
const CLASS_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-tertiary)",
  "#16a34a",   // green
  "#d97706",   // amber
  "#7c3aed",   // violet
  "#0891b2",   // cyan
  "#be185d",   // pink
  "#047857",   // emerald
  "#b45309",   // yellow-brown
];

function ClassBreakdownPanel({ classLevels, sections, totalStudents, selectedMonth, enrollmentBars }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const enriched = useMemo(() => {
    const totalSections = sections.length || 1;
    return classLevels.map(cl => {
      const clSections = sections.filter(s =>
        s.class_level === cl.id ||
        s.class_level?.id === cl.id ||
        s.class_level_name === (cl.name || cl.level_name)
      );
      const sectionCount = clSections.length;
      const studentEst = sectionCount > 0
        ? Math.round((sectionCount / totalSections) * totalStudents)
        : 0;
      return {
        id: cl.id,
        name: cl.name || cl.level_name || `Class ${cl.id}`,
        sectionCount,
        studentEst,
        isEstimated: !cl.student_count,
        realCount: cl.student_count ?? null,
      };
    });
  }, [classLevels, sections, totalStudents]);

  const maxStudents = useMemo(
    () => enriched.reduce((m, c) => { const v = c.realCount ?? c.studentEst; return v > m ? v : m; }, 1),
    [enriched]
  );

  const monthBar = enrollmentBars.find(b => b.m === selectedMonth);
  const isEstimated = enriched.some(c => c.isEstimated && c.sectionCount > 0);

  return (
    <div className="flex flex-col shrink-0 p-3 gap-2" style={{ width: "186px" }}>

      {/* Header */}
      <div className="shrink-0">
        <h3 className="text-xs font-headline font-bold leading-none" style={{ color: "var(--color-on-surface)" }}>
          Class Breakdown
        </h3>
        <p className="text-[9px] mt-0.5 font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
          {selectedMonth
            ? `${selectedMonth} · ${totalStudents.toLocaleString()} students`
            : `${totalStudents.toLocaleString()} students total`}
          {isEstimated && <span style={{ color: "color-mix(in srgb,var(--color-outline) 70%,transparent)" }}> (est.)</span>}
        </p>
      </div>

      {/* Selected month highlight */}
      {monthBar?.hasData && (
        <div className="rounded-lg p-2 shrink-0"
          style={{ background: "color-mix(in srgb,var(--color-primary) 7%,transparent)", border: "1px solid color-mix(in srgb,var(--color-primary) 15%,transparent)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
              {selectedMonth} Enrollment
            </span>
            <span className="text-[10px] font-black" style={{ color: "var(--color-primary)" }}>
              {monthBar.count.toLocaleString()}
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "color-mix(in srgb,var(--color-primary) 15%,transparent)" }}>
            <div style={{ width: `${monthBar.v}%`, height: "100%", background: "var(--color-primary)", transition: "width 0.4s ease", borderRadius: 999 }} />
          </div>
          <p className="text-[7px] mt-0.5 font-semibold" style={{ color: "color-mix(in srgb,var(--color-primary) 65%,transparent)" }}>
            {monthBar.v}% of peak · {fmtCount(monthBar.count)} registered
          </p>
        </div>
      )}

      <div className="shrink-0 h-px" style={{ background: "color-mix(in srgb,var(--color-outline-variant) 18%,transparent)" }} />

      {/* Class list */}
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {enriched.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="text-center">
              <span className="material-symbols-outlined block mb-1"
                style={{ color: "color-mix(in srgb,var(--color-outline) 35%,transparent)", fontSize: "20px" }}>
                class
              </span>
              <p className="text-[9px] font-semibold" style={{ color: "color-mix(in srgb,var(--color-outline) 55%,transparent)" }}>
                No class data
              </p>
            </div>
          </div>
        ) : enriched.map((cl, i) => {
          const isHov = hoveredIdx === i;
          const color = CLASS_COLORS[i % CLASS_COLORS.length];
          const displayVal = cl.realCount ?? cl.studentEst;
          const fillPct = maxStudents > 0 ? Math.round((displayVal / maxStudents) * 100) : 0;

          return (
            <div key={cl.id || i}
              className="rounded-lg px-1.5 py-1 transition-all duration-150 cursor-default"
              style={{
                background: isHov ? `color-mix(in srgb,${color} 8%,transparent)` : "transparent",
                border: `1px solid ${isHov ? `color-mix(in srgb,${color} 20%,transparent)` : "transparent"}`,
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold truncate flex-1 mr-1" style={{ color: "var(--color-on-surface)" }}
                  title={cl.name}>
                  {cl.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {cl.sectionCount > 0 && (
                    <span className="text-[7px] font-semibold px-1 py-0.5 rounded leading-none"
                      style={{ background: `color-mix(in srgb,${color} 10%,transparent)`, color }}>
                      {cl.sectionCount}s
                    </span>
                  )}
                  <span className="text-[8px] font-black leading-none" style={{ color: "var(--color-on-surface)" }}>
                    {displayVal > 0 ? fmtCount(displayVal) : "–"}
                    {cl.isEstimated && displayVal > 0 && (
                      <span className="text-[6px] font-semibold ml-0.5"
                        style={{ color: "color-mix(in srgb,var(--color-outline) 70%,transparent)" }}>
                        est
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "color-mix(in srgb,var(--color-outline-variant) 22%,transparent)" }}>
                <div style={{
                  width: `${fillPct}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 999,
                  transition: "width 0.4s ease",
                  boxShadow: isHov ? `0 0 4px color-mix(in srgb,${color} 40%,transparent)` : "none",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-between pt-1"
        style={{ borderTop: "1px solid color-mix(in srgb,var(--color-outline-variant) 18%,transparent)" }}>
        <span className="text-[8px] font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
          {sections.length} sections
        </span>
        <span className="text-[8px] font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
          {classLevels.length} classes
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AnalyticsCard – with Class Breakdown panel (kept)
───────────────────────────────────────────── */
function AnalyticsCard({ allBars, classLevels, sections, totalStudents }) {
  const [hovered, setHovered] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Always show all 12 months – no toggle
  const bars = allBars;

  // Auto-select last data month
  useEffect(() => {
    const visible = bars.filter(b => b.hasData);
    if (!selectedMonth || !visible.find(b => b.m === selectedMonth)) {
      setSelectedMonth(visible[visible.length - 1]?.m ?? null);
    }
  }, [bars]);

  const yLabels = useMemo(() => {
    const maxCount = safeMax(allBars, b => b.count) || 1;
    return [maxCount, Math.round(maxCount * 0.75), Math.round(maxCount * 0.5), Math.round(maxCount * 0.25), 0]
      .map(v => fmtCount(v));
  }, [allBars]);

  const tooltipBar = hovered !== null ? bars[hovered] : null;
  const noTrendsData = allBars.every(b => !b.hasData);

  return (
    <div className="flex-1 min-h-0 rounded-xl overflow-hidden flex"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid color-mix(in srgb,var(--color-outline-variant) 12%,transparent)",
      }}>

      {/* ── LEFT: Enrollment chart ── */}
      <div className="flex flex-col flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between mb-1.5 shrink-0">
          <div>
            <h3 className="text-sm font-headline font-bold leading-none" style={{ color: "var(--color-on-surface)" }}>
              Enrollment Growth
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
              {noTrendsData
                ? `${totalStudents.toLocaleString()} students · current snapshot`
                : "Live registrations from trends API"}
            </p>
          </div>
        </div>

        {/* Tooltip row */}
        <div className="shrink-0 mb-1" style={{ height: "16px" }}>
          {tooltipBar ? (
            tooltipBar.hasData ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-primary)" }} />
                <span className="text-[10px] font-bold" style={{ color: "var(--color-on-surface)" }}>{tooltipBar.m}:</span>
                <span className="text-[10px] font-semibold" style={{ color: "var(--color-primary)" }}>
                  {tooltipBar.count.toLocaleString()} students
                </span>
                <span className="text-[9px]" style={{ color: "var(--color-on-surface-variant)" }}>— click to inspect</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-outline)" }} />
                <span className="text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
                  {tooltipBar.m}: Upcoming — no data yet
                </span>
              </div>
            )
          ) : selectedMonth ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-secondary)" }} />
              <span className="text-[10px] font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
                Viewing: <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>{selectedMonth}</span>
                {" "}— click any bar to inspect
              </span>
            </div>
          ) : null}
        </div>

        {/* Y‑axis + bars */}
        <div className="flex gap-2 flex-1 min-h-0">
          <div className="flex flex-col justify-between pb-5 shrink-0" style={{ width: "30px" }}>
            {yLabels.map((lbl, i) => (
              <span key={i} className="text-[8px] font-semibold text-right"
                style={{ color: "var(--color-outline)" }}>{lbl}</span>
            ))}
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative min-h-0">
              {[0, 25, 50, 75, 100].map(p => (
                <div key={p} className="absolute w-full" style={{
                  bottom: `${p}%`, height: "1px",
                  background: "color-mix(in srgb,var(--color-outline-variant) 18%,transparent)",
                }} />
              ))}

              <div className="absolute inset-0 flex items-end" style={{ gap: "3px" }}>
                {bars.map((b, i) => {
                  const isSel = b.m === selectedMonth;
                  const isHov = hovered === i;
                  return (
                    <div key={i} className="flex-1 h-full flex flex-col items-center justify-end"
                      style={{ cursor: b.hasData ? "pointer" : "default" }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => b.hasData && setSelectedMonth(b.m)}>
                      {b.hasData ? (
                        <div className="w-full rounded-t-md transition-all duration-300"
                          style={{
                            height: `${Math.max(b.v, 2)}%`,
                            background: isSel ? "var(--color-secondary)"
                              : isHov ? "var(--color-primary)"
                                : "color-mix(in srgb,var(--color-primary) 22%,var(--color-surface-container-high))",
                            boxShadow: (isSel || isHov)
                              ? `0 -2px 8px color-mix(in srgb,${isSel ? "var(--color-secondary)" : "var(--color-primary)"} 28%,transparent)`
                              : "none",
                            transform: isHov ? "scaleY(1.02)" : "scaleY(1)",
                            transformOrigin: "bottom",
                            outline: isSel ? "2px solid var(--color-secondary)" : "none",
                            outlineOffset: "1px",
                          }} />
                      ) : (
                        <div className="w-full rounded-t-md"
                          style={{
                            height: "18%",
                            border: "1.5px dashed color-mix(in srgb,var(--color-outline-variant) 35%,transparent)",
                            borderBottom: "none",
                            background: isHov ? "color-mix(in srgb,var(--color-outline-variant) 5%,transparent)" : "transparent",
                          }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex mt-1 shrink-0" style={{ height: "16px", gap: "3px" }}>
              {bars.map((b, i) => (
                <div key={i} style={{ flex: 1 }} className="flex items-center justify-center">
                  <span className="text-[8px] font-bold"
                    style={{
                      color: b.m === selectedMonth ? "var(--color-secondary)"
                        : !b.hasData ? "color-mix(in srgb,var(--color-outline) 38%,transparent)"
                          : hovered === i ? "var(--color-primary)"
                            : "var(--color-outline)",
                      fontStyle: !b.hasData ? "italic" : "normal",
                      fontWeight: b.m === selectedMonth ? 900 : 700,
                    }}>
                    {b.m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Class Breakdown Panel (KEPT) ── */}
      <div className="shrink-0 my-3 w-px"
        style={{ background: "color-mix(in srgb,var(--color-outline-variant) 18%,transparent)" }} />

      <ClassBreakdownPanel
        classLevels={classLevels}
        sections={sections}
        totalStudents={totalStudents}
        selectedMonth={selectedMonth || ""}
        enrollmentBars={allBars}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Dashboard – data fetching
───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [studentsCount, setStudentsCount] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [classRes, sectionRes, studentsRes, teachersRes] = await Promise.all([
          api.get("academics/class-levels/"),
          api.get("academics/sections/"),
          api.get("profiles/students/"),
          api.get("profiles/teachers/"),
        ]);

        setClassLevels(classRes.data?.results ?? (Array.isArray(classRes.data) ? classRes.data : []));
        setSections(sectionRes.data?.results ?? (Array.isArray(sectionRes.data) ? sectionRes.data : []));

        const totalStu = studentsRes.data?.count
          ?? studentsRes.data?.results?.length
          ?? (Array.isArray(studentsRes.data) ? studentsRes.data.length : 0);
        setStudentsCount(totalStu);

        try {
          const activeRes = await api.get("profiles/students/?is_archived=false&page_size=1");
          const activeCnt = activeRes.data?.count ?? activeRes.data?.results?.length ?? totalStu;
          setActiveStudents(activeCnt);
        } catch {
          const stuArr = studentsRes.data?.results ?? (Array.isArray(studentsRes.data) ? studentsRes.data : []);
          const activeFallback = stuArr.filter(s =>
            s.is_archived === false || s.status === "ACTIVE" || s.is_active === true
          ).length;
          setActiveStudents(activeFallback || totalStu);
        }

        const totalTch = teachersRes.data?.count
          ?? teachersRes.data?.results?.length
          ?? (Array.isArray(teachersRes.data) ? teachersRes.data.length : 0);
        setTeachersCount(totalTch);

        try {
          const statsRes = await schoolAdminApi.getDashboardStats();
          setStatsData(statsRes);
          if (statsRes?.total_students) setStudentsCount(statsRes.total_students);
          if (statsRes?.active_students) setActiveStudents(statsRes.active_students);
          if (statsRes?.total_teachers) setTeachersCount(statsRes.total_teachers);
        } catch { /* endpoint may not exist */ }

        try {
          const trendsRes = await schoolAdminApi.getEnrollmentTrends();
          const arr = trendsRes?.results ?? trendsRes?.data ?? trendsRes;
          setTrendsData(Array.isArray(arr) ? arr : []);
        } catch { /* endpoint may not exist */ }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SchoolLayout><DashboardSkeleton /></SchoolLayout>;

  const allBars = buildBarsFromTrends(trendsData);
  if (!allBars.some(b => b.hasData) && studentsCount > 0) {
    const nowMonth = MONTH_ORDER[new Date().getMonth()];
    const idx = allBars.findIndex(b => b.m === nowMonth);
    if (idx !== -1) allBars[idx] = { m: nowMonth, count: studentsCount, v: 100, hasData: true };
  }

  const classLevelsCount = classLevels.length;
  const sectionsCount = sections.length;

  // ── Only 4 stat cards – Engagement removed ──
  const stats = [
    {
      icon: "school",
      label: "Total Enrolled",
      value: studentsCount.toLocaleString(),
      badge: activeStudents > 0 && activeStudents < studentsCount
        ? `${activeStudents.toLocaleString()} active`
        : activeStudents === studentsCount && studentsCount > 0 ? "all active" : "+live",
      badgeColor: "var(--color-primary)",
      accentColor: "var(--color-primary)",
    },
    {
      icon: "supervisor_account",
      label: "Total Teachers",
      value: teachersCount.toLocaleString(),
      badge: "Staff",
      badgeColor: "var(--color-secondary)",
      accentColor: "var(--color-secondary)",
    },
    {
      icon: "meeting_room",
      label: "Class Levels",
      value: classLevelsCount,
      accentColor: "var(--color-tertiary)",
    },
    {
      icon: "groups",
      label: "Active Sections",
      value: sectionsCount,
      accentColor: "#16a34a",
    },
  ];

  const quickActions = [
    { label: "Add Student", path: "/school-admin/students/add", icon: "person_add" },
    { label: "Add Teacher", path: "/school-admin/teachers/create", icon: "group_add" },
    { label: "Subject", path: "/school-admin/create-subject", icon: "menu_book" },
    { label: "Section", path: "/school-admin/create-section", icon: "groups" },
    { label: "Class Level", path: "/school-admin/class-levels", icon: "meeting_room" },
  ];

  return (
    <SchoolLayout>
      <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 3rem - 2.5rem)" }}>

        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-headline font-extrabold tracking-tight"
              style={{ color: "var(--color-on-surface)" }}>Academic Overview</h2>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Welcome back, Administrator. Here's what's happening today.
            </p>
          </div>
          <div className="relative">
            <button onClick={() => setShowQuickActions(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
              style={{ background: "color-mix(in srgb,var(--color-primary) 10%,transparent)", color: "var(--color-primary)" }}
              onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb,var(--color-primary) 18%,transparent)"}
              onMouseLeave={e => e.currentTarget.style.background = "color-mix(in srgb,var(--color-primary) 10%,transparent)"}>
              <span className="material-symbols-outlined text-base">add</span>
              Quick Add
            </button>
            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickActions(false)} />
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-xl overflow-hidden z-20 py-1"
                  style={{ background: "var(--color-surface-container-lowest)", border: "1px solid color-mix(in srgb,var(--color-outline-variant) 15%,transparent)" }}>
                  {quickActions.map(a => (
                    <button key={a.label}
                      onClick={() => {
                        setShowQuickActions(false);
                        navigate(a.path, { state: { fromQuickAdd: true } });
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors"
                      style={{ color: "var(--color-on-surface)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb,var(--color-primary) 6%,transparent)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <span className="material-symbols-outlined text-sm">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4 stat cards (engagement removed) */}
        <div className="grid grid-cols-4 gap-2.5 shrink-0">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Analytics with Class Breakdown panel intact */}
        <AnalyticsCard
          allBars={allBars}
          classLevels={classLevels}
          sections={sections}
          totalStudents={studentsCount}
        />

      </div>
    </SchoolLayout>
  );
}