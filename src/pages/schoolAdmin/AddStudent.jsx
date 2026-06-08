import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";

export default function AddStudent() {
  const navigate = useNavigate();

  // STEP 1: Core User Model Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // STEP 2: Student Profile Fields
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");

  // UI State
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
      // STEP 2: CREATE THE STUDENT PROFILE
      // ==========================================
      if (userData.id) {
        const profilePayload = {
          user: userData.id, // Linking the OneToOneField
          enrollment_number: enrollmentNumber,
          date_of_birth: dateOfBirth || null, // Handle empty dates safely for Django DateField
          phone_number: phoneNumber,
          blood_group: bloodGroup,
          address: address,
          is_archived: false
        };

        const profileResponse = await fetch(`${baseUrl}v1/profiles/students/`, {
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
          
          let profileErrorMsg = "Core user was created, but failed to link the Student Profile.";
          if (typeof profileData === "object") {
             profileErrorMsg += " " + Object.entries(profileData)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
              .join(" | ");
          }
          throw new Error(profileErrorMsg);
        }
      }

      setSuccessMsg("Student registration complete! Identity and profile linked successfully.");
      
      // Delay navigation so they can see the success message
      setTimeout(() => {
        navigate("/school-admin/students");
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
    <SchoolLayout title="Student Registration">
      <div className="max-w-6xl mx-auto space-y-8 px-8 py-10">
        
        {/* breadcrumb */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">
              Register New Student
            </h1>
            <p className="text-[#6b7280] mt-1 max-w-2xl text-sm">
              This two-step process automatically creates the authentication identity and links the extended student profile in your database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/school-admin/students")}
            className="flex items-center gap-2 px-4 py-2 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0058be] font-semibold rounded-md transition border border-blue-100"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Directory
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">error</span>
             <div>
               <p className="font-bold text-sm">API Error Occurred</p>
               <p className="text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex gap-3 shadow-sm">
             <span className="material-symbols-outlined">check_circle</span>
             <div>
               <p className="font-bold text-sm">Success!</p>
               <p className="text-sm mt-1">{successMsg}</p>
             </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">

              {/* CORE IDENTITY (User Model) */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[#0058be]">badge</span>
                     Step 1: Core Identity
                  </h3>
                  <span className="text-xs font-mono bg-blue-50 text-[#0058be] px-2 py-1 rounded border border-blue-100">User Model</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      First Name
                    </label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Julian"
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Last Name (Optional)
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Alexander"
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@academy.edu"
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Temporary Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* STUDENT PROFILE (StudentProfile Model) */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[#6b38d4]">assignment_ind</span>
                     Step 2: Academic Profile
                  </h3>
                  <span className="text-xs font-mono bg-purple-50 text-[#6b38d4] px-2 py-1 rounded border border-purple-100">StudentProfile Model</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Enrollment Number
                    </label>
                    <input
                      required
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      placeholder="e.g. STU-2024-001"
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Phone Number
                    </label>
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    >
                      <option value="">Select Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">
                    Residential Address
                  </label>
                  <textarea
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address..."
                    className="bg-[#eff4ff] px-4 py-3 rounded-md outline-none focus:bg-white focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => navigate("/school-admin/students")}
                  className="px-8 py-3 text-[#6b7280] font-semibold hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2 min-w-[200px] disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Syncing Database...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Complete Registration
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              <div className="bg-[#0b1c30] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <span className="material-symbols-outlined text-8xl">data_object</span>
                 </div>
                 <h3 className="text-lg font-bold mb-3 relative z-10 text-blue-200">Relational Architecture</h3>
                 <p className="text-sm text-slate-300 relative z-10 leading-relaxed mb-4">
                   Your Django backend is executing two sequential REST transactions here. It creates the authentication model, then attaches the extended domain attributes via the OneToOne mapping.
                 </p>
                 <div className="bg-[#1e3450] p-3 rounded-md border border-[#2b4b72] relative z-10 space-y-1">
                    <p className="text-xs font-mono text-green-300">
                       1. POST /api/v1/users/
                    </p>
                    <p className="text-xs font-mono text-purple-300">
                       2. POST /api/v1/profiles/students/
                    </p>
                 </div>
              </div>

              {/* Photo Placeholder */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-[#f8f9ff] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  <span className="material-symbols-outlined text-6xl text-gray-300">face</span>
                </div>
                <h4 className="mt-4 font-semibold text-slate-800">
                  Profile Asset
                </h4>
                <p className="text-xs text-[#6b7280]">
                  You can upload a custom profile picture later from the student's detail view.
                </p>
              </div>

            </div>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}