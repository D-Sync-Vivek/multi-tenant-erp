import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// Importing your real local components!
import MainLayout from "../../components/erp/teacher/MainLayout";
import Button from "../../components/erp/teacher/Button";
import Card from "../../components/erp/teacher/Card";
import Input from "../../components/erp/teacher/Input";
import Select from "../../components/erp/teacher/Select";
import { getMyProfile, getTeacherClasses, getSectionEnrollments, getGrades } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonCard } from "../../components/erp/teacher/LoadingPrimitives";

const MyClassesHub = () => {
  const navigate = useNavigate();

  // ─── Fetch profile + classes together, cached ───────────────────────────────
  const {
    data: classesPayload,
    loading,
    revalidating,
    error,
  } = useStaleData('teacher:classes', async () => {
    const profileData = await getMyProfile();
    const teacherId = profileData.profiles?.teacher?.id;
    if (!teacherId) throw new Error('You are not assigned a teacher profile.');

    const classesData = await getTeacherClasses(teacherId);
    const classesArray = Array.isArray(classesData) ? classesData : classesData.results || [];

    // Fetch student counts for each class concurrently
    const classMetrics = await Promise.all(
      classesArray.map(async (cls) => {
        const sectionId = typeof cls.section === 'object' ? cls.section?.id : cls.section || cls.section_id;
        const academicYearId = typeof cls.academic_year === 'object' ? cls.academic_year?.id : cls.academic_year || cls.academic_year_id;
        const subjectId = typeof cls.subject === 'object' ? cls.subject?.id : cls.subject || cls.subject_id;
        
        if (!sectionId) return { sectionId: null, count: 0, avgPerformance: 'N/A' };
        try {
          const [enrollmentsData, gradesData] = await Promise.all([
            getSectionEnrollments(sectionId, academicYearId),
            subjectId ? getGrades(subjectId) : Promise.resolve({ results: [] })
          ]);
          
          const students = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData.results || [];
          const grades = Array.isArray(gradesData) ? gradesData : gradesData.results || [];
          
          let gradesMap = {};
          grades.forEach(grade => {
            const sId = grade.student_id || grade.student;
            if (!gradesMap[sId] || parseFloat(grade.marks_obtained) > parseFloat(gradesMap[sId].marks_obtained)) {
              gradesMap[sId] = grade;
            }
          });
          
          let totalMarks = 0;
          students.forEach(student => {
            const sId = student.student?.id || student.student || student.student_id;
            const grade = gradesMap[sId];
            if (grade) {
              totalMarks += parseFloat(grade.marks_obtained || 0);
            }
          });
          
          const avgPerformance = students.length > 0
            ? (totalMarks / students.length).toFixed(1)
            : 'N/A';

          return { sectionId, count: students.length, avgPerformance };
        } catch {
          return { sectionId, count: 0, avgPerformance: 'N/A' };
        }
      })
    );

    const studentsMap = {};
    const performanceMap = {};
    classMetrics.forEach(({ sectionId, count, avgPerformance }) => {
      if (sectionId) {
        studentsMap[sectionId] = count;
        performanceMap[sectionId] = avgPerformance;
      }
    });

    return { profile: profileData, classes: classesArray, studentsMap, performanceMap };
  });

  const profile = classesPayload?.profile ?? null;
  const classes = classesPayload?.classes ?? [];
  const studentsMap = classesPayload?.studentsMap ?? {};
  const performanceMap = classesPayload?.performanceMap ?? {};

  // Helper to dynamically color code subjects
  const getSubjectAesthetics = (subjectName) => {
    const name = (subjectName || "").toLowerCase();
    if (name.includes("math") || name.includes("calc")) return { icon: "functions", colorClass: "text-[#0058be]", bgClass: "bg-[#0058be]/10", borderClass: "border-[#0058be]/20" };
    if (name.includes("phys") || name.includes("bio") || name.includes("chem") || name.includes("sci")) return { icon: "biotech", colorClass: "text-[#6b38d4]", bgClass: "bg-[#6b38d4]/10", borderClass: "border-[#6b38d4]/20" };
    if (name.includes("hist") || name.includes("geo")) return { icon: "history_edu", colorClass: "text-[#924700]", bgClass: "bg-[#924700]/10", borderClass: "border-[#924700]/20" };
    if (name.includes("lit") || name.includes("eng")) return { icon: "menu_book", colorClass: "text-[#0f9d58]", bgClass: "bg-[#0f9d58]/10", borderClass: "border-[#0f9d58]/20" };
    if (name.includes("comp") || name.includes("tech")) return { icon: "computer", colorClass: "text-[#ba1a1a]", bgClass: "bg-[#ba1a1a]/10", borderClass: "border-[#ba1a1a]/20" };
    return { icon: "school", colorClass: "text-[#0058be]", bgClass: "bg-[#0058be]/10", borderClass: "border-[#0058be]/20" };
  };

  if (error && !classesPayload) {
    return (
      <MainLayout title="My Classes">
        <div className="p-6 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Teaching Schedule">
      <RevalidatingBar show={revalidating} />

      {/* Filter Section — always visible, even while loading */}
      <section className="mb-10 flex flex-col lg:flex-row gap-6 items-end justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full lg:w-3/4">
          <Input label="Search Directory" icon="search" placeholder="Search by class or subject..." />
          <Select 
            label="Subject Filter" 
            options={['All Subjects', ...Array.from(new Set(classes.map(c => c.subject_name)))]} 
          />
          <Select 
            label="Class/Section Filter" 
            options={['All Sections', ...Array.from(new Set(classes.map(c => c.class_level_name)))]} 
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <Button variant="secondary" className="w-full lg:w-auto justify-center">Reset</Button>
          <Button variant="primary" className="w-full lg:w-auto justify-center">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Apply
          </Button>
        </div>
      </section>

      {/* Classes Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          // First-ever load: show skeleton cards
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : classes.length > 0 ? (
          classes.map((cls) => {
            const sectionId = typeof cls.section === 'object' ? cls.section?.id : cls.section || cls.section_id;
            const studentCount = studentsMap[sectionId] ?? 0;
            const avgPerformance = performanceMap[sectionId] ?? 'N/A';
            const subjectName = cls.subject_name || 'Subject';
            const levelClean = cls.class_level_name?.replace('Grade ', '') || '';
            const className = `${subjectName} ${levelClean}-${cls.section_name || ''}`;
            const description = cls.is_class_teacher
              ? `Class Teacher • ${cls.academic_year_name}`
              : `${cls.academic_year_name}`;
            
            const aes = getSubjectAesthetics(subjectName);

            return (
              <Card key={cls.id} hoverable>
                <div className="flex justify-between items-start mb-6">
                  <div className={`${aes.bgClass} p-3 rounded-xl`}>
                    <span className={`material-symbols-outlined ${aes.colorClass} text-3xl`}>{aes.icon}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${aes.borderClass} ${aes.colorClass} bg-white shadow-sm`}>
                      Active
                    </div>
                    {cls.is_class_teacher && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        Class Teacher
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-8">
                  <h2 className="font-display text-xl font-bold text-on-surface mb-1">{className}</h2>
                  <p className="text-on-surface-variant text-sm font-medium">{description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-surface-container-low p-4 rounded-md">
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">Students</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">groups</span>
                      <span className="text-lg font-bold font-display">{studentCount}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-md">
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">Avg. Performance</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-black">horizontal_rule</span>
                      <span className="text-lg font-bold text-black font-display">{avgPerformance !== 'N/A' ? `${avgPerformance}%` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-surface-container-high text-primary font-bold rounded-md hover:bg-primary hover:text-white transition-all duration-200"
                >
                  View Class Details
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 bg-white rounded-xl border border-dashed border-gray-300 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center text-[#0058be] mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl">event_busy</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Classes Assigned</h3>
            <p className="text-gray-500 max-w-sm text-sm mb-6">
              You currently have no active teacher assignments in the database for this academic year.
            </p>
            <button className="bg-white border border-gray-200 text-slate-700 font-semibold px-8 py-3 rounded-md hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Contact Administrator
            </button>
          </div>
        )}
      </div>

      {/* AI Insight Card - only shown if there are classes */}
      {!loading && classes.length > 0 && (
        <div className="mt-8">
          <Card className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] text-white border-transparent" hoverable>
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-blue-300 text-3xl">psychology</span>
              </div>
              <div className="bg-purple-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-purple-200 tracking-widest uppercase flex items-center gap-1 border border-purple-400/30">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Insight Generated
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">{classes[0]?.subject_name} ({classes[0]?.class_level_name})</h2>
              <p className="text-blue-200 text-sm font-medium">Predictive Engagement Model</p>
            </div>
            
            <div className="mb-8 p-4 bg-black/20 rounded-lg border border-white/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 shrink-0">warning</span>
              <p className="text-sm text-slate-200 leading-relaxed">
                Based on historical trends, the upcoming module typically sees a <strong className="text-amber-400">12% drop in student engagement</strong>. We recommend adjusting the lesson plan.
              </p>
            </div>
            
            <button
              onClick={() => navigate("/teacher/analytics")}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-white text-[#0b1c30] font-bold rounded-md hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              Review AI Recommendations
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default MyClassesHub;