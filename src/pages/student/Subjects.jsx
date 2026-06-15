import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { getSectionById } from "../../services/studentAPIs";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function SubjectsSkeleton() {
  return (
    <MainLayout title="My Subjects">
      <div className="p-4 md:p-5 h-full flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div className="space-y-1"><Skeleton className="w-36 h-6" /><Skeleton className="w-48 h-3" /></div>
          <Skeleton className="w-32 h-9 rounded-md" />
        </div>
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 grid grid-cols-4 gap-4">
            {["w-24","w-14","w-20","w-16"].map((w,i) => <Skeleton key={i} className={`${w} h-2.5`} />)}
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="px-4 py-3 grid grid-cols-4 gap-4 border-t border-gray-50 items-center">
              <div className="space-y-1"><Skeleton className="w-28 h-3" /><Skeleton className="w-12 h-2" /></div>
              <Skeleton className="w-10 h-3" />
              <Skeleton className="w-full h-1.5 rounded-full" />
              <Skeleton className="w-14 h-5 rounded-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <div className="col-span-2 bg-gray-200 animate-pulse rounded-xl h-28" />
          <div className="bg-white rounded-xl border-l-4 border-gray-200 p-4 space-y-2">
            <Skeleton className="w-28 h-2.5" />
            {[1,2].map(i => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-7 h-7 rounded shrink-0" />
                <div className="flex-1 space-y-1"><Skeleton className="w-24 h-2.5" /><Skeleton className="w-16 h-2" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function getPerformanceMeta(percentage) {
  if (percentage === 0) return { barColor: "bg-gray-300",    label: "No data",    labelColor: "bg-gray-100   text-gray-500"   };
  if (percentage >= 80)  return { barColor: "bg-green-500",  label: "Excellent",  labelColor: "bg-green-100  text-green-700"  };
  if (percentage >= 65)  return { barColor: "bg-blue-500",   label: "Good",       labelColor: "bg-blue-100   text-blue-700"   };
  if (percentage >= 50)  return { barColor: "bg-yellow-400", label: "Average",    labelColor: "bg-yellow-100 text-yellow-700" };
  return                        { barColor: "bg-red-400",    label: "Needs work", labelColor: "bg-red-100    text-red-700"    };
}

export default function Subjects() {
  const { academic, dashboard, enrollment, loading } = useStudent();
  const [classLevelId, setClassLevelId] = useState(null);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        if (!enrollment?.section) return;
        const sectionData = await getSectionById(enrollment.section);
        setClassLevelId(sectionData.class_level);
      } catch (error) { console.error(error); }
    };
    fetchSection();
  }, [enrollment]);

  if (loading) return <SubjectsSkeleton />;

  const subjects      = (academic?.subs || []).filter(s => s.class_levels?.includes(classLevelId));
  const grades        = dashboard?.grades?.results || [];
  const academicYears = academic?.years || [];

  const gradedSubjects  = subjects.filter(s => grades.find(g => g.subject === s.id));
  const subjectsWithPct = gradedSubjects.map(s => {
    const g = grades.find(gr => gr.subject === s.id);
    return { name: s.name, pct: Math.round((g.marks_obtained / g.max_marks) * 100) };
  });
  const overallPct     = subjectsWithPct.length > 0
    ? Math.round(subjectsWithPct.reduce((sum, s) => sum + s.pct, 0) / subjectsWithPct.length) : 0;
  const topSubject     = [...subjectsWithPct].sort((a, b) => b.pct - a.pct)[0];
  const weakSubject    = [...subjectsWithPct].sort((a, b) => a.pct - b.pct)[0];
  const excellentCount = subjectsWithPct.filter(s => s.pct >= 80).length;

  const getInsightMessage = () => {
    if (overallPct >= 80) return "Outstanding! You're performing excellently across all subjects.";
    if (overallPct >= 65) return "Good progress! Focus on weaker subjects to reach the top tier.";
    if (overallPct >= 50) return "You're on the right track. Consistent study will improve your scores.";
    return "There's room to grow! Reach out to your teachers for extra support.";
  };

  const getEmoji = () => {
    if (overallPct >= 80) return "emoji_events";
    if (overallPct >= 65) return "trending_up";
    if (overallPct >= 50) return "auto_awesome";
    return "support_agent";
  };

  return (
    <MainLayout title="The Academic Architect">
      {/* Full height, no scroll */}
      <div className="p-4 md:p-5 h-full flex flex-col gap-4 overflow-hidden">

        {/* Header — shrink-0 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-lg font-headline font-extrabold text-on-surface tracking-tight">My Subjects</h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Manage your academic curriculum and performance</p>
          </div>
          <select className="bg-surface-container-low border-none rounded-md px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-surface-tint outline-none w-full sm:w-auto">
            {academicYears.map((data) => (
              <option key={data.id}>{data.name}</option>
            ))}
          </select>
        </div>

        {/* Table — flex-1 fills remaining space, internal scroll only if needed */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10 min-h-0">
          <table className="w-full text-left border-collapse h-full">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-4 py-2.5 text-[10px] font-bold text-outline uppercase tracking-wider">Subject Name</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-outline uppercase tracking-wider">Marks</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-outline uppercase tracking-wider">
                  Performance <span className="text-[9px] normal-case font-medium text-outline/60">(% of max)</span>
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-outline uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-xs text-on-surface-variant">
                    No subjects found for your class.
                  </td>
                </tr>
              )}
              {subjects.map((subject) => {
                const gradeInfo  = grades.find(g => g.subject === subject.id);
                const percentage = gradeInfo
                  ? Math.round((gradeInfo.marks_obtained / gradeInfo.max_marks) * 100) : 0;
                const { barColor, label, labelColor } = getPerformanceMeta(percentage);
                return (
                  <tr key={subject.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-on-surface">{subject.name}</p>
                      <p className="text-[10px] text-outline mt-0.5">{subject.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      {gradeInfo
                        ? <span className="text-xs font-bold text-on-surface">
                            {gradeInfo.marks_obtained}
                            <span className="text-outline font-normal text-[10px]"> / {gradeInfo.max_marks}</span>
                          </span>
                        : <span className="text-[10px] text-outline">N/A</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex-shrink-0">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant flex-shrink-0">
                          {gradeInfo ? `${percentage}%` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${labelColor}`}>
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom cards — shrink-0 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

          {/* Dynamic Blue Box */}
          <div className="md:col-span-2 bg-primary-container text-on-primary-container px-5 py-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl shrink-0">{getEmoji()}</span>
                <div>
                  <h3 className="text-sm font-headline font-extrabold leading-tight">
                    Overall Performance: {overallPct}%
                  </h3>
                  <p className="text-primary-fixed opacity-90 text-[11px] mt-0.5 max-w-md">
                    {getInsightMessage()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {topSubject && (
                  <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <div>
                      <p className="text-[9px] opacity-75 uppercase tracking-wider font-bold">Top</p>
                      <p className="text-[10px] font-extrabold">{topSubject.name} — {topSubject.pct}%</p>
                    </div>
                  </div>
                )}
                {weakSubject && weakSubject.pct < 65 && (
                  <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                    <div>
                      <p className="text-[9px] opacity-75 uppercase tracking-wider font-bold">Focus On</p>
                      <p className="text-[10px] font-extrabold">{weakSubject.name} — {weakSubject.pct}%</p>
                    </div>
                  </div>
                )}
                {excellentCount > 0 && (
                  <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <div>
                      <p className="text-[9px] opacity-75 uppercase tracking-wider font-bold">Excellent in</p>
                      <p className="text-[10px] font-extrabold">{excellentCount} Subject{excellentCount > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <button className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-md text-[11px] font-bold hover:bg-white/30 transition-all">
                View Detailed Analysis
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Upcoming tasks */}
          <div className="bg-surface-container-low px-4 py-3 rounded-xl border-l-4 border-tertiary">
            <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">Upcoming Tasks</h4>
            <ul className="space-y-2">
              <li className="flex gap-2.5">
                <div className="bg-white w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-tertiary shadow-sm">
                  <span className="material-symbols-outlined text-base">lab_profile</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface">Physics Lab Report</p>
                  <p className="text-[10px] text-outline">Due in 2 days</p>
                </div>
              </li>
              <li className="flex gap-2.5">
                <div className="bg-white w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-secondary shadow-sm">
                  <span className="material-symbols-outlined text-base">history_edu</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface">Chem Quiz 4 Prep</p>
                  <p className="text-[10px] text-outline">Due tomorrow</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}