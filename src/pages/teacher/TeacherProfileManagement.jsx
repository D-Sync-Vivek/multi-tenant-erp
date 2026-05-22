import React, { useEffect, useState } from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getMyProfile, getTeacherProfile } from "../../services/api";

const TeacherProfileManagement = () => {
  const [profileData, setProfileData] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadTeacherProfile = async () => {
      try {
        const currentUserProfile = await getMyProfile();
        const teacherId = currentUserProfile?.profiles?.teacher?.id || currentUserProfile?.identity?.id;

        if (isMounted) {
          setProfileData(currentUserProfile);
          console.log("[TeacherProfileManagement] Current user profile:", currentUserProfile);
        }

        if (!teacherId) {
          throw new Error("Teacher profile id not found on current user profile.");
        }

        const teacherData = await getTeacherProfile(teacherId);

        if (isMounted) {
          setTeacherProfile(teacherData);
          console.log("[TeacherProfileManagement] Teacher profile data:", teacherData);
        }
      } catch (error) {
        if (isMounted) {
          console.error("[TeacherProfileManagement] Failed to load teacher profile:", error);
        }
      }
    };

    loadTeacherProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const identity = profileData?.identity;
  const fullName = teacherProfile
    ? [teacherProfile.first_name, teacherProfile.last_name].filter(Boolean).join(" ") || "Teacher Profile"
    : [identity?.first_name, identity?.last_name].filter(Boolean).join(" ") || "Teacher Profile";
  const email = teacherProfile?.email || identity?.email || "";
  const phone = teacherProfile?.phone_number || "Not provided";
  const qualification = teacherProfile?.qualification || "Teacher";
  const employeeId = teacherProfile?.employee_id || "N/A";
  const schoolName = teacherProfile?.school_name || identity?.school_name || "Current School";
  const profileImage = teacherProfile?.profile_picture || "https://via.placeholder.com/400x400.png?text=Teacher+Profile";
  const specializations = teacherProfile?.qualification
    ? [teacherProfile.qualification]
    : [];

  return (
    <MainLayout title="Teacher Profile">
      <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
        
        {/* Page Title */}
        <div className="mb-6 pl-4 md:pl-0">
          <p className="text-primary font-bold text-sm tracking-widest uppercase mb-1">Account Management</p>
          <h2 className="text-4xl font-extrabold font-display tracking-tight text-on-surface">Teacher Profile</h2>
        </div>

        {/* Profile Identity Card */}
        <section className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden shadow-sm border border-outline-variant/10">
          {/* Subtle Background Texture */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative group mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg border-4 border-white">
              <img alt={fullName} className="w-full h-full object-cover" src={profileImage} />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-transform outline-none border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg block">photo_camera</span>
            </button>
          </div>
          
          <div className="flex-1 z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-3xl font-bold font-display text-on-surface mb-1">{fullName}</h3>
                <p className="text-primary font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm block">verified</span>
                  {qualification}
                </p>
              </div>
              <span className="bg-white/80 backdrop-blur-md border border-outline-variant/10 px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-wider shadow-sm">Active Status</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined block">mail</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Institutional Email</p>
                  <p className="text-sm font-semibold text-on-surface break-all">{email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined block">call</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Contact Number</p>
                  <p className="text-sm font-semibold text-on-surface">{phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined block">badge</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Employee ID</p>
                  <p className="text-sm font-semibold text-on-surface">{employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined block">school</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">School</p>
                  <p className="text-sm font-semibold text-on-surface">{schoolName}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-outline-variant/15">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Core Specializations</p>
              <div className="flex flex-wrap gap-2">
                {specializations.length > 0 ? (
                  specializations.map((item) => (
                    <span key={item} className="px-3 py-1 bg-surface-container rounded-md text-xs font-semibold text-primary">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-semibold text-primary">
                    No specialization added
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Edit Profile Section */}
        <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary block">edit_note</span>
            <h4 className="text-xl font-bold font-display text-on-surface">Update Profile Information</h4>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Input Field: Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Full Academic Name</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="Enter full name" type="text" defaultValue={fullName} />
                  <span className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-primary material-symbols-outlined text-sm block">person</span>
                </div>
              </div>
              
              {/* Input Field: Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Verified Contact Phone</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="Enter phone number" type="tel" defaultValue={phone} />
                  <span className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-primary material-symbols-outlined text-sm block">call</span>
                </div>
              </div>
              
              {/* Input Field: Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Update Password</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="Enter new password" type="password" defaultValue="" />
                  <span className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-primary material-symbols-outlined text-sm block">lock</span>
                </div>
                <p className="text-[10px] text-on-surface-variant ml-1 font-medium">Must contain at least 8 characters with a mix of symbols and numbers.</p>
              </div>
              
              {/* Tertiary AI Insight Placeholder */}
              <div className="bg-[#ffdcc6]/30 p-4 rounded-xl flex items-start gap-3 border border-[#ffb786]/20">
                <span className="material-symbols-outlined text-[#924700] text-xl block">auto_awesome</span>
                <div>
                  <p className="text-xs font-bold text-[#723600] uppercase">AI Security Insight</p>
                  <p className="text-xs text-[#311400] mt-1">Profile data is loaded from your current teacher account. Update password details only after confirming with your admin policy.</p>
                </div>
              </div>

            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-outline-variant/15">
              <button className="px-8 py-3 rounded-md text-sm font-bold text-primary hover:bg-surface-variant transition-colors outline-none border-none cursor-pointer bg-transparent" type="button">
                Cancel
              </button>
              <button className="px-10 py-3 rounded-md text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none cursor-pointer" type="button">
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Footnote Information */}
        <div className="flex justify-center items-center gap-6 py-4 flex-wrap">
          <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm block">verified_user</span>
            Data encrypted with AES-256
          </p>
          <div className="hidden sm:block h-1 w-1 bg-outline-variant rounded-full"></div>
          <p className="text-xs text-on-surface-variant font-medium">Teacher profile ID: {teacherProfile?.id || profileData?.identity?.id || "Loading..."}</p>
        </div>

      </div>
    </MainLayout>
  );
};

export default TeacherProfileManagement;
