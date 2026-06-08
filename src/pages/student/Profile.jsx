import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { calculateAttendance, calculateGPA } from "../../utils/calculations";

export default function Profile() {
  const {
    profile: student,
    dashboard: studentData,
    enrollment: enroll,
    parents,
    loading,
  } = useStudent();

  if (loading)
    return (
      <MainLayout title="Student Profile">
        <div className="p-8">Loading Profile...</div>
      </MainLayout>
    );

  if (!student)
    return (
      <MainLayout title="Student Profile">
        <div className="p-8">No profile data found.</div>
      </MainLayout>
    );

  const attendance = studentData?.attendance?.results || [];
  const attendanceRate = calculateAttendance(attendance);
  const grades = studentData?.grades?.results || [];
  const gpa = calculateGPA(grades);

  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-50 shadow-xl overflow-hidden">
                {student.profile_picture ? (
                  <img
                    src={student.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-6xl">
                    person
                  </span>
                )}
              </div>
              <button className="absolute -bottom-3 -right-3 bg-primary-container text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                <span
                  className="material-symbols-outlined text-lg"
                  data-icon="photo_icon"
                >
                  photo_camera
                </span>
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 className="text-4xl font-extrabold font-headline text-on-surface">
                  {student.first_name} {student?.last_name}
                </h1>
                <span
                  className={`px-4 py-1.5 text-xs font-bold rounded-full self-center md:self-auto ${student.is_archived ? "bg-red-100 text-red-700" : "bg-surface-container-highest text-primary"}`}
                >
                  {student?.is_archived ? "ARCHIVED" : "ACTIVE STUDENT"}
                </span>
              </div>
              <p className="text-on-surface-variant font-medium text-lg mg-6">
                Enrolled via {enroll ? enroll.academic_year_name : "N/A"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:opacity-90 transition-all">
                  <span className="material-symbold-outlined" data-icon="edit">
                    edit
                  </span>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-1 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 flex items-center justify-center shadow-sm">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  GPA Score
                </p>
                <p className="text-3xl font-black text-on-surface font-headline">
                  {gpa}
                </p>
              </div>

              <div className="w-12 h-1/2 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                <span
                  className="matrial-symbols-outlined text-3xl"
                  data-icon="grade"
                >
                  grade
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Attendance
                </p>
                <p className="text-3xl font-black text-on-surface font-headline">
                  {attendanceRate} % 
                </p>
              </div>

              <div className="w-12 h-1/2 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-3xl"
                  data-icon="event_available"
                >
                  event_available
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <span
                className="material-symbols-outlined text-primary"
                data-icon="school"
              >
                school
              </span>
              <h2 className="text-xl font-bold font-headline">
                Academic Information
              </h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Class / Grade
                    </label>
                    <p>
                      {enroll
                        ? `${enroll.class_level_name} - ${enroll.section_name}`
                        : "Not Assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Enrollment Number
                    </label>
                    <p className="text-on-surface font-semibold text-lg mt-1">
                      {student.enrollment_number}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <label className="flex justify-between items-start">
                      Roll Number
                    </label>
                    <p className="text-on-surface font-semibold text-lg mt-1">
                      {enroll?.roll_number || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <span
                className="material-symbols-outlined text-primary"
                data-icon="contact_page"
              >
                contact_page
              </span>
              <h2 className="text-xl font-bold font-headline">
                Personal Contact
              </h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary"
                      data-icon="mail"
                    >
                      mail
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Email Address
                    </label>
                    <p className="text-on-surface font-semibold">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span
                      className="matrial-symbols-outlined text-primary"
                      data-icon="call"
                    >
                      call
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className="text-text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Residence
                    </label>
                    <p className="text-on-surface font-semibold">
                      {student.address || "Not provided "}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary"
                      data-icon="emergency_share"
                    >
                      emergency_share
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className="text-text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Emergency Contact
                    </label>
                  </div>
                  <p className="text-on-surface font-semibold">
                    {parents.length > 0
                      ? `${parents[0].parend_name} (${parents[0].relationship})`
                      : "No Contact Registered"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
