import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { useStaleData } from "../../hooks/useStaleData";
import { getMyProfile, getTeacherClasses, getSectionEnrollments, getAttendanceRecords, getGrades } from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: profile } = useStaleData("profile:me", getMyProfile);
  const teacherId = profile?.profiles?.teacher?.id || profile?.identity?.id;

  const teacherName = profile?.profiles?.teacher?.full_name
    || profile?.profiles?.teacher?.name
    || [profile?.profiles?.teacher?.first_name, profile?.profiles?.teacher?.last_name].filter(Boolean).join(' ')
    || profile?.identity?.name
    || [profile?.identity?.first_name, profile?.identity?.last_name].filter(Boolean).join(' ')
    || 'Teacher';

  const { data: assignmentsData, loading, revalidating } = useStaleData(
    `teacher:classes:${teacherId}`,
    () => getTeacherClasses(teacherId),
    { skip: !teacherId }
  );

  const classes = assignmentsData?.results || [];

  const { data: stats, loading: statsLoading } = useStaleData(
    `teacher:stats:${teacherId}`,
    async () => {
      const assignments = await getTeacherClasses(teacherId);
      const classesList = assignments?.results || [];

      if (classesList.length === 0) {
        return { avgAttendance: 0, avgPerformancePercentage: 0 };
      }

      // Fetch all section enrollments, attendance, and grades for all classes in parallel
      const promises = classesList.map(async (cls) => {
        const sectionId = typeof cls.section === 'object'
          ? cls.section?.id
          : cls.section || cls.section_id;
        const academicYearId = typeof cls.academic_year === 'object'
          ? cls.academic_year?.id
          : cls.academic_year || cls.academic_year_id;
        const subjectId = typeof cls.subject === 'object'
          ? cls.subject?.id
          : cls.subject || cls.subject_id;

        if (!sectionId) return { students: [], attendanceMap: {}, gradesMap: {} };

        try {
          const [enrollmentsData, attendanceData, gradesData] = await Promise.all([
            getSectionEnrollments(sectionId, academicYearId),
            getAttendanceRecords(sectionId, academicYearId),
            subjectId ? getGrades(subjectId) : Promise.resolve({ results: [] })
          ]);

          const students = Array.isArray(enrollmentsData)
            ? enrollmentsData
            : enrollmentsData.results || [];

          const records = Array.isArray(attendanceData)
            ? attendanceData
            : attendanceData.results || [];

          const attendanceMap = {};
          records.forEach(record => {
            const sId = record.student_id || record.student;
            if (!attendanceMap[sId]) attendanceMap[sId] = { present: 0, total: 0 };
            attendanceMap[sId].total += 1;
            if (record.status === 'Present' || record.status === 'Late') {
              attendanceMap[sId].present += 1;
            }
          });

          const grades = Array.isArray(gradesData)
            ? gradesData
            : gradesData.results || [];
            
          const gradesMap = {};
          grades.forEach(grade => {
            const sId = grade.student_id || grade.student;
            if (!gradesMap[sId] || parseFloat(grade.marks_obtained) > parseFloat(gradesMap[sId].marks_obtained)) {
              gradesMap[sId] = grade;
            }
          });

          return { students, attendanceMap, gradesMap };
        } catch (err) {
          console.error("Error loading class data for stats:", err);
          return { students: [], attendanceMap: {}, gradesMap: {} };
        }
      });

      const results = await Promise.all(promises);

      let overallTotalAttendanceRecords = 0;
      let overallTotalPresent = 0;
      let overallTotalObtainedMarks = 0;
      let overallTotalMaxMarks = 0;

      results.forEach(({ students, attendanceMap, gradesMap }) => {
        students.forEach(student => {
          const sId = student.student?.id || student.student || student.student_id;
          
          // Attendance
          const att = attendanceMap[sId];
          if (att) {
            overallTotalAttendanceRecords += att.total;
            overallTotalPresent += att.present;
          }

          // Grades
          const grade = gradesMap[sId];
          if (grade) {
            overallTotalObtainedMarks += parseFloat(grade.marks_obtained || 0);
            overallTotalMaxMarks += parseFloat(grade.max_marks || 0);
          }
        });
      });

      const avgAttendance = overallTotalAttendanceRecords > 0
        ? ((overallTotalPresent / overallTotalAttendanceRecords) * 100).toFixed(1)
        : 0;

      const avgPerformancePercentage = overallTotalMaxMarks > 0
        ? ((overallTotalObtainedMarks / overallTotalMaxMarks) * 100).toFixed(1)
        : 0;

      return { avgAttendance, avgPerformancePercentage };
    },
    { skip: !teacherId }
  );




  return (
    <MainLayout title="The Academic Architect">
      {/* TopAppBar Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-10 gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">{`Good morning, ${teacherName}`}</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card hoverable className="group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-1 bg-primary/5 rounded-lg">Today</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Classes</p>
          <h3 className="font-display text-4xl font-black mt-1 text-slate-800">{loading ? '-' : classes.length}</h3>
        </Card>
        {/*
        <Card hoverable className="group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pending Assignments</p>
          <h3 className="font-display text-4xl font-black mt-1 text-slate-800">12</h3>
        </Card>
        */}
        <Card hoverable className="group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
            <span className="text-xs font-bold text-green-600 flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
              <span className="material-symbols-outlined text-sm">trending_up</span> 2.1%
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Avg Attendance</p>
          <h3 className="font-display text-4xl font-black mt-1 text-slate-800">
            {statsLoading ? '—' : `${stats?.avgAttendance ?? 0}%`}
          </h3>
        </Card>
        <Card hoverable className="group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-700 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
              <span className="material-symbols-outlined">query_stats</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Avg Performance</p>
          <h3 className="font-display text-4xl font-black mt-1 text-slate-800">
            {statsLoading ? '—' : `${stats?.avgPerformancePercentage ?? 0}%`}
          </h3>
        </Card>
      </section>

      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Schedule Section */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-display text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                Today's Schedule
              </h4>
              <button className="text-sm font-bold text-primary hover:underline">Full Calendar</button>
            </div>
            <div className="space-y-4">
              {loading && classes.length === 0 ? (
                <div className="p-5 text-center text-slate-500">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="p-5 text-center text-slate-500 bg-surface-container-lowest rounded-xl">No classes assigned for you today.</div>
              ) : (
                classes.map((cls, index) => (
                  <Card key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-6 group hover:bg-surface-container-low transition-colors duration-300">
                    <div className="w-16 h-16 rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-on-surface-variant shrink-0">
                      <span className="text-xs font-bold text-primary">Class</span>
                      <div className="w-8 h-[2px] bg-primary/20 my-1"></div>
                      <span className="text-xl font-black text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-lg">{cls.subject_name} ({cls.class_level_name} - {cls.section_name})</h5>
                      <p className="text-sm text-on-surface-variant">Academic Year: {cls.academic_year_name}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200 transition-colors"
                      >
                        View Class
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/attendance/mark/${cls.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Mark Attendance
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>

          
          
          {/* Quick Actions */}
<section>
  <h4 className="font-display text-xl font-bold mb-6">
    Quick Actions
  </h4>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

    {/* Create Assignment */}
    {/*
    <Card
      hoverable
      className="cursor-pointer flex flex-col items-center justify-center text-center gap-3 py-8 group"
      onClick={() => navigate("/teacher/assignments/create")}
    >
      <div className="p-4 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition">
        <span className="material-symbols-outlined text-3xl">
          assignment_add
        </span>
      </div>

      <p className="text-sm font-bold text-slate-700 tracking-wide">
        CREATE ASSIGNMENT
      </p>
    </Card>
    */}


    {/* Mark Attendance */}
    <Card
      hoverable
      className="cursor-pointer flex flex-col items-center justify-center text-center gap-3 py-8 group"
      onClick={() => navigate("/teacher/attendance/mark")}
    >
      <div className="p-4 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition">
        <span className="material-symbols-outlined text-3xl">
          fact_check
        </span>
      </div>

      <p className="text-sm font-bold text-slate-700 tracking-wide">
        MARK ATTENDANCE
      </p>
    </Card>


    {/* Create Exam */}
    <Card
      hoverable
      className="cursor-pointer flex flex-col items-center justify-center text-center gap-3 py-8 group"
      onClick={() => navigate("/teacher/exams/create")}
    >
      <div className="p-4 rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition">
        <span className="material-symbols-outlined text-3xl">
          quiz
        </span>
      </div>

      <p className="text-sm font-bold text-slate-700 tracking-wide">
        CREATE EXAM
      </p>
    </Card>


    {/* Upload Material */}
    <Card
      hoverable
      className="cursor-pointer flex flex-col items-center justify-center text-center gap-3 py-8 group"
      onClick={() => navigate("/teacher/ai-tools")}
    >
      <div className="p-4 rounded-xl bg-blue-100 text-blue-700 group-hover:scale-110 transition">
        <span className="material-symbols-outlined text-3xl">
          upload_file
        </span>
      </div>

      <p className="text-sm font-bold text-slate-700 tracking-wide">
        UPLOAD MATERIAL
      </p>
    </Card>

  </div>
</section>
</div> 

        {/* Side Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/*
          AI Alert Panel (commented out)
          <div className="bg-gradient-to-br from-primary to-primary-container p-1 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-[calc(0.5rem-4px)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h4 className="font-display font-bold text-on-surface">AI Insights</h4>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                <span className="font-bold text-red-600">Critical Alert:</span> 3 students from <span className="font-bold">Grade 10-A</span> show declining quiz performance in the last 14 days.
              </p>
              <button
onClick={() => navigate("/teacher/analytics")}
className="w-full bg-blue-100 text-blue-700 py-2 rounded-md font-semibold"
>

View Students


</button>
            </div>
          </div>
          */}

          {/* Recent Activity Feed */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h4 className="font-display text-lg font-bold mb-6 text-on-surface">Recent Activity</h4>
            <div className="space-y-6">
              <div className="flex gap-4 relative">
                <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-12px)] bg-outline-variant"></div>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 z-10">
                  <span className="material-symbols-outlined text-white text-xs">check</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Physics Assignment Submitted</p>
                  <p className="text-xs text-on-surface-variant">15 students from Grade 11-B</p>
                  <p className="text-[10px] text-slate-400 mt-1">24 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-12px)] bg-outline-variant"></div>
                <div className="w-6 h-6 rounded-full bg-[#6b38d4] flex items-center justify-center shrink-0 z-10">
                  <span className="material-symbols-outlined text-white text-xs">mail</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">New Message from Admin</p>
                  <p className="text-xs text-on-surface-variant">Regarding semester schedule change</p>
                  <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-[#924700] flex items-center justify-center shrink-0 z-10">
                  <span className="material-symbols-outlined text-white text-xs">edit_calendar</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Exam Dates Confirmed</p>
                  <p className="text-xs text-on-surface-variant">Calculus Midterm set for Dec 12</p>
                  <p className="text-[10px] text-slate-400 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
            <Link to="/teacher/notifications" className="w-full mt-8 py-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
              View All Activity
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </section>

          {/* Student Spotlight */}
          <div className="relative overflow-hidden rounded-lg shadow-ambient aspect-[4/3] group" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
            <img alt="Class Spotlight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8I8LaH-fxwzUfYcklh-0WSH91hBgGJv97HDznz2ihqwjbWy9o6bZ2olprlFKl5PjSOP9PtWz02FrtzqYxTJA6LbuycXjRXfxiSvF_V90ha85ocjHmQJs_X-vp-xprHqsguPNKbZ8q5c-QUjBRHjd2MukIOkSKeghbznUzsSSB5QnUv70pdVSU4kuq9OxbxH-q8tLSB22Sdvvqgtn8Yf2vFHtsUrBsYkpXkJYd5yXsFY6FgUxR4OZkEt_ItOGfCzzlAweX2sQytg" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-6">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded w-fit mb-2">Class Spotlight</span>
              <h5 className="text-white font-display text-lg font-bold">Advanced Physics Lab</h5>
              <p className="text-white/80 text-sm">Achieved 100% submission rate today.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
