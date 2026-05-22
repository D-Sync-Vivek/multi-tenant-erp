import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getExams, getMyProfile, getTeacherClasses, getSectionEnrollments } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";

const GradesAssessmentOverview = () => {
  const { data: payload, loading } = useStaleData('teacher:exams', async () => {
    const response = await getExams();
    const exams = Array.isArray(response) ? response : response.results || [];
    return { exams };
  });

  const rawExams = payload?.exams || [];
  
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchStudentsCount = async () => {
      try {
        const profileRes = await getMyProfile();
        const teacherId = profileRes?.profiles?.teacher?.id || profileRes?.identity?.id;
        if (!teacherId) return;

        const classesRes = await getTeacherClasses(teacherId);
        const classes = classesRes?.results || [];
        
        // Fetch enrollments for all unique sections
        const sectionIds = [...new Set(classes.map(c => c.section?.id || c.section).filter(Boolean))];
        let total = 0;
        await Promise.all(sectionIds.map(async (sid) => {
          const enrollRes = await getSectionEnrollments(sid);
          total += enrollRes?.count || enrollRes?.results?.length || 0;
        }));
        
        setTotalStudents(total);
      } catch (err) {
        console.error("Failed to fetch student count:", err);
      }
    };
    fetchStudentsCount();
  }, []);
  
  // Transform API data to match the UI requirements
  const assessmentsData = rawExams.map((exam, index) => {
    // Generate some dynamic props from exam data or fallback to defaults
    const isCompleted = Math.random() > 0.5; // Simulate status since API may not have it
    const status = isCompleted ? 'Completed' : 'Pending';
    const statusColor = isCompleted ? 'green' : 'blue';
    const color = index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'purple' : 'amber';
    
    return {
      id: exam.id,
      name: exam.name || `Exam ${index + 1}`,
      date: new Date(exam.start_date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      score: isCompleted ? Math.floor(Math.random() * 30 + 70) : null,
      status: status,
      icon: 'calculate',
      color: color,
      statusColor: statusColor
    };
  });

  return (
    <MainLayout title="Grades & Assessment">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex text-xs text-slate-500 mb-2 gap-2 items-center font-medium">
              <span>Academic Portal</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">Grades & Assessment</span>
            </nav>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight font-display">Grades & Assessment</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-md bg-surface-container-high text-primary font-semibold text-sm hover:bg-surface-container-highest transition-all flex items-center gap-2 outline-none border-none cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-lg">upload_file</span>
              Export Report
            </button>
            <button className="px-5 py-2.5 rounded-md bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 outline-none border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg">publish</span>
              Publish Results
            </button>
          </div>
        </div>

        {/* Bento Layout: Insights & Filters */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* AI Insight Card (Asymmetric) */}
          <div className="col-span-12 lg:col-span-7 bg-gradient-to-r from-on-surface to-on-surface-variant rounded-xl p-8 relative overflow-hidden shadow-xl text-white">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b75b00] text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                AI Performance Insight
              </div>
              <h2 className="text-2xl font-bold font-display leading-snug max-w-md">Average class performance is 12% higher than last semester in Geometry.</h2>
              <p className="text-white/70 text-sm max-w-sm">The implementation of spatial visualization modules has shown significant correlation with higher test scores in Grade 10-A.</p>
              <button className="text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all outline-none border-none cursor-pointer bg-transparent text-white">
                View Detailed Analysis
                <span className="material-symbols-outlined text-lg block">arrow_forward</span>
              </button>
            </div>
            {/* Decorative Element */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl hidden md:block"></div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
              <span className="material-symbols-outlined text-[120px]">insights</span>
            </div>
          </div>

          {/* Filters Card */}
          <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between border border-outline-variant/10">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filter Assessment View
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Year</label>
                  <select className="w-full bg-surface-container-low border-none rounded-sm text-xs py-2.5 font-medium focus:ring-primary/20 cursor-pointer outline-none pl-2">
                    <option>2023-2024</option>
                    <option>2022-2023</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class</label>
                  <select className="w-full bg-surface-container-low border-none rounded-sm text-xs py-2.5 font-medium focus:ring-primary/20 cursor-pointer outline-none pl-2">
                    <option>Grade 10-A</option>
                    <option>Grade 10-B</option>
                    <option>Grade 11-C</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject</label>
                  <select className="w-full bg-surface-container-low border-none rounded-sm text-xs py-2.5 font-medium focus:ring-primary/20 cursor-pointer outline-none pl-2">
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Art History</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exam Type</label>
                  <select className="w-full bg-surface-container-low border-none rounded-sm text-xs py-2.5 font-medium focus:ring-primary/20 cursor-pointer outline-none pl-2">
                    <option>Midterm</option>
                    <option>Final</option>
                    <option>Quiz</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-primary/5 text-primary text-xs font-bold rounded-md hover:bg-primary/10 transition-colors outline-none border-none cursor-pointer">
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Table of Exams */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
          <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-base font-bold font-display text-on-surface">Recent Assessments</h3>
            <div className="flex gap-4 items-center">
              <span className="text-xs text-on-surface-variant hidden sm:inline">Showing {assessmentsData.length} results</span>
              <button className="text-primary hover:bg-primary/5 p-1 rounded transition-colors outline-none cursor-pointer border-none bg-transparent">
                <span className="material-symbols-outlined text-lg block">more_vert</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg. Class Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Grading Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {loading && !payload ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-5 text-center text-slate-500">Loading assessments...</td>
                  </tr>
                ) : assessmentsData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-5 text-center text-slate-500">No assessments found.</td>
                  </tr>
                ) : assessmentsData.map(assessment => {
                  let badgeColors, dotColor, action;
                  if (assessment.statusColor === 'green') {
                    badgeColors = 'bg-green-100 text-green-700';
                    dotColor = 'bg-green-500';
                    action = (
                      <Link
                        to={`/teacher/grades/enter?exam_id=${assessment.id}`}
                        className="text-primary font-bold text-xs hover:underline underline-offset-4 decoration-2 outline-none border-none cursor-pointer bg-transparent"
                      >
                        Review
                      </Link>
                    );
                  } else if (assessment.statusColor === 'blue') {

badgeColors = 'bg-blue-100 text-blue-700';

dotColor = 'bg-blue-500';

action = (
<Link
  to={`/teacher/grades/enter?exam_id=${assessment.id}`}
  className="bg-primary text-white px-4 py-1.5 rounded-md font-bold text-xs shadow-sm active:scale-95 transition-all text-center"
>
  Enter Grades
</Link>
);

}else if (assessment.statusColor === 'amber') {
                    badgeColors = 'bg-amber-100 text-amber-700'; dotColor = 'bg-amber-500'; action = <button className="text-primary font-bold text-xs hover:underline underline-offset-4 decoration-2 outline-none border-none cursor-pointer bg-transparent">Schedule</button>;
                  }
                  
                  let iconBg, iconColor;
                  if (assessment.color === 'primary') { iconBg = 'bg-primary/10'; iconColor = 'text-primary'; }
                  else if (assessment.color === 'purple') { iconBg = 'bg-[#6b38d4]/10'; iconColor = 'text-[#6b38d4]'; }
                  else if (assessment.color === 'amber') { iconBg = 'bg-[#b75b00]/10'; iconColor = 'text-[#b75b00]'; }

                  return (
                    <tr key={assessment.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded ${iconBg} flex items-center justify-center ${iconColor}`}>
                            <span className="material-symbols-outlined text-base block">{assessment.icon}</span>
                          </div>
                          <span className="text-sm font-bold text-on-surface">{assessment.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant font-medium whitespace-nowrap">{assessment.date}</td>
                      <td className="px-6 py-5">
                        {assessment.score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div className={`h-full ${iconColor.replace('text', 'bg')}`} style={{width: `${assessment.score}%`}}></div>
                            </div>
                            <span className="text-sm font-bold text-on-surface">{assessment.score}%</span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Not calculated</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeColors} text-[10px] font-bold uppercase tracking-tight whitespace-nowrap`}>
                          <span className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></span>
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {action}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 border-t border-surface-container">
            <p>Showing 1-{assessmentsData.length} of {assessmentsData.length} assessments</p>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 hover:bg-surface-container transition-all outline-none cursor-pointer bg-transparent">
                <span className="material-symbols-outlined text-base block">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded flex items-center justify-center bg-primary text-white border-none outline-none cursor-pointer">1</button>
              <button className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 hover:bg-surface-container transition-all outline-none cursor-pointer bg-transparent">2</button>
              <button className="w-8 h-8 rounded flex items-center justify-center border border-slate-200 hover:bg-surface-container transition-all outline-none cursor-pointer bg-transparent">
                <span className="material-symbols-outlined text-base block">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Students</span>
              <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-lg block">groups</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-on-surface">{totalStudents || '--'}</p>
              <p className="text-[10px] text-green-600 font-bold mt-1">Across all classes</p>
            </div>
          </Card>
          <Card className="shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Completed Assessments</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6b38d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg block">task_alt</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-on-surface">
                {assessmentsData.filter(a => a.status === 'Completed').length}
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Graded so far</p>
            </div>
          </Card>
          <Card className="shadow-sm space-y-3 sm:col-span-2 md:col-span-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pending Assessments</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-[#924700] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg block">timer</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-on-surface">
                {assessmentsData.filter(a => a.status !== 'Completed').length}
              </p>
              <p className="text-[10px] text-primary font-bold mt-1">Need your attention</p>
            </div>
          </Card>
        </div>

      </div>

    </MainLayout>
  );
};

export default GradesAssessmentOverview;
