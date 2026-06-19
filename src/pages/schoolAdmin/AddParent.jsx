import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

// ── Skeleton shimmer ──
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}
const SHIMMER = {
  background: "linear-gradient(90deg,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 25%,color-mix(in srgb,var(--color-outline-variant) 28%,var(--color-surface-container-lowest)) 50%,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.4s ease infinite",
};
function Sk({ w, h, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...SHIMMER, ...style }} />;
}

// ── Full‑page Skeleton ──
function AddParentSkeleton() {
  return (
    <SchoolLayout title="Add Guardian">
      <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <Sk w={140} h={20} />
          <div className="flex gap-2">
            <Sk w={80} h={36} r={8} />
            <Sk w={120} h={36} r={8} />
          </div>
        </div>

        {/* Identity Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-5">
            <Sk w={64} h={64} r={16} />
            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
                <div className="flex-1">
                  <Sk w={80} h={12} />
                  <Sk w="100%" h={42} r={6} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guardian Details SectionCard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={120} h={16} />
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={i === 2 ? "md:col-span-2" : ""}>
                <Sk w={80} h={12} />
                <Sk w="100%" h={42} r={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}

// ── Style tokens ──
const labelClass =
  "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";
const editFieldClass =
  "w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md";

// ── SectionCard ──
function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-blue-400 shrink-0" />
        <span className="material-symbols-outlined text-[18px] text-gray-400">
          {icon}
        </span>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

// ── Main Component ──
export default function AddParent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [occupation, setOccupation] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // ← new
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Simulate page load to show skeleton
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userResponse = await api.post(`/users/`, {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      const userData = userResponse.data;

      if (userData.id) {
        await api.post(`/profiles/parents/`, {
          user: userData.id,
          phone_number: phoneNumber,
          emergency_contact_number: emergencyContact,
          occupation,
        });
      }

      showToast("Guardian onboarded successfully!");
      setTimeout(() => navigate("/school-admin/parents"), 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string" && data.includes("<!DOCTYPE")) {
          setError("Server crashed (500). Please check your Django terminal.");
        } else {
          setError(
            Object.entries(data)
              .map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`)
              .join(" | ")
          );
        }
      } else {
        setError(err.message);
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
        ? firstName.slice(0, 2).toUpperCase()
        : "GD";

  // ── Skeleton ──
  if (pageLoading) {
    return <AddParentSkeleton />;
  }

  return (
    <SchoolLayout title="Add Guardian">
      <form onSubmit={handleSave}>
        <div className="max-w-4xl px-4 md:px-8 pt-4 pb-12 space-y-6">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
                }`}
            >
              <span className="material-symbols-outlined text-base">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* ── Top Bar ── */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/school-admin/parents")}
              className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Directory
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/school-admin/parents")}
                className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70"
              >
                {loading && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">
                    progress_activity
                  </span>
                )}
                {loading ? "Saving..." : "Add Guardian"}
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm font-medium flex gap-2">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              {error}
            </div>
          )}

          {/* ── Identity Card ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e5eeff] text-[#0058be] flex items-center justify-center font-bold text-xl border border-blue-100">
                {initials}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className={labelClass}>First Name</p>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Rajesh"
                      className={editFieldClass}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={labelClass}>Last Name</p>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className={editFieldClass}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className={labelClass}>Login Email</p>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guardian@email.com"
                      className={`${editFieldClass} font-mono text-xs`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={labelClass}>Temporary Password</p>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={editFieldClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Guardian Details SectionCard ── */}
          <SectionCard title="Guardian Details" icon="family_restroom">
            <div>
              <p className={labelClass}>Primary Phone</p>
              <input
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className={editFieldClass}
              />
            </div>

            <div>
              <p className={labelClass}>Emergency Contact</p>
              <input
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 91234 56789"
                className={editFieldClass}
              />
            </div>

            <div>
              <p className={labelClass}>Occupation</p>
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Engineer, Teacher"
                className={editFieldClass}
              />
            </div>
          </SectionCard>

        </div>
      </form>
    </SchoolLayout>
  );
}