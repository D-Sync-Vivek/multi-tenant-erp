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
  const attendanceRate = Number(calculateAttendance(attendance));
  const grades = studentData?.grades?.results || [];
  const gpa = calculateGPA(grades);
  
  const attendanceStatus =
    attendanceRate >= 80
      ? {
          label: "ON TRACK",
          className: "text-green-800 bg-green-100",
        }
      : attendanceRate >= 65
        ? {
            label: "SATISFACTORY",
            className: "text-amber-800 bg-amber-100",
          }
        : {
            label: "AT RISK",
            className: "text-red-800 bg-red-100",
          };

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
              <span className={`text-xs font-bold px-2 py-1 rounded ${attendanceStatus.className}`}>{attendanceStatus.label}</span>
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
            {/* School Board section commented out */}
            {/* Upcoming Tasks section commented out */}
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