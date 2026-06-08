import React, { useState, useEffect, use } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";


export default function Subjects() {
  const {academic, dashboard, loading} = useStudent();

  if (loading) return <MainLayout title="My Subjects"><div>Loading...</div></MainLayout>;

  const subjects = academic?.subs || [];
  const grades = dashboard?.grades?.results || [];
  const academicYears = academic?.years || [];

  return (
    <MainLayout title="The Academic Architect">
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              My Subjects
            </h2>
            <p className="text-on-surface-variant mt-1 font-medium">
              Manage your academic curriculum and performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-outline px-1">
                Academic Year
              </label>
              <select className="bg-surface-container-lowest border-none rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:ring-primary">
                {academicYears.map((data) => (
                    <option key={data.id}>{data.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

       <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase">Subject Name</th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {subjects.map((subject) => {
                const gradeInfo = grades.find(g => g.subject === subject.id);
                const percentage = gradeInfo ? (gradeInfo.marks_obtained / gradeInfo.max_marks) * 100 : 0;

                return (
                  <tr key={subject.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-6">
                      <p className="font-bold">{subject.name}</p>
                      <p className="text-xs text-outline">{subject.code}</p>
                    </td>
                    <td className="px-6 py-6 font-bold text-primary">
                      {gradeInfo ? `${gradeInfo.marks_obtained}` : "N/A"}
                    </td>
                    <td className="px-6 py-6">
                      <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-primary-container text-on-primary-container p-8 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[240px]">
            <div className="relative z-10">
              <span
                className="material-symbols-outlined text-4xl mb-4"
                data-icon="auto_awesome"
              >
                auto_awesome
              </span>
              <h3 className="text-2xl font-headline font-extrabold leading-tight">
                Your semester performance is <br />
                up by 12% from last year.
              </h3>
              <p className="mt-2 text-primary-fixed opacity-90 text-sm max-w-md">
                Great job! You&apos;re showing significant improvement in STEM
                subjects. Your current GPA projection is 3.85.
              </p>
            </div>
            <div className="relative z-10 mt-6">
              <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-md text-sm font-bold hover:bg-white/30 transition-all">
                View Detailed Analysis
              </button>
            </div>

            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="bg-surface-container-low p-6 rounded-lg border-l-4 border-tertiary">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">
              Upcoming Subject Tasks
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="bg-white w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-tertiary shadow-sm">
                  <span
                    className="material-symbols-outlined text-xl"
                    data-icon="lab_profile"
                  >
                    lab_profile
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Physics Lab Report
                  </p>
                  <p className="text-[10px] text-outline">Due in 2 days</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-white w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-secondary shadow-sm">
                  <span
                    className="material-symbols-outlined text-xl"
                    data-icon="history_edu"
                  >
                    history_edu
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Chem Quiz 4 Prep
                  </p>
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
