import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";

export default function AddTeacher() {
  const navigate = useNavigate();

  // STEP 1: Core User Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // STEP 2: Teacher Profile Fields
  const [employeeId, setEmployeeId] = useState("");
  const [qualification, setQualification] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [address, setAddress] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      // ==========================================
      // STEP 1: CREATE THE CORE IDENTITY (User)
      // ==========================================
      const userPayload = {
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName
      };

      const userResponse = await fetch(`${baseUrl}v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userPayload)
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        let errorMsg = "Failed to create core user identity.";
        if (typeof userData === "object") {
          errorMsg = Object.entries(userData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMsg);
      }

      // ==========================================
      // STEP 2: CREATE THE TEACHER PROFILE
      // ==========================================
      if (userData.id) {
        const profilePayload = {
          user: userData.id, // Linking the OneToOneField
          employee_id: employeeId,
          qualification: qualification,
          phone_number: phoneNumber,
          date_of_birth: dateOfBirth || null,
          joining_date: joiningDate || null,
          address: address
        };

        const profileResponse = await fetch(`${baseUrl}v1/profiles/teachers/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(profilePayload)
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          console.error("Profile Creation Error:", profileData);
          let profileErrorMsg = "User was created, but linking the Teacher Profile failed.";
          if (typeof profileData === "object") {
             profileErrorMsg += " " + Object.entries(profileData)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
              .join(" | ");
          }
          throw new Error(profileErrorMsg);
        }
      }

      setSuccessMsg("Teacher registration complete! Profile successfully established.");
      
      setTimeout(() => {
        navigate("/school-admin/teachers");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Teachers">
      <div className="max-w-5xl mx-auto p-8">
        
        {/* breadcrumb + go back */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-xs text-[#6b7280] font-medium tracking-wide uppercase">
            <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin")}>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin/teachers")}>Teachers</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0058be] font-bold">Add Teacher</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/school-admin/teachers")}
            className="flex items-center gap-2 px-4 py-2 text-[#0058be] font-semibold hover:bg-[#eff4ff] rounded-md border border-transparent hover:border-blue-100 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Go Back
          </button>
        </div>

        {/* heading */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">
            Onboard New Faculty
          </h1>
          <p className="text-[#6b7280]">
            Register a new educator into the academic system through a seamless identity and profile creation workflow.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">error</span>
             <div>
               <p className="font-bold text-sm">Onboarding Failed</p>
               <p className="text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">check_circle</span>
             <div>
               <p className="font-bold text-sm">Success!</p>
               <p className="text-sm mt-1">{successMsg}</p>
             </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* photo placeholder */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center shadow-sm">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full mx-auto border-4 border-dashed border-[#c2c6d6] flex items-center justify-center bg-[#f8f9ff] text-[#0058be]/20">
                    <span className="material-symbols-outlined text-6xl">add_a_photo</span>
                  </div>
                  <button type="button" className="absolute bottom-0 right-8 bg-[#0058be] text-white p-2.5 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
                <h3 className="font-semibold mt-6 text-slate-800">Teacher Portrait</h3>
                <p className="text-xs text-[#6b7280] mt-2 leading-relaxed">
                  Image uploads will be securely linked to the `TeacherProfile` model post-registration.
                </p>
              </div>

              {/* AI card */}
              <div className="bg-gradient-to-br from-[#6b38d4] to-[#8455ef] p-8 rounded-xl text-white relative overflow-hidden shadow-lg border border-[#8455ef]/50">
                <div className="absolute -right-6 -bottom-6 opacity-20">
                  <span className="material-symbols-outlined text-9xl">group_work</span>
                </div>
                <span className="material-symbols-outlined text-4xl mb-6 relative z-10 text-purple-200">
                  database
                </span>
                <h3 className="text-xl font-bold mb-2 relative z-10">Data Integrity</h3>
                <p className="text-sm text-purple-100 relative z-10 leading-relaxed">
                  Your backend structure cleanly separates authentication credentials from HR data (like Employee ID), ensuring secure, isolated query performance.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-8 space-y-6">

              {/* CORE IDENTITY */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                      <span className="material-symbols-outlined text-[#0058be]">badge</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Identity Credentials</h2>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Base User</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">First Name</label>
                    <input
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Last Name</label>
                    <input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Jenkins"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Professional Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="s.jenkins@academy.edu"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* TEACHER PROFILE */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
                      <span className="material-symbols-outlined text-[#6b38d4]">assignment_ind</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Faculty HR Record</h2>
                  </div>
                  <span className="text-xs font-mono bg-purple-50 text-[#6b38d4] px-2 py-1 rounded border border-purple-100">TeacherProfile</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Employee ID</label>
                    <input
                      required
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-204"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Highest Qualification</label>
                    <select 
                      value={qualification}
                      onChange={e => setQualification(e.target.value)}
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all font-medium text-slate-700"
                    >
                      <option value="">Select Degree Level</option>
                      <option value="Bachelors">Bachelor's Degree</option>
                      <option value="Masters">Master's Degree</option>
                      <option value="PhD">Doctorate (PhD)</option>
                      <option value="Diploma">Professional Diploma</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Phone Number</label>
                    <input
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Joining Date</label>
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={e => setJoiningDate(e.target.value)}
                      className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Residential Address</label>
                  <textarea
                    rows="2"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Full permanent address..."
                    className="w-full bg-[#f8f9ff] px-4 py-3 rounded-md outline-none focus:border-[#0058be]/40 border border-transparent focus:bg-white transition-all resize-none"
                  />
                </div>

              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => navigate("/school-admin/teachers")}
                  className="px-8 py-3 font-semibold text-[#6b7280] hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      Complete Onboarding
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}