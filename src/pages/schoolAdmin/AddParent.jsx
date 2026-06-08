import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";

export default function AddParent() {
  const navigate = useNavigate();

  // STEP 1: Core User Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // STEP 2: Parent Profile Fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [occupation, setOccupation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
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
      // STEP 2: CREATE THE PARENT PROFILE
      // ==========================================
      if (userData.id) {
        const profilePayload = {
          user: userData.id, // Link to the user instance
          phone_number: phoneNumber,
          emergency_contact_number: emergencyContact,
          occupation: occupation,
          date_of_birth: dateOfBirth || null,
          address: address
        };

        const profileResponse = await fetch(`${baseUrl}v1/profiles/parents/`, {
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
          let profileErrorMsg = "User was created, but linking the Parent Profile failed.";
          if (typeof profileData === "object") {
             profileErrorMsg += " " + Object.entries(profileData)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
              .join(" | ");
          }
          throw new Error(profileErrorMsg);
        }
      }

      setSuccessMsg("Guardian registration complete! Profile established successfully.");
      
      setTimeout(() => {
        navigate("/school-admin/parents");
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
    <SchoolLayout title="Parents">
      <div className="max-w-6xl mx-auto space-y-10 px-8 py-10">

        {/* breadcrumb */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin")}>Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="cursor-pointer hover:text-[#0058be] transition-colors" onClick={() => navigate("/school-admin/parents")}>Guardians</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-[#0058be] font-bold">Add Guardian</span>
          </div>

          <button
            onClick={() => navigate("/school-admin/parents")}
            className="flex items-center gap-2 px-4 py-2 text-[#0058be] font-bold hover:bg-[#eff4ff] rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Directory
          </button>
        </div>

        {/* heading */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Register New Guardian</h1>
          <p className="text-[#6b7280] mt-2 text-lg max-w-2xl">
            Onboard a new guardian into the institutional ecosystem using the 2-step decoupled identity architecture.
          </p>
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
          <div className="grid lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 space-y-8">

              {/* photo placeholder */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="relative group inline-block">
                  <div className="w-48 h-48 rounded-full bg-[#f8f9ff] border-4 border-dashed border-[#c2c6d6] flex items-center justify-center text-[#0058be]/20">
                    <span className="material-symbols-outlined text-6xl">add_a_photo</span>
                  </div>
                  <button type="button" className="absolute bottom-2 right-4 w-12 h-12 bg-[#0058be] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform border-4 border-white">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
                <h3 className="font-bold mt-6 text-slate-800">Profile Photo</h3>
                <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
                  Upload a high-resolution portrait for automated pickup verification.
                </p>
              </div>

              {/* info card */}
              <div className="bg-gradient-to-br from-[#0058be] to-[#2170e4] p-8 rounded-xl shadow-lg relative overflow-hidden text-white">
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10">
                  security
                </span>
                <span className="material-symbols-outlined text-4xl mb-4 text-blue-200">
                  lock
                </span>
                <h3 className="text-lg font-bold mb-2">Isolated Architecture</h3>
                <p className="text-sm text-blue-100 leading-relaxed relative z-10">
                  Guardians get access to the Parent Portal. Their view is restricted solely to data connected to their mapped `StudentProfile` entities via Django's row-level ORM filters.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-8 space-y-8">

              {/* CORE IDENTITY */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                      <span className="material-symbols-outlined text-[#0058be]">badge</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Step 1: Core Identity</h2>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#0058be] bg-blue-50 px-3 py-1 rounded-md border border-blue-100">Base User</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">First Name</label>
                    <input
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Jonathan"
                      className="bg-[#f8f9ff] px-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Last Name (Optional)</label>
                    <input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Aris"
                      className="bg-[#f8f9ff] px-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Login Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">alternate_email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="j.aris@email.com"
                        className="w-full bg-[#f8f9ff] pl-10 pr-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Temporary Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full bg-[#f8f9ff] pl-10 pr-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PARENT PROFILE */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                      <span className="material-symbols-outlined text-emerald-600">contact_phone</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Step 2: Profile Details</h2>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">ParentProfile</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Phone Number</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">call</span>
                      <input
                        required
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#f8f9ff] pl-10 pr-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Emergency Contact</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-red-400">emergency</span>
                      <input
                        required
                        value={emergencyContact}
                        onChange={e => setEmergencyContact(e.target.value)}
                        placeholder="Secondary Number"
                        className="w-full bg-[#f8f9ff] pl-10 pr-4 py-3.5 rounded-md outline-none focus:border-red-400/40 focus:ring-2 focus:ring-red-400/10 border border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Occupation</label>
                    <input
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-[#f8f9ff] px-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="w-full bg-[#f8f9ff] px-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Physical Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-4 text-gray-400">location_on</span>
                    <textarea
                      required
                      rows="3"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Street, City, Zip..."
                      className="w-full bg-[#f8f9ff] pl-10 pr-4 py-3.5 rounded-md outline-none focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => navigate("/school-admin/parents")}
                  className="px-8 py-3.5 font-bold text-[#6b7280] hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md shadow-lg shadow-[#0058be]/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Syncing Database...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Guardian Profile
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