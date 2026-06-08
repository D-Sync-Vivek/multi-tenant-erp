import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { calculateAttendance, calculateGPA } from "../../utils/calculations";
import { useStudent } from "../../context/StudentProvider";

export default function Dashboard() {
  const {profile: student, dashboard: studentData, enrollment: enroll, loading} = useStudent();

  if(loading || !studentData || !student){
    return <MainLayout> <div>Loading your academic data...</div></MainLayout>
  }
  
  const attendance = studentData?.attendance?.results || [];
  const attendanceRate = calculateAttendance(attendance);
  const grades = studentData?.grades?.results || [];
  const gpa = calculateGPA(grades);

  return (
    <MainLayout title="Dashboard">
      <div className="px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 text-white">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-extrabold headline-font mb-2">
              Welcome back, {student?.first_name}!
            </h2>
            <p className="text-primary-fixed opacity-90 text-lg">
              You are currently leading {enroll && enroll.class_level_name} with exceptional progress.
              Here&apos;s what&apos;s happening in your academic journey today.
            </p>
          </div>

          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-12 bottom-0 hidden lg:block">
            <span
              className="material-symbols-outlined text-[160px] opacity-10"
              data-icon="auto_awesome"
            >
              auto_awesome
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group transition-all hover:scale-[1.02] border">
            <div className="flex justify-between items-start">
              <span className="p-3 rounded-md bg-blue-50 text-blue-700">
                <span
                  className="material-symbols-outlined"
                  data-icon="calendar_today"
                >
                  calendar_today
                </span>
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                ON TRACK
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-on-surface-variant mb-1">
                Attendance Rate
              </p>
              <h3 className="text-4xl font-extrabold headline-font">
                {attendanceRate}
                <span className="text-2xl font-semibold">%</span>
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group transition-all hover:scale-[1.02] border">
            <div className="flex justify-between items-start">
              <span className="p-3 rounded-md bg-secondary-fixed text-secondary">
                <span className="material-symbols-outlined" data-icon="grade">
                  grade
                </span>
              </span>
              <span className="text-xs font-bold text-secondary bg-secondary-fixed px-2 py-1 rounded">
                EXCELLENT
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-on-surface-variant mb-1">
                Current GPA
              </p>
              <h3 className="text-4xl font-extrabold headline-font">
                {gpa}
                <span className="text-2xl font-semibold">/4.0</span>
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow flex flex-col justify-between group transition-all hover:scale-[1.02] border">
            <div className="flex justify-between items-start">
              <span className="p-3 rounded-md bg-green-50 text-green-700">
                <span
                  className="material-symbols-outlined"
                  data-icon="verified"
                >
                  verified
                </span>
              </span>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-on-surface-variant mb-1">
                Fees Status
              </p>
              <h3 className="text-4xl font-extrabold headline-font">Paid</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Next due: Oct 15, 2024
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold headline-font">
                  School Board
                </h3>
                <button className="text-primary text-sm font-semibold hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-surface-container-lowest rounded-md custom-shadow">
                  <div className="shrink-0 w-12 h-12 bg-tertiary-fixed text-tertiary rounded-md flex items-center justify-center">
                    <span
                      className="material-symbols-outlined"
                      data-icon="campaign"
                    >
                      campaign
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">
                      Annual Science Fair 2024 Registration
                    </h4>
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      The registration for the upcoming annual science fair is
                      now open for all students from Grades 9 to 12. Submit your
                      project abstracts by Friday.
                    </p>
                    <span className="text-[10px] font-bold text-outline-variant uppercase mt-2 block">
                      Post 2 hours ago &#x2022; Principal&apos;s Office
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-surface-container-lowest rounded-md custom-shadow">
                  <div className="shrink-0 w-12 h-12 bg-primary-fixed text-primary rounded-md flex items-center justify-center">
                    <span
                      className="material-symbols-outlined"
                      data-icon="event"
                    >
                      event
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">
                      Updated Library Hours for Finals Week
                    </h4>
                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      To support your preparation for finals, the main campus
                      library will remain open until 10:00 PM starting next
                      Monday.
                    </p>
                    <span className="text-[10px] font-bold text-outline-variant uppercase mt-2 block">
                      Post Yesterday &#x2022; Librarian
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold headline-font">
                  Upcoming Tasks
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold">
                    ALL
                  </button>
                  <button className="px-3 py-1 text-xs font-bold text-on-surface-variant">
                    ASSIGNMENTS
                  </button>
                  <button className="px-3 py-1 text-xs font-bold text-on-surface-variant">
                    QUIZZES
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-surface-container-lowest rounded-lg custom-shadow border-l-4 border-primary">
                  <div className="flex justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-primary uppercase">
                      Assignment
                    </span>
                    <span className="text-xs font-bold text-error">
                      Due tomorrow
                    </span>
                  </div>
                  <h4 className="font-bold mb-1">
                    Advanced Calculus: Derivations
                  </h4>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Complete problems 14 through 28 from Chapter 4.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        +12
                      </div>
                    </div>
                    <button className="text-xs font-bold py-2 px-4 bg-primary-container text-white rounded-md">
                      Open Task
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-surface-container-lowest rounded-lg custom-shadow border-l-4 border-secondary">
                  <div className="flex justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-secondary uppercase">
                      Quiz
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant">
                      Fri, 22 Sep
                    </span>
                  </div>
                  <h4 className="font-bold mb-1">Modern History: WW2 Impact</h4>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Focus on economic consequences and geopolitical shifts.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-on-surface-variant gap-1">
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="timer"
                      >
                        timer
                      </span>
                      45 mins
                    </div>
                    <button className="text-xs font-bold py-2 px-4 bg-surface-container-high text-secondary rounded-md">
                      Study Guide
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-6">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/student/help"
                  className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group"
                >
                  <span
                    className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform"
                    data-icon="support_agent"
                  >
                    support_agent
                  </span>
                  <span className="text-sm font-bold">Help Desk</span>
                </Link>
                <Link
                  to="/student/fees"
                  className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group"
                >
                  <span
                    className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform"
                    data-icon="account_balance_wallet"
                  >
                    account_balance_wallet
                  </span>
                  <span className="text-sm font-bold">Fees</span>
                </Link>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-6 custom-shadow">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-6">
                Recent Activity
              </h3>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-white">
                    <span
                      className="material-symbols-outlined text-green-700 text-xs"
                      data-icon="check_circle"
                      data-weight="fill"
                    >
                      check_circle
                    </span>
                  </div>
                  <p className="text-sm font-bold">
                    Grade Updated: Physics Lab
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    You received an{" "}
                    <span className="font-bold text-green-700">A</span> for the
                    Optics experiment.
                  </p>
                  <span className="text-[10px] text-outline-variant mt-1 block">
                    15 mins ago
                  </span>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white">
                    <span
                      className="material-symbols-outlined text-blue-700 text-xs"
                      data-icon="upload"
                      data-weight="fill"
                    >
                      upload
                    </span>
                  </div>
                  <p className="text-sm font-bold">Submission Received</p>
                  <p className="text-xs text-on-surface-variant">
                    English Literature Essay: &quot;Modernism in 1920s&quot;
                  </p>
                  <span className="text-[10px] text-outline-variant mt-1 block">
                    2 hours ago
                  </span>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-white">
                    <span
                      className="material-symbols-outlined text-amber-700 text-xs"
                      data-icon="info"
                      data-weight="fill"
                    >
                      info
                    </span>
                  </div>
                  <p className="text-sm font-bold">Attendance Marked</p>
                  <p className="text-xs text-on-surface-variant">
                    Present for Period 4: Computer Science.
                  </p>
                  <span className="text-[10px] text-outline-variant mt-1 block">
                    4 hours ago
                  </span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 border-t border-surface-container text-xs font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-tight">
                Show More History
              </button>
            </section>

            <div className="relative p-6 rounded-lg bg-surface-container-highest overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Active
              </div>
              <h4 className="text-sm font-medium text-on-surface-variant mb-4">
                Course Credits
              </h4>
              <div className="headline-sm text-2xl font-bold headline-font">
                24.0 / 30.0
              </div>
              <div className="w-full bg-white/30 h-1.5 rounded-full mt-4">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `80%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-3">
                You are on track to graduate early in June 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
