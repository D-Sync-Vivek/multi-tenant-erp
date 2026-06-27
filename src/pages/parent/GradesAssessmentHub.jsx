import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-md ${className}`} />;
}

function GradesSkeleton() {
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <Skeleton className="w-40 sm:w-48 h-6" />
            <Skeleton className="w-56 sm:w-72 h-3" />
          </div>
          <Skeleton className="w-full sm:w-48 h-9 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <Skeleton className="w-24 h-3 mx-auto" />
            <Skeleton className="w-40 h-40 rounded-full mx-auto" />
            <Skeleton className="w-48 h-3 mx-auto" />
          </div>
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-full h-16" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          </div>
          <div className="lg:col-span-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 space-y-2">
              <Skeleton className="w-40 h-5" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 flex gap-4">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-12 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ─── Grade helpers ─────────────────────────────────────────────────────── */
const GRADE_COLORS = {
  "A+": { bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-400"  },
  A:    { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-400"    },
  "B+": { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
  B:    { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  C:    { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400"      },
};

function gradeColor(grade = "") {
  return GRADE_COLORS[grade] || { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" };
}

function scoreToGrade(score, maxScore) {
  const obtained = parseFloat(score);
  const max = parseFloat(maxScore);
  if (isNaN(obtained) || isNaN(max) || max === 0) return "N/A";
  const pct = (obtained / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  return "C";
}

// FIX 1: Normalize exam names to avoid whitespace/casing mismatches in tab filter
function normalizeExamName(name = "") {
  return name.trim();
}

const SUBJECT_ICONS = {
  math:       { icon: "functions",    bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-400"     },
  science:    { icon: "biotech",      bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
  english:    { icon: "translate",    bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  history:    { icon: "history_edu",  bg: "bg-teal-100 dark:bg-teal-900/30",     text: "text-teal-700 dark:text-teal-400"     },
  geography:  { icon: "public",       bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-400"   },
  physics:    { icon: "bolt",         bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
  chemistry:  { icon: "science",      bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400"       },
  biology:    { icon: "genetics",     bg: "bg-lime-100 dark:bg-lime-900/30",     text: "text-lime-700 dark:text-lime-400"     },
  computer:   { icon: "computer",     bg: "bg-cyan-100 dark:bg-cyan-900/30",     text: "text-cyan-700 dark:text-cyan-400"     },
  art:        { icon: "palette",      bg: "bg-pink-100 dark:bg-pink-900/30",     text: "text-pink-700 dark:text-pink-400"     },
  music:      { icon: "music_note",   bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400" },
  physical:   { icon: "sports",       bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-400"   },
};

function subjectStyle(name = "") {
  const lower = name.toLowerCase();
  for (const key of Object.keys(SUBJECT_ICONS)) {
    if (lower.includes(key)) return SUBJECT_ICONS[key];
  }
  return { icon: "menu_book", bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" };
}

/* ─── PDF: open print dialog (same approach as StudentHeader) ───────────── */
function handleDownloadPDF(studentName, grades, overallStats, enrollment) {
  const date = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const byExam = grades.reduce((acc, g) => {
    const exam = g.exam_name || "General";
    if (!acc[exam]) acc[exam] = [];
    acc[exam].push(g);
    return acc;
  }, {});

  const gradeColorMap = {
    "A+": "#16a34a", A: "#2563eb", "B+": "#ca8a04", B: "#ea580c", C: "#dc2626", "N/A": "#64748b",
  };

  const tableRows = grades.map(g => {
    const pct = g.marks_obtained != null && g.max_marks != null
      ? Math.round((parseFloat(g.marks_obtained) / parseFloat(g.max_marks)) * 100)
      : null;
    const gc = gradeColorMap[g.grade] || "#64748b";
    return `<tr>
      <td><strong>${g.subjectName}</strong></td>
      <td>${g.exam_name || "—"}</td>
      <td>${g.marks_obtained != null ? `${g.marks_obtained}` : "—"}</td>
      <td>${g.max_marks ?? "—"}</td>
      <td><strong>${pct !== null ? `${pct}%` : "—"}</strong></td>
      <td><span style="background:${gc}18;color:${gc};padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700">${g.grade}</span></td>
      <td style="font-style:italic;color:#64748b">${g.remarks && g.remarks !== "No remarks provided." ? g.remarks : "—"}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><title>Report Card — ${studentName}</title><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',sans-serif;padding:40px;color:#333}
    .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #3b82f6;padding-bottom:20px}
    .header h1{font-size:28px;color:#1e293b}
    .header h2{font-size:16px;color:#64748b;font-weight:normal;margin-top:4px}
    .badge-row{display:flex;justify-content:center;gap:24px;margin:16px 0}
    .badge{text-align:center;background:#f1f5f9;border-radius:12px;padding:12px 20px;min-width:100px}
    .badge .label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;margin-bottom:4px}
    .badge .val{font-size:24px;font-weight:800;color:#2563eb}
    .info{background:#f8fafc;padding:12px 20px;border-radius:10px;margin-bottom:24px;display:flex;flex-wrap:wrap;gap:16px;font-size:13px}
    .info span{color:#64748b}.info strong{color:#1e293b}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px}
    th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#475569;border-bottom:2px solid #e2e8f0;text-transform:uppercase;letter-spacing:.04em}
    td{padding:10px 12px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
    .footer{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8}
    @media print{body{padding:24px}.footer{position:fixed;bottom:0;width:100%}}
  </style></head><body>
  <div class="header">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#2563eb;margin-bottom:6px">The Academic Architect · Official Report Card</div>
    <h1>${studentName}</h1>
    <h2>${enrollment ? `${enrollment.class_level_name} – ${enrollment.section_name}` : ""}</h2>
  </div>
  <div class="badge-row">
    <div class="badge"><div class="label">Overall Grade</div><div class="val">${overallStats.grade || "—"}</div></div>
    <div class="badge"><div class="label">Avg Score</div><div class="val">${overallStats.avgPct ?? 0}%</div></div>
    <div class="badge"><div class="label">Subjects</div><div class="val">${grades.length}</div></div>
    <div class="badge"><div class="label">Exams</div><div class="val">${Object.keys(byExam).length}</div></div>
  </div>
  <div class="info">
    <span>Generated: <strong>${date}</strong></span>
    ${enrollment?.academic_year_name ? `<span>Academic Year: <strong>${enrollment.academic_year_name}</strong></span>` : ""}
    ${overallStats.gpa ? `<span>GPA: <strong>${overallStats.gpa}</strong></span>` : ""}
  </div>
  <table>
    <thead><tr><th>Subject</th><th>Exam</th><th>Obtained</th><th>Max</th><th>Score %</th><th>Grade</th><th>Remarks</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer"><p>This report is generated by The Academic Architect and is for informational purposes only. · ${date}</p></div>
  <script>window.print(); setTimeout(() => window.close(), 500);<\/script>
  </body></html>`;

  // Open in new window and trigger the browser's native Print → Save as PDF dialog
  const printWindow = window.open("", "_blank");
  if (!printWindow) return; // popup blocked — nothing we can do silently
  printWindow.document.write(html);
  printWindow.document.close();
}

/* ─── Circular progress ─────────────────────────────────────────────────── */
function CircularGrade({ grade, gpa }) {
  const gradeMap = { "A+": 100, A: 85, "B+": 75, B: 65, C: 50, "N/A": 0 };
  const pct = gradeMap[grade] ?? 70;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Overall Performance</span>
      <div className="relative">
        <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} fill="transparent" stroke="currentColor" strokeWidth="8"
            className="text-surface-container-low dark:text-slate-700" />
          <circle
            cx="80" cy="80" r={r} fill="transparent"
            stroke="currentColor" strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-extrabold font-headline text-on-surface dark:text-white">
            {grade || "—"}
          </span>
          {gpa && <span className="text-xs font-bold text-on-surface-variant dark:text-slate-400">GPA {gpa}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Performance trend chart ───────────────────────────────────────────── */
function PerformanceTrendChart({ data }) {
  if (!data.length) return null;

  const width = 560;
  const height = 88;
  const padX = 28;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (data.length === 1) {
    const point = data[0];
    return (
      <div className="mt-4 sm:mt-5">
        <span className="block text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-2">
          Performance Trend
        </span>
        <div className="flex items-center gap-3 bg-surface-container-low dark:bg-slate-700 rounded-xl px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-on-surface dark:text-white">
              {point.name} · {point.pct}%
            </p>
            <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
              A trend line will appear here once more exams are recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const xStep  = innerW / (data.length - 1);
  const yFor   = (pct) => padY + innerH - (Math.min(100, Math.max(0, pct)) / 100) * innerH;
  const points = data.map((d, i) => ({ ...d, x: padX + i * xStep, y: yFor(d.pct) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + innerH} L${points[0].x},${padY + innerH} Z`;

  return (
    <div className="mt-4 sm:mt-5">
      <span className="block text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-2">
        Performance Trend
      </span>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <line x1={padX} y1={yFor(100)} x2={width - padX} y2={yFor(100)} stroke="currentColor" strokeWidth="1"
          className="text-surface-container-low dark:text-slate-600" strokeDasharray="3,3" />
        <line x1={padX} y1={yFor(50)} x2={width - padX} y2={yFor(50)} stroke="currentColor" strokeWidth="1"
          className="text-surface-container-low dark:text-slate-600" strokeDasharray="3,3" />
        <path d={areaPath} fill="currentColor" className="text-primary/10" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" className="text-primary" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="currentColor" className="text-primary" />
            <circle cx={p.x} cy={p.y} r="7" fill="currentColor" className="text-primary/15" />
            <text x={p.x} y={padY - 4} textAnchor="middle" fontSize="10" fontWeight="700"
              fill="currentColor" className="text-on-surface dark:text-white">{p.pct}%</text>
            <text x={p.x} y={height - 2} textAnchor="middle" fontSize="9"
              fill="currentColor" className="text-on-surface-variant dark:text-slate-400">
              {p.name.length > 12 ? `${p.name.slice(0, 11)}…` : p.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Mobile grade card ─────────────────────────────────────────────────── */
function MobileGradeCard({ g, style, gc, pct, examName }) {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-800/60 rounded-lg p-4 border border-surface-container-low dark:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`material-symbols-outlined text-sm ${style.text}`}>{style.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-bold text-on-surface dark:text-white text-sm block truncate">{g.subjectName}</span>
          <span className="text-xs text-on-surface-variant dark:text-slate-400">{examName}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${gc.bg} ${gc.text}`}>
          {g.grade}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-surface-container-low dark:bg-slate-700 rounded-md p-2">
          <p className="text-[10px] text-on-surface-variant dark:text-slate-400 mb-0.5">Marks</p>
          <p className="text-xs font-bold text-on-surface dark:text-white">
            {g.marks_obtained != null ? `${g.marks_obtained}/${g.max_marks ?? "?"}` : "—"}
          </p>
        </div>
        <div className="bg-surface-container-low dark:bg-slate-700 rounded-md p-2">
          <p className="text-[10px] text-on-surface-variant dark:text-slate-400 mb-0.5">Score</p>
          <p className={`text-xs font-bold ${pct !== null ? (pct >= 75 ? "text-primary" : pct >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500") : "text-on-surface-variant dark:text-slate-400"}`}>
            {pct !== null ? `${pct}%` : "—"}
          </p>
        </div>
      </div>
      {g.remarks && g.remarks !== "No remarks provided." && (
        <p className="text-xs text-on-surface-variant dark:text-slate-400 italic mt-2 leading-relaxed">"{g.remarks}"</p>
      )}
    </div>
  );
}

/* ─── No-permission / error states ─────────────────────────────────────── */
function NoAcademicsAccess({ studentFirstName }) {
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl p-8 sm:p-12 text-center border border-outline-variant/10 dark:border-slate-700/40 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant dark:text-slate-500">lock</span>
          <h2 className="text-lg font-bold font-headline text-on-surface dark:text-white mt-4">
            Academic access not enabled
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-2 max-w-md mx-auto">
            Your account doesn't currently have permission to view {studentFirstName}&apos;s grades and report card.
            Contact the school office to have academic access enabled for your profile.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function GradesFetchError({ studentFirstName, onRetry }) {
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl p-8 sm:p-12 text-center border border-outline-variant/10 dark:border-slate-700/40 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-red-400">error</span>
          <h2 className="text-lg font-bold font-headline text-on-surface dark:text-white mt-4">
            Couldn't load {studentFirstName}&apos;s grades
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-2 max-w-md mx-auto">
            Something went wrong while fetching this report card. This is likely temporary — try again.
          </p>
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Retry
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function GradesAssessmentHub() {
  const {
    activeChild,
    gradesFlat,
    gradesExams,
    gradesSummary,
    gradesPermissionDenied,
    gradesFetchFailed,
    retryChildData,
    enrollment,
    loading,
    childDataLoading,
    error,
  } = useParent();

  // FIX 3: Reset tab when activeChild changes so stale exam tab never persists
  const [activeTab, setActiveTab] = useState("all");
  useEffect(() => {
    setActiveTab("all");
  }, [activeChild?.id]);

  /* ── Process grades ── */
  const allGrades = useMemo(() => {
    if (!Array.isArray(gradesFlat)) return [];
    return gradesFlat.map((g) => ({
      ...g,
      subjectName: g.subject_name || "Unknown Subject",
      // FIX 4: normalize exam_name here once so all comparisons use the same value
      exam_name: normalizeExamName(g.exam_name || ""),
      grade: scoreToGrade(g.marks_obtained, g.max_marks),
      remarks: g.remarks && g.remarks.trim() ? g.remarks : "No remarks provided.",
    }));
  }, [gradesFlat]);

  /* ── Exam options — FIX 5: built from normalized exam_name, deduped, sorted ── */
  const examOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    for (const g of allGrades) {
      const name = g.exam_name;
      if (name && !seen.has(name)) {
        seen.add(name);
        options.push(name);
      }
    }
    return options.sort();
  }, [allGrades]);

  /* ── FIX 6: Filter — activeTab is already normalized; g.exam_name already normalized above ── */
  const filteredGrades = useMemo(() => {
    if (activeTab === "all") return allGrades;
    return allGrades.filter((g) => g.exam_name === activeTab);
  }, [allGrades, activeTab]);

  /* ── Overall stats ── */
  const overallStats = useMemo(() => {
    if (!allGrades.length) return { grade: "—", avgPct: 0, gpa: null };
    const withScores = allGrades.filter((g) => g.marks_obtained != null && g.max_marks != null);
    if (!withScores.length) return { grade: "—", avgPct: 0, gpa: null };
    const avgPct = gradesSummary?.overall_percentage != null
      ? gradesSummary.overall_percentage
      : withScores.reduce((sum, g) =>
          sum + (parseFloat(g.marks_obtained) / parseFloat(g.max_marks)) * 100, 0
        ) / withScores.length;
    const grade = scoreToGrade(avgPct, 100);
    const gpa   = ((avgPct / 100) * 4).toFixed(1);
    return { grade, avgPct: Math.round(avgPct), gpa };
  }, [allGrades, gradesSummary]);

  /* ── Best & weakest ── */
  const { best, weakest } = useMemo(() => {
    const withScores = allGrades.filter((g) => g.marks_obtained != null && g.max_marks != null);
    if (!withScores.length) return { best: null, weakest: null };
    const sorted = [...withScores].sort(
      (a, b) =>
        parseFloat(b.marks_obtained) / parseFloat(b.max_marks) -
        parseFloat(a.marks_obtained) / parseFloat(a.max_marks)
    );
    return { best: sorted[0], weakest: sorted[sorted.length - 1] };
  }, [allGrades]);

  /* ── Trend ── */
  const trendData = useMemo(() => {
    if (!Array.isArray(gradesExams)) return [];
    return gradesExams
      .map((exam) => {
        const subs = exam.subjects || [];
        if (!subs.length) return null;
        const total = subs.reduce((sum, s) => {
          const pct = s.percentage != null
            ? parseFloat(s.percentage)
            : (parseFloat(s.marks_obtained) / parseFloat(s.max_marks)) * 100;
          return sum + (isNaN(pct) ? 0 : pct);
        }, 0);
        return {
          name: normalizeExamName(exam.exam_name || "Exam"),
          date: exam.exam_date,
          pct: Math.round(total / subs.length),
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [gradesExams]);

  if (loading || childDataLoading) return <GradesSkeleton />;

  if (error || !activeChild) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl p-5 text-sm">
            Could not load grades data. {error?.message || "Please try again later."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const studentFullName  = activeChild.name || "your child";
  const studentFirstName = studentFullName.split(" ")[0] || studentFullName;

  if (activeChild.can_view_academics === false || gradesPermissionDenied) {
    return <NoAcademicsAccess studentFirstName={studentFirstName} />;
  }

  if (gradesFetchFailed) {
    return <GradesFetchError studentFirstName={studentFirstName} onRetry={retryChildData} />;
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Grades &amp; Report Card
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
              Track {studentFirstName}&apos;s academic progress and subject performance.
            </p>
          </div>
          {/* FIX 7: Download passes overallStats + enrollment for the rich PDF */}
          <button
            onClick={() => handleDownloadPDF(studentFullName, filteredGrades, overallStats, enrollment)}
            disabled={filteredGrades.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white
                       px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Download Report Card
          </button>
        </div>

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          {/* Overall grade circle */}
          <div className="lg:col-span-4 bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl p-5 sm:p-6 shadow-sm border border-outline-variant/10 dark:border-slate-700/40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            {allGrades.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant dark:text-slate-500">grade</span>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-2">No grades available yet</p>
              </div>
            ) : (
              <CircularGrade grade={overallStats.grade} gpa={overallStats.gpa} />
            )}
            <div className="mt-4 w-full grid grid-cols-2 gap-2">
              <div className="bg-surface-container-low dark:bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-[10px] text-on-surface-variant dark:text-slate-400 font-medium uppercase tracking-wider">Avg Score</p>
                <p className="text-lg font-bold font-headline text-on-surface dark:text-white">{overallStats.avgPct}%</p>
              </div>
              <div className="bg-surface-container-low dark:bg-slate-700 rounded-lg p-3 text-center">
                <p className="text-[10px] text-on-surface-variant dark:text-slate-400 font-medium uppercase tracking-wider">Subjects</p>
                <p className="text-lg font-bold font-headline text-on-surface dark:text-white">{allGrades.length}</p>
              </div>
            </div>
          </div>

          {/* Performance Insight */}
          <div className="lg:col-span-8 bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/10 dark:border-slate-700/40 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <h3 className="text-sm font-bold font-headline text-on-surface dark:text-white">Performance Insight</h3>
                </div>
                <p className="text-sm text-on-surface dark:text-slate-200 leading-relaxed">
                  {allGrades.length === 0
                    ? `No assessment data available yet for ${studentFirstName}.`
                    : best
                    ? (
                      <>
                        {studentFirstName} is showing{" "}
                        <span className="text-primary font-bold">strong performance in {best.subjectName}</span>
                        {weakest && weakest.subjectName !== best.subjectName
                          ? `. Focused effort on ${weakest.subjectName} can help boost the overall grade.`
                          : "."}
                      </>
                    )
                    : `${studentFirstName}'s grades are being tracked this term.`}
                </p>
              </div>
              <div className="hidden sm:flex bg-tertiary/10 p-3 rounded-xl flex-shrink-0">
                <span className="material-symbols-outlined text-tertiary text-3xl">trending_up</span>
              </div>
            </div>

            {allGrades.length > 0 && <PerformanceTrendChart data={trendData} />}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-low dark:bg-slate-700 px-4 py-3 rounded-xl">
                <span className="block text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-1">Best Subject</span>
                <span className="text-xs font-semibold text-on-surface dark:text-white">{best?.subjectName || "—"}</span>
              </div>
              <div className="bg-surface-container-low dark:bg-slate-700 px-4 py-3 rounded-xl">
                <span className="block text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-1">Needs Attention</span>
                <span className="text-xs font-semibold text-on-surface dark:text-white">{weakest?.subjectName || "—"}</span>
              </div>
              <div className="bg-surface-container-low dark:bg-slate-700 px-4 py-3 rounded-xl">
                <span className="block text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-1">Class / Section</span>
                <span className="text-xs font-semibold text-on-surface dark:text-white">
                  {enrollment ? `${enrollment.class_level_name} – ${enrollment.section_name}` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Assessment table */}
          <div className="lg:col-span-12 bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 dark:border-slate-700/40">
            <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-surface-container-low dark:border-slate-700">
              <div>
                <h3 className="text-sm font-bold font-headline text-on-surface dark:text-white">Detailed Assessment</h3>
                {/* FIX 8: Show count hint when filtering */}
                {activeTab !== "all" && (
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-0.5">
                    Showing {filteredGrades.length} subject{filteredGrades.length !== 1 ? "s" : ""} for{" "}
                    <span className="font-semibold text-primary">{activeTab}</span>
                  </p>
                )}
              </div>

              {/* FIX 9: Exam filter tabs — activeTab matched against normalized exam_name */}
              {examOptions.length > 0 && (
                <div className="flex items-center bg-surface-container-low dark:bg-slate-700 rounded-xl p-1 gap-1 flex-wrap w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "all"
                        ? "bg-white dark:bg-slate-600 shadow-sm text-primary dark:text-blue-300"
                        : "text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-blue-300"
                    }`}
                  >
                    All
                    <span className="ml-1.5 bg-primary/10 text-primary dark:bg-blue-900/40 dark:text-blue-300
                                     px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {allGrades.length}
                    </span>
                  </button>

                  {examOptions.map((ex) => {
                    const count = allGrades.filter(g => g.exam_name === ex).length;
                    return (
                      <button
                        key={ex}
                        onClick={() => setActiveTab(ex)}
                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === ex
                            ? "bg-white dark:bg-slate-600 shadow-sm text-primary dark:text-blue-300"
                            : "text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-blue-300"
                        }`}
                      >
                        {ex}
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                          ${activeTab === ex
                            ? "bg-primary/10 text-primary dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-surface-container dark:bg-slate-600 text-on-surface-variant dark:text-slate-300"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {filteredGrades.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant dark:text-slate-500">assignment</span>
                <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-2">No grade records found.</p>
                {activeTab !== "all" && (
                  <button
                    onClick={() => setActiveTab("all")}
                    className="mt-3 text-sm text-primary hover:underline font-medium"
                  >
                    Show all grades
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="lg:hidden px-4 py-4 space-y-3">
                  {filteredGrades.map((g, idx) => {
                    const style   = subjectStyle(g.subjectName);
                    const gc      = gradeColor(g.grade);
                    const pct     = g.marks_obtained != null && g.max_marks != null
                      ? Math.round((parseFloat(g.marks_obtained) / parseFloat(g.max_marks)) * 100)
                      : null;
                    return (
                      <MobileGradeCard
                        key={g.id || idx}
                        g={g}
                        style={style}
                        gc={gc}
                        pct={pct}
                        examName={g.exam_name || "—"}
                      />
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/50 dark:bg-slate-700/30">
                        <th className="px-5 py-3 text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Subject</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Exam</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Marks</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Grade</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">Remarks</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider text-right">Score %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low dark:divide-slate-700">
                      {filteredGrades.map((g, idx) => {
                        const style = subjectStyle(g.subjectName);
                        const gc    = gradeColor(g.grade);
                        const pct   = g.marks_obtained != null && g.max_marks != null
                          ? Math.round((parseFloat(g.marks_obtained) / parseFloat(g.max_marks)) * 100)
                          : null;

                        return (
                          <tr key={g.id || idx}
                            className="hover:bg-surface-container-low/30 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                                  <span className={`material-symbols-outlined text-base ${style.text}`}>{style.icon}</span>
                                </div>
                                <span className="text-xs font-bold text-on-surface dark:text-white">{g.subjectName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant dark:text-slate-400">{g.exam_name || "—"}</td>
                            <td className="px-5 py-4 text-xs font-semibold text-on-surface dark:text-white">
                              {g.marks_obtained != null ? `${g.marks_obtained}/${g.max_marks ?? "?"}` : "—"}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${gc.bg} ${gc.text}`}>
                                {g.grade}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant dark:text-slate-400 italic hidden xl:table-cell">
                              {g.remarks}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {pct !== null ? (
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-surface-container dark:bg-slate-600 rounded-full h-1.5 hidden xl:block">
                                    <div
                                      className={`h-1.5 rounded-full ${pct >= 75 ? "bg-primary" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-bold ${pct >= 75 ? "text-primary" : pct >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500"}`}>
                                    {pct}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-on-surface-variant dark:text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="px-4 sm:px-5 py-3 bg-surface-container-low/30 dark:bg-slate-700/20 border-t border-surface-container-low dark:border-slate-700 flex items-center justify-between">
              <p className="text-[10px] text-on-surface-variant dark:text-slate-400">
                Grades are verified by the Academic Board · {enrollment?.academic_year_name || "Current academic year"}
              </p>
              {/* FIX 10: Download button in footer too — scoped to current filter */}
              <button
                onClick={() => handleDownloadPDF(studentFullName, filteredGrades, overallStats, enrollment)}
                disabled={filteredGrades.length === 0}
                className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                {activeTab === "all" ? "Download full report" : `Download ${activeTab} report`}
              </button>
            </div>
          </div>

          {/* Bottom cards */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-md bg-gradient-to-br from-blue-700 to-blue-600">
              <div className="relative z-10">
                <h4 className="text-sm font-bold font-headline mb-2">Top Performing Subject</h4>
                {best ? (
                  <>
                    <p className="text-2xl sm:text-3xl font-extrabold font-headline mb-1">{best.subjectName}</p>
                    <p className="text-blue-100 text-sm mb-4">
                      {best.marks_obtained}/{best.max_marks} marks · Grade {best.grade}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg ${subjectStyle(best.subjectName).bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined text-base ${subjectStyle(best.subjectName).text}`}>
                          {subjectStyle(best.subjectName).icon}
                        </span>
                      </span>
                      <p className="text-xs text-blue-100">{studentFirstName} is excelling in this subject this term.</p>
                    </div>
                  </>
                ) : (
                  <p className="text-blue-100 text-sm">No subject data available yet.</p>
                )}
              </div>
              <span className="material-symbols-outlined absolute bottom-2 right-4 text-white/10 text-[80px] sm:text-[110px]">
                star
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-md bg-gradient-to-br from-purple-600 to-indigo-600">
              <div className="relative z-10">
                <h4 className="text-sm font-bold font-headline mb-2">Focus Area</h4>
                {weakest && weakest.subjectName !== best?.subjectName ? (
                  <>
                    <p className="text-2xl sm:text-3xl font-extrabold font-headline mb-1">{weakest.subjectName}</p>
                    <p className="text-purple-100 text-sm mb-4">
                      {weakest.marks_obtained}/{weakest.max_marks} marks · Grade {weakest.grade}
                    </p>
                    <p className="text-xs text-purple-100">
                      Extra practice and targeted revision can improve {studentFirstName}&apos;s score in this subject.
                    </p>
                  </>
                ) : (
                  <p className="text-purple-100 text-sm mt-2">
                    {allGrades.length === 0
                      ? "No grade data available yet."
                      : `${studentFirstName} is performing consistently across all subjects.`}
                  </p>
                )}
              </div>
              <span className="material-symbols-outlined absolute bottom-2 right-4 text-white/20 text-[60px] sm:text-[80px]">
                menu_book
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}