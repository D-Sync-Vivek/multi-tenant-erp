import React, { useEffect } from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";

const TeacherProfileManagement = () => {
  const teacherProfileData = {
    name: 'Dr. Elena Vance',
    role: 'Senior Faculty, Science Dept',
    status: 'Active Status',
    email: 'elena.vance@academy.edu',
    phone: '+1 (555) 234-8901',
    specializations: ['Advanced Physics', 'Quantum Mechanics', 'Applied Mathematics'],
    lastLogin: 'Oct 24, 2023 - 09:42 AM',
    securityInsight:
      'Your password was last changed 142 days ago. We recommend updating it quarterly for optimal account security.',
  };

  useEffect(() => {
    console.log('Teacher profile data:', teacherProfileData);
  }, []);

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
              <img alt="Dr. Elena Vance" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkuK-jdWvB-zf-u1uPcZviTfxYMGfB7H0zz4d_cFTyaZTOPTD2OLKZmoD_P8mVB4GhRyL7oGBS5Qq_-rVWztF0KX261-0d8HVYjlheHza5qDdge6rgFpO7k6c7JmESTL4SvKN16D-iKgS0omkPdeg7I-tHbMtsMgVPcd64HJSKo5HIzgulwfE4_4tj7viKWeyY7ka9bi9yI98a6pmNMaSl30Y0wD8pbI04tTE9f0fcI6Clk5WYsPP2RqvFk7jLIdRAX-607wCNlg" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-transform outline-none border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg block">photo_camera</span>
            </button>
          </div>
          
          <div className="flex-1 z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-3xl font-bold font-display text-on-surface mb-1">Dr. Elena Vance</h3>
                <p className="text-primary font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm block">verified</span>
                  Senior Faculty, Science Dept
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
                  <p className="text-sm font-semibold text-on-surface break-all">elena.vance@academy.edu</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined block">call</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Contact Number</p>
                  <p className="text-sm font-semibold text-on-surface">+1 (555) 234-8901</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-outline-variant/15">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Core Specializations</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-semibold text-primary">Advanced Physics</span>
                <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-semibold text-primary">Quantum Mechanics</span>
                <span className="px-3 py-1 bg-surface-container rounded-md text-xs font-semibold text-primary">Applied Mathematics</span>
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
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="Enter full name" type="text" defaultValue="Dr. Elena Vance" />
                  <span className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-primary material-symbols-outlined text-sm block">person</span>
                </div>
              </div>
              
              {/* Input Field: Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Verified Contact Phone</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="Enter phone number" type="tel" defaultValue="+1 (555) 234-8901" />
                  <span className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-primary material-symbols-outlined text-sm block">call</span>
                </div>
              </div>
              
              {/* Input Field: Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">Update Password</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-on-surface font-medium focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="Enter new password" type="password" defaultValue="••••••••••••" />
                  <span className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-primary material-symbols-outlined text-sm block">lock</span>
                </div>
                <p className="text-[10px] text-on-surface-variant ml-1 font-medium">Must contain at least 8 characters with a mix of symbols and numbers.</p>
              </div>
              
              {/* Tertiary AI Insight Placeholder */}
              <div className="bg-[#ffdcc6]/30 p-4 rounded-xl flex items-start gap-3 border border-[#ffb786]/20">
                <span className="material-symbols-outlined text-[#924700] text-xl block">auto_awesome</span>
                <div>
                  <p className="text-xs font-bold text-[#723600] uppercase">AI Security Insight</p>
                  <p className="text-xs text-[#311400] mt-1">Your password was last changed 142 days ago. We recommend updating it quarterly for optimal account security.</p>
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
          <p className="text-xs text-on-surface-variant font-medium">Last Login: Oct 24, 2023 - 09:42 AM</p>
        </div>

      </div>
    </MainLayout>
  );
};

export default TeacherProfileManagement;
