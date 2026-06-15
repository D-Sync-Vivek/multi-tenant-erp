import React from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { calculateAttendance } from "../../utils/calculations";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-8 bg-white rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
            <Skeleton className="w-36 h-36 md:w-40 md:h-40 rounded-2xl shrink-0" />
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <Skeleton className="w-56 h-8" />
                <Skeleton className="w-28 h-6 rounded-full" />
              </div>
              <Skeleton className="w-40 h-4 mb-5" />
              <Skeleton className="w-32 h-10 rounded-xl" />
            </div>
          </div>
          <div className="md:col-span-4 grid grid-cols-1 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div>
                  <Skeleton className="w-20 h-3 mb-2" />
                  <Skeleton className="w-14 h-7" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <section key={i} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-40 h-5" />
              </div>
              <div className="bg-white rounded-xl px-4 py-3 space-y-5 shadow-sm">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="w-20 h-3" />
                      <Skeleton className="w-40 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default function Profile() {
  const {
    profile: student,
    dashboard: studentData,
    enrollment: enroll,
    parents,
    loading,
  } = useStudent();

  if (loading) return <ProfileSkeleton />;

  if (!student)
    return (
      <MainLayout title="Student Profile">
        <div className="p-4 md:p-6">No profile data found.</div>
      </MainLayout>
    );

  const attendance     = studentData?.attendance?.results || [];
  const attendanceRate = calculateAttendance(attendance);
  const grades         = studentData?.grades?.results || [];

  const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained || 0), 0);
  const totalMax   = grades.reduce((sum, g) => sum + parseFloat(g.max_marks || 1), 0);
  const percentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : "0.0";

  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

          {/* Left Card - Profile Info */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm border border-outline-variant/10">
            <div className="relative group shrink-0">
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-50 shadow-xl overflow-hidden">
                {student.profile_picture ? (
                  <img src={student.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl">person</span>
                )}
              </div>
              <button className="absolute -bottom-3 -right-3 bg-primary-container text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold font-headline text-on-surface leading-tight break-words">
                  {student.first_name} {student?.last_name}
                </h1>
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full self-center md:self-auto whitespace-nowrap ${
                  student.is_archived ? "bg-red-100 text-red-700" : "bg-surface-container-highest text-primary"
                }`}>
                  {student?.is_archived ? "ARCHIVED" : "ACTIVE STUDENT"}
                </span>
              </div>
              <p className="text-on-surface-variant font-medium text-xs mb-4">
                Enrolled via {enroll ? enroll.academic_year_name : "N/A"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Stats Cards */}
          <div className="md:col-span-4 grid grid-cols-1 gap-4">

            {/* Overall Score */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">grade</span>
                </span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant">Overall Score</p>
                  <p className="text-2xl font-bold font-headline text-on-surface leading-tight">
                    {percentage}<span className="text-sm font-semibold">%</span>
                  </p>
                </div>
              </div>
              <div className="w-14 flex flex-col items-end gap-1 flex-shrink-0">
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-on-surface-variant">{percentage}% of 100%</span>
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">event_available</span>
                </span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant">Attendance</p>
                  <p className="text-2xl font-bold font-headline text-on-surface leading-tight">
                    {attendanceRate}<span className="text-sm font-semibold">%</span>
                  </p>
                  <p className="text-[9px] text-on-surface-variant italic">
                    {attendanceRate >= 75
                      ? `${Math.abs(attendanceRate - 75)}% above limit`
                      : `${Math.abs(attendanceRate - 75)}% below limit`}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full self-start whitespace-nowrap flex-shrink-0 ${
                attendanceRate >= 75 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
              }`}>
                {attendanceRate >= 75 ? "Met" : "Not Met"}
              </span>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Academic Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary text-base">school</span>
              <h2 className="text-sm font-bold font-headline text-on-surface">Academic Information</h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="px-4 py-3 space-y-5">
                <div>
                  <label className="text-[10px] font-medium text-on-surface-variant">Class / Grade</label>
                  <p className="text-on-surface font-semibold text-sm mt-0.5">
                    {enroll ? `${enroll.class_level_name} - ${enroll.section_name}` : "Not Assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-on-surface-variant">Enrollment Number</label>
                  <p className="text-on-surface font-semibold text-sm mt-0.5 break-all">{student.enrollment_number}</p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-on-surface-variant">Roll Number</label>
                  <p className="text-on-surface font-semibold text-sm mt-0.5">{enroll?.roll_number || "Unassigned"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Personal Contact */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary text-base">contact_page</span>
              <h2 className="text-sm font-bold font-headline text-on-surface">Personal Contact</h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="px-4 py-3 space-y-5">

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">mail</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-medium text-on-surface-variant">Email Address</label>
                    <p className="text-on-surface font-semibold text-sm break-all mt-0.5">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">call</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-medium text-on-surface-variant">Residence</label>
                    <p className="text-on-surface font-semibold text-sm break-words mt-0.5">{student.address || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">emergency_share</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-medium text-on-surface-variant">Emergency Contact</label>
                    <p className="text-on-surface font-semibold text-sm break-words mt-0.5">
                      {parents.length > 0
                        ? `${parents[0].parent_name} (${parents[0].relationship})`
                        : "No Contact Registered"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>
    </MainLayout>
  );
}