import React, { useEffect, useState } from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getMyProfile, getTeacherProfile } from "../../services/api";

const TeacherProfileManagement = () => {
  const [profileData, setProfileData] = useState(() => {
    try {
      const local = localStorage.getItem("user_data");
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  });
  const [teacherProfile, setTeacherProfile] = useState(null);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadTeacherProfile = async () => {
      setLoading(true);
      setError(null);
      
      // 1. Get initial teacherId if profileData is pre-populated
      let teacherId = profileData?.profiles?.teacher?.id || profileData?.identity?.id;

      // Define a helper to load the detailed teacher profile
      const fetchTeacherDetails = async (id) => {
        if (!id) return;
        try {
          const teacherData = await getTeacherProfile(id);
          if (isMounted) {
            setTeacherProfile(teacherData);
            // Pre-fill form fields
            setFirstName(teacherData.first_name || profileData?.identity?.first_name || "");
            setLastName(teacherData.last_name || profileData?.identity?.last_name || "");
            setPhone(teacherData.phone_number || "");
            console.log("[TeacherProfileManagement] Teacher profile data:", teacherData);
          }
        } catch (error) {
          console.error("[TeacherProfileManagement] Failed to load teacher details:", error);
          if (isMounted) {
            setError("Failed to load teacher profile details. Please refresh the page.");
          }
        }
      };

      // 2. Start fetching teacher details immediately if we already have the ID
      if (teacherId) {
        await fetchTeacherDetails(teacherId);
      }

      // 3. Fetch/revalidate the latest user profile in the background
      try {
        const currentUserProfile = await getMyProfile();
        if (isMounted) {
          setProfileData(currentUserProfile);
          localStorage.setItem('user_data', JSON.stringify(currentUserProfile));
          console.log("[TeacherProfileManagement] Revalidated current user profile:", currentUserProfile);
        }

        const newTeacherId = currentUserProfile?.profiles?.teacher?.id || currentUserProfile?.identity?.id;
        // If the teacher ID changed or wasn't loaded initially, fetch teacher details
        if (newTeacherId && newTeacherId !== teacherId) {
          await fetchTeacherDetails(newTeacherId);
        }
      } catch (error) {
        console.error("[TeacherProfileManagement] Failed to load current user profile:", error);
        if (isMounted && !teacherProfile) {
          setError("Failed to load user profile. Please check your connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTeacherProfile();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");
      const headers = { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      };

      const updatePromises = [];
      const identity = profileData?.identity;
      const teacherId = teacherProfile?.id;

      // 1. Update Core Identity (User) if available
      if (identity?.id) {
        const userPayload = { first_name: firstName, last_name: lastName };
        if (password && password.trim()) {
          userPayload.password = password;
        }

        updatePromises.push(
          fetch(`${baseUrl}/api/v1/users/${identity.id}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(userPayload)
          })
        );
      }

      // 2. Update Teacher Profile if available
      if (teacherId) {
        const profilePayload = {
          first_name: firstName,
          last_name: lastName,
          phone_number: phone
        };

        updatePromises.push(
          fetch(`${baseUrl}/api/v1/profiles/teachers/${teacherId}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(profilePayload)
          })
        );
      }

      if (updatePromises.length === 0) {
        throw new Error("No profile data available to update.");
      }

      const results = await Promise.allSettled(updatePromises);
      const failed = results.filter(res => res.status === 'rejected' || (res.value && !res.value.ok));

      if (failed.length > 0) {
        throw new Error("Failed to fully synchronize profile changes. Please try again.");
      }

      setSuccess("Profile updated and synchronized successfully!");
      setPassword(""); // Clear password field after save

      // Update local state to reflect changes
      if (teacherProfile) {
        setTeacherProfile(prev => ({ 
          ...prev, 
          first_name: firstName, 
          last_name: lastName, 
          phone_number: phone 
        }));
      }
      if (profileData?.identity) {
        setProfileData(prev => ({
          ...prev,
          identity: { ...prev.identity, first_name: firstName, last_name: lastName }
        }));
        localStorage.setItem('user_data', JSON.stringify({
          ...profileData,
          identity: { ...profileData.identity, first_name: firstName, last_name: lastName }
        }));
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const identity = profileData?.identity;
  const fullName = teacherProfile
    ? [teacherProfile.first_name, teacherProfile.last_name].filter(Boolean).join(" ") || "Teacher Profile"
    : [identity?.first_name, identity?.last_name].filter(Boolean).join(" ") || "Teacher Profile";
  const email = teacherProfile?.email || identity?.email || "";
  const phoneDisplay = teacherProfile?.phone_number || phone || "Not provided";
  const qualification = teacherProfile?.qualification || "Teacher";
  const employeeId = teacherProfile?.employee_id || "N/A";
  const schoolName = teacherProfile?.school_name || identity?.school_name || "Current School";
  const profileImage = teacherProfile?.profile_picture || "https://via.placeholder.com/400x400.png?text=Teacher+Profile";
  const specializations = teacherProfile?.qualification
    ? [teacherProfile.qualification]
    : [];

  const getInitials = (first, last) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    return "TR";
  };

  if (loading) {
    return (
      <MainLayout title="Teacher Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-[#0058be]">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="font-semibold tracking-wide">Loading Profile Data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !teacherProfile && !profileData) {
    return (
      <MainLayout title="Teacher Profile">
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-red-100 text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-4">gpp_bad</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Resolution Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Teacher Profile">
      <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
        
        {/* Page Title */}
        <div className="mb-6 pl-4 md:pl-0">
          <p className="text-[#0058be] font-bold text-sm tracking-widest uppercase mb-1">Account Management</p>
          <h2 className="text-4xl font-extrabold font-display tracking-tight text-slate-800">My Profile</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
            <span className="material-symbols-outlined">error</span>
            <div>
              <p className="font-bold text-sm">Action Required</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex gap-3 shadow-sm">
            <span className="material-symbols-outlined">check_circle</span>
            <div>
              <p className="font-bold text-sm">Success!</p>
              <p className="text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Profile Identity Card */}
        <section className="bg-white rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden shadow-sm border border-gray-100">
          {/* Subtle Background Texture */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0058be]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative group mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-blue-50 flex items-center justify-center text-[#0058be]">
              {profileImage && profileImage !== "https://via.placeholder.com/400x400.png?text=Teacher+Profile" ? (
                <img alt={fullName} className="w-full h-full object-cover" src={profileImage} />
              ) : (
                <span className="text-5xl font-bold">{getInitials(teacherProfile?.first_name, teacherProfile?.last_name)}</span>
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-[#0058be] text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-transform outline-none border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg block">photo_camera</span>
            </button>
          </div>
          
          <div className="flex-1 z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-3xl font-bold font-display text-slate-800 mb-1">{fullName}</h3>
                <p className="text-[#0058be] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm block">verified</span>
                  {qualification}
                </p>
              </div>
              <span className="bg-[#eff4ff] border border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold text-[#0058be] uppercase tracking-wider shadow-sm">Active Status</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#0058be] shrink-0 border border-gray-100">
                  <span className="material-symbols-outlined block">mail</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 font-medium">Institutional Email</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#0058be] shrink-0 border border-gray-100">
                  <span className="material-symbols-outlined block">call</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                  <p className="text-sm font-semibold text-slate-800">{phoneDisplay}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#0058be] shrink-0 border border-gray-100">
                  <span className="material-symbols-outlined block">badge</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Employee ID</p>
                  <p className="text-sm font-semibold text-slate-800 font-mono">{employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#0058be] shrink-0 border border-gray-100">
                  <span className="material-symbols-outlined block">school</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">School</p>
                  <p className="text-sm font-semibold text-slate-800">{schoolName}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Core Specializations</p>
              <div className="flex flex-wrap gap-2">
                {specializations.length > 0 ? (
                  specializations.map((item) => (
                    <span key={item} className="px-3 py-1 bg-gray-50 rounded-md text-xs font-semibold text-[#0058be] border border-gray-100">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-gray-50 rounded-md text-xs font-semibold text-gray-500 border border-gray-100">
                    No specialization added
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Edit Profile Section */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-[#0058be] block">edit_note</span>
            <h4 className="text-xl font-bold font-display text-slate-800">Update Profile Information</h4>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">First Name</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] border border-transparent rounded-md px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white transition-all outline-none" 
                    placeholder="Enter first name" 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">person</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Last Name</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] border border-transparent rounded-md px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white transition-all outline-none" 
                    placeholder="Enter last name" 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">person</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Verified Contact Phone</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] border border-transparent rounded-md px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white transition-all outline-none" 
                    placeholder="Enter phone number" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">call</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Update Password</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] border border-transparent rounded-md px-4 py-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white transition-all outline-none" 
                    placeholder="Enter new password (optional)" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">lock</span>
                </div>
                <p className="text-[10px] text-gray-500 ml-1 font-medium">Leave blank if you do not wish to change your password.</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3 border border-amber-100 md:col-span-2">
                <span className="material-symbols-outlined text-[#924700] text-xl block">auto_awesome</span>
                <div>
                  <p className="text-xs font-bold text-[#924700] uppercase">AI Security Insight</p>
                  <p className="text-xs text-amber-900 mt-1">Profile data is loaded from your current teacher account. Update password details only after confirming with your admin policy.</p>
                </div>
              </div>

            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-4 mt-12 pt-8 border-t border-gray-100">
              <button 
                className="w-full sm:w-auto px-8 py-3.5 rounded-md text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-slate-800 transition-colors outline-none border border-transparent cursor-pointer" 
                type="button"
                onClick={() => {
                  setFirstName(teacherProfile?.first_name || identity?.first_name || "");
                  setLastName(teacherProfile?.last_name || identity?.last_name || "");
                  setPhone(teacherProfile?.phone_number || "");
                  setPassword("");
                  setError(null);
                  setSuccess(null);
                }}
              >
                Reset Changes
              </button>
              <button 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-md text-sm font-bold text-white bg-gradient-to-r from-[#0058be] to-[#2170e4] shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none cursor-pointer disabled:opacity-70 disabled:scale-100" 
                type="submit"
                disabled={saving}
              >
                {saving ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                {saving ? "Synchronizing..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </section>

        {/* Footnote Information */}
        <div className="flex justify-center items-center gap-6 py-4 flex-wrap">
          <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm block">verified_user</span>
            Data encrypted with AES-256
          </p>
          <div className="hidden sm:block h-1 w-1 bg-gray-300 rounded-full"></div>
          <p className="text-xs text-gray-500 font-medium">Teacher profile ID: {teacherProfile?.id || identity?.id || "Loading..."}</p>
        </div>

      </div>
    </MainLayout>
  );
};

export default TeacherProfileManagement;