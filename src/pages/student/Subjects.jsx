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
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4 md:gap-6">
          <div className="space-y-2">
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-36 h-10 rounded-md" />
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          {/* Table header — hidden on mobile, shown md+ */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 bg-gray-50 px-6 py-4">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-20 h-3" />
          </div>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="px-4 md:px-6 py-4 md:py-5 border-t border-gray-50">
              {/* Mobile: stacked layout */}
              <div className="md:hidden space-y-2">
                <Skeleton className="w-36 h-4" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-full h-2 rounded-full" />
                  <Skeleton className="w-14 h-6 rounded-full flex-shrink-0" />
                </div>
              </div>
              {/* Desktop: grid layout */}
              <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                <div className="space-y-2">
                  <Skeleton className="w-36 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
                <Skeleton className="w-10 h-4" />
                <div className="space-y-1">
                  <Skeleton className="w-full h-2 rounded-full" />
                  <Skeleton className="w-8 h-3" />
                </div>
                <Skeleton className="w-14 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-200 animate-pulse rounded-lg min-h-[200px] md:min-h-[240px]" />
          <div className="bg-white rounded-lg border-l-4 border-gray-200 p-6 space-y-4">
            <Skeleton className="w-40 h-3" />
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-3" />
                  <Skeleton className="w-20 h-2.5" />
                </div>
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
      } catch (error) {
        console.error(error);
      }
    };
    fetchSection();
  }, [enrollment]);

  if (loading) return <SubjectsSkeleton />;

  const subjects = (academic?.subs || []).filter(
    (subject) => subject.class_levels?.includes(classLevelId)
  );
  const grades = dashboard?.grades?.results || [];
  const academicYears = academic?.years || [];

  return (
    <MainLayout title="The Academic Architect">
      {/*
        ── RESPONSIVE PADDING ──
        px-4 on mobile → px-8 on desktop
      */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto">

        {/* ── HEADER ──
            Mobile: stacked (flex-col), heading + dropdown stacked
            Desktop: side-by-side row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              My Subjects
            </h2>
            <p className="text-on-surface-variant mt-1 font-medium text-sm md:text-base">
              Manage your academic curriculum and performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-surface-container-lowest border border-outline-variant/30 rounded-md px-3 md:px-4 py-2 text-sm font-semibold shadow-sm focus:ring-primary w-full md:w-auto">
              {academicYears.map((data) => (
                <option key={data.id}>{data.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/*
          ── SUBJECTS — TWO VIEWS ──

          MOBILE (< md):   Card layout — each subject is a stacked card.
                           No horizontal scroll, no cramped columns.

          DESKTOP (>= md): Table layout — original 4-column table.
        */}

        {/* ── MOBILE CARD VIEW ── */}
        <div className="md:hidden space-y-3">
          {subjects.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-lg p-8 text-center text-sm text-on-surface-variant">
              No subjects found for your class.
            </div>
          ) : (
            subjects.map((subject) => {
              const gradeInfo  = grades.find(g => g.subject === subject.id);
              const percentage = gradeInfo
                ? Math.round((gradeInfo.marks_obtained / gradeInfo.max_marks) * 100)
                : 0;
              const { barColor, label, labelColor } = getPerformanceMeta(percentage);

              return (
                <div key={subject.id} className="bg-surface-container-lowest rounded-lg p-4 custom-shadow border border-outline-variant/10">
                  {/* Top row: name + status badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-bold text-on-surface text-sm">{subject.name}</p>
                      <p className="text-xs text-outline mt-0.5">{subject.code}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${labelColor}`}>
                      {label}
                    </span>
                  </div>
                  {/* Marks row */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs text-on-surface-variant font-medium">Marks</span>
                    <span className="font-bold text-on-surface text-sm">
                      {gradeInfo
                        ? <>{gradeInfo.marks_obtained}<span className="text-outline font-normal text-xs"> / {gradeInfo.max_marks}</span></>
                        : <span className="text-outline font-normal text-xs">N/A</span>
                      }
                    </span>
                  </div>
                  {/* Progress bar + % */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant w-8 text-right flex-shrink-0">
                      {gradeInfo ? `${percentage}%` : "—"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── DESKTOP TABLE VIEW ── */}
        <div className="hidden md:block bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Subject Name</th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Marks</th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                  Performance
                  <span className="ml-1 text-[9px] normal-case font-medium text-outline/60 tracking-normal">
                    (% of max marks)
                  </span>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-on-surface-variant">
                    No subjects found for your class.
                  </td>
                </tr>
              )}
              {subjects.map((subject) => {
                const gradeInfo   = grades.find(g => g.subject === subject.id);
                const percentage  = gradeInfo
                  ? Math.round((gradeInfo.marks_obtained / gradeInfo.max_marks) * 100)
                  : 0;
                const { barColor, label, labelColor } = getPerformanceMeta(percentage);

                return (
                  <tr key={subject.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-on-surface">{subject.name}</p>
                      <p className="text-xs text-outline mt-0.5">{subject.code}</p>
                    </td>
                    <td className="px-6 py-5 font-bold text-on-surface">
                      {gradeInfo
                        ? <span>{gradeInfo.marks_obtained}<span className="text-outline font-normal text-xs"> / {gradeInfo.max_marks}</span></span>
                        : <span className="text-outline font-normal text-sm">N/A</span>
                      }
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-on-surface-variant w-8 flex-shrink-0">
                          {gradeInfo ? `${percentage}%` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${labelColor}`}>
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── BOTTOM CARDS ──
            Mobile:  stacked (1 col)
            Desktop: 3-col (2+1) */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Promo banner */}
          <div className="md:col-span-2 bg-primary-container text-on-primary-container p-6 md:p-8 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[200px] md:min-h-[240px]">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-3xl md:text-4xl mb-3 md:mb-4 block">auto_awesome</span>
              <h3 className="text-xl md:text-2xl font-headline font-extrabold leading-tight">
                Your semester performance is <br className="hidden sm:block" />up by 12% from last year.
              </h3>
              <p className="mt-2 text-primary-fixed opacity-90 text-xs md:text-sm max-w-md">
                Great job! You&apos;re showing significant improvement in STEM subjects. Your current GPA projection is 3.85.
              </p>
            </div>
            <div className="relative z-10 mt-4 md:mt-6">
              <button className="bg-white/20 backdrop-blur-md text-white px-4 md:px-6 py-2 md:py-3 rounded-md text-sm font-bold hover:bg-white/30 transition-all">
                View Detailed Analysis
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Upcoming tasks */}
          <div className="bg-surface-container-low p-5 md:p-6 rounded-lg border-l-4 border-tertiary">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Upcoming Subject Tasks</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 md:gap-4">
                <div className="bg-white w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-tertiary shadow-sm">
                  <span className="material-symbols-outlined text-xl">lab_profile</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Physics Lab Report</p>
                  <p className="text-[10px] text-outline">Due in 2 days</p>
                </div>
              </li>
              <li className="flex gap-3 md:gap-4">
                <div className="bg-white w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-secondary shadow-sm">
                  <span className="material-symbols-outlined text-xl">history_edu</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Chem Quiz 4 Prep</p>
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