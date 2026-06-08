import React, { useState, useEffect, use } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";

export default function GradeCard() {
 const {dashboard, academic, loading } = useStudent();

  // filter states
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");

  if (loading)
    return (
      <MainLayout title="Grades and Report Card">
        <div className="p-8">Loading grades...</div>
      </MainLayout>
    );

  const grades = dashboard?.grades?.results || [];
  const exams = dashboard?.exams?.results || [];
  const subjects = academic?.subs || [];

  //   ------- Calculations -------

  //   1. Calculate GPA
  let gpa = 0.0;
  if (grades.length > 0) {
    const totalMarks = grades.reduce(
      (sum, g) => sum + parseFloat(g.marks_obtained),
      0,
    );
    const totalMax = grades.reduce(
      (sum, g) => sum + parseFloat(g.max_marks),
      0,
    );

    gpa = totalMarks > 0 ? ((totalMarks / totalMax) * 4.0).toFixed(2) : 0.0;
  }

  //   2. Most recend past exam.
  const pastExams = exams
    .filter((e) => new Date(e.end_date) < new Date())
    .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  const latestExam = pastExams.length > 0 ? pastExams[0] : null;

  //   3. Helper: Convert percentage to Letter Grade & colors
  const getGradeDetails = (obtained, max) => {
    const percentage = (obtained / max) * 100;
    if (percentage >= 90)
      return { letter: "A+", color: "bg-greed-100 text-green-700" };
    if (percentage >= 80)
      return { letter: "A", color: "bg-blue-100 text-blue-700" };
    if (percentage >= 70)
      return { letter: "B+", color: "bg-yellow-100 text-yellow-700" };
    if (percentage >= 60)
      return { letter: "B", color: "bg-orange-100 text-orange-700" };
    return { letter: "C", color: "bg-red-100 text-red-700" };
  };

  //   4. Helper: Dynamic Icons based on subject name.
  const getSubjectIcon = (name) => {
    const lowerName = name?.toLowerCase();
    if (lowerName?.includes("math"))
      return { icon: "calculate", bg: "bg-blue-50 text-blue-600" };
    if (lowerName?.includes("phys"))
      return { icon: "rocket_launch", bg: "bg-purple-50 text-purple-600" };
    if (lowerName?.includes("comp") || lowerName?.includes("code"))
      return { icon: "code", bg: "bg-orange-50 text-orange-600" };
    if (lowerName?.includes("eng") || lowerName?.includes("lit"))
      return {
        icon: "history_edu",
        bg: "bg-indigo-50 text-indigo-600",
      };
    return { icon: "menu_book", bg: "bg-slate-100 text-slate-600" };
  };

  // -------- Filtering  --------
  const filteredGrades = grades.filter((grade) => {
    const matchesSubject =
      selectedSubject === "all" || grade.subject === selectedSubject;
    const matchesExam = selectedExam === "all" || grade.exam === selectedExam;
    return matchesSubject && matchesExam;
  });

  return (
    <MainLayout title="Grades & Report Card">
      <section className="p-8">
        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 primary-gradient rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-lg font-headline font-semibold opacity-90">
                  Academic Perfomance Summary
                </h3>
                <p className="text-4xl font-headline font-extrabold mt-2 tracking-tight">
                  GPA {gpa} / 4.0
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-2.5 rounded-md text-sm font-semibold transition-all">
                  View Analytics
                </button>
                <button className="bg-white text-blue-700 px-6 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    download
                  </span>
                  Download Report Card
                </button>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div>
              <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                Term Progress
              </span>
              <h4 className="text-2xl font-headline font-bold text-on-surface mt-2">
                {latestExam ? latestExam.name : "No Exams Yet"}{" "}
              </h4>
              <p className="text-sm text-on-surface-variant">
                Completed on{" "}
                {latestExam
                  ? new Date(latestExam.end_date).toLocaleDateString()
                  : "--"}
              </p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: latestExam ? `100%` : `0%` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Completion
                </span>
                <span className="text-xs font-bold text-secondary">
                  {latestExam ? "100%" : "0%"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: `'FILL' 1` }}
                >
                  auto_awesome
                </span>
                AI Insight: Excelling in STEM
              </span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-headline font-bold text-on-surface">
              Subject-wise Breakdown
            </h3>
            <div className="flex items-center gap-3">
              {/* Dynamic Subject Dropdown */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-surface-container-low border-none rounded-md text-sm py-2 px-4 focus:ring-2 focus:ring-surface-tint"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              {/* Dynamic Exam Dropdown */}
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-surface-container-low border-none rounded-md text-sm py-2 px-4 focus:ring-2 focus:ring-surface-container-lowest"
              >
                <option value="all">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>

              <button className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">
                  filter_list
                </span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Marks Obtained
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Teacher Remarks
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredGrades.map((grade) => {
                  const gradeDetails = getGradeDetails(
                    grade.marks_obtained,
                    grade.max_marks,
                  );
                  const iconDetails = getSubjectIcon(grade.subject_name);

                  return (
                    <tr
                      key={grade.id}
                      className="hover:bg-surface-container-low/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconDetails.bg}`}
                          >
                            <span className="material-symbols-outlined">
                              {iconDetails.icon}
                            </span>
                          </div>
                          <span className="font-bold text-on-surface">
                            {grade.subject_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-on-surface-variant font-medium">
                        {grade.exam_name}
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-bold text-on-surface">
                          {grade.marks_obtained} / {grade.max_marks}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`px-3 py-1 rounded-md font-bold text-xs uppercase tracking-widest ${gradeDetails.color}`}
                        >
                          {gradeDetails.letter}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-on-surface-variant italic leading-relaxed max-w-xs">
                        &quot;{grade.remarks || "No remarks provided."}&quot;
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="text-blue-700 hover:text-blue-900 font-semibold text-sm hover:underline transition-all">
                          View detailed feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredGrades.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-on-surface-variant"
                    >
                      No grades found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-surface-container-low/20 border-t border-surface-container flex justify-between items-center rounded-b-xl">
            <p className="text-xs font-medium text-on-surface-variant italic">
              Showing {filteredGrades.length} subjects graded.
            </p>
          </div>
        </div>
      </section>

      {/* Footer  */}
      <footer className="px-9 pb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center bg-blue-50/50 p-6 rounded-2xl border border-blue-100/30">
          <div className="flex-1">
            <h4 className="font-headline font-bold text-on-surface">
              Request Academic Counseling
            </h4>
            <p className="text-sm text-on-surface-variant">
              Not satisfied with your results? Schedule a 15-min call with your
              academic advisor to discuss a roadmap.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-sm hover:bg-blue-100 transition-all border border-blue-100">
              Schedule Meeting
            </button>
            <button className="px-6 py-3 primary-gradient text-white font-bold rounded-lg shadow-md hover:scale-[1.02] transition-all">
              Download Full PDF Report
            </button>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}
