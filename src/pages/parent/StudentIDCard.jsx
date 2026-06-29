// src/pages/parent/StudentIDCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Downloadable Student ID Card for the Parent Portal.
// Reacts to activeChild from ParentProvider — switching the child in the
// navbar instantly shows the correct card without reopening the modal.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from "react";
import { useParent } from "../../context/ParentProvider";

// ── ID Card Visual ────────────────────────────────────────────────────────────

function IDCardVisual({ child, enrollment, cardRef }) {
  const fullName  = child?.name || "—";
  const classInfo = enrollment
    ? `${enrollment.class_level_name} – ${enrollment.section_name}`
    : "—";
  const rollNo   = enrollment?.roll_number        || "—";
  const enrollNo = child?.enrollment_number       || "—";
  const email    = child?.email                   || "—";
  const year     = enrollment?.academic_year_name || new Date().getFullYear();

  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      ref={cardRef}
      style={{
        width: "340px",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)",
        borderRadius: "18px",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        flexShrink: 0,
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "140px", height: "140px", borderRadius: "50%",
        background: "rgba(255,255,255,0.05)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "60px", left: "-30px",
        width: "100px", height: "100px", borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{
        padding: "20px 22px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "22px" }}>🏫</span>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "13px", letterSpacing: "0.03em", lineHeight: 1.2 }}>
            Academic Architect
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px", marginTop: "2px", letterSpacing: "0.05em" }}>
            STUDENT IDENTITY CARD
          </div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: "rgba(255,255,255,0.12)", borderRadius: "6px",
          padding: "3px 8px", color: "rgba(255,255,255,0.7)",
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
        }}>
          {year}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

          {/* Initials Avatar */}
          <div style={{
            width: "80px", height: "96px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.2)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            <span style={{
              fontSize: "28px", fontWeight: 900, color: "#fff",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              lineHeight: 1,
            }}>
              {initials}
            </span>
            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>
              STUDENT
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff", fontWeight: 800, fontSize: "15px",
              lineHeight: 1.25, marginBottom: "6px", wordBreak: "break-word",
            }}>
              {fullName}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(99,179,237,0.2)", borderRadius: "6px",
              padding: "2px 8px", color: "#93c5fd",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
              marginBottom: "12px",
            }}>
              {classInfo}
            </div>

            {[
              { label: "ROLL NO",   value: rollNo   },
              { label: "ENROLL ID", value: enrollNo },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: "6px" }}>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.1em" }}>
                  {label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", fontWeight: 600 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div style={{
          marginTop: "14px", padding: "8px 12px",
          background: "rgba(255,255,255,0.06)", borderRadius: "8px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ fontSize: "12px" }}>✉️</span>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", wordBreak: "break-all" }}>
            {email}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: "rgba(255,255,255,0.07)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "10px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "8px", letterSpacing: "0.08em" }}>
          VALID FOR ACADEMIC YEAR {year}
        </div>
        <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
          {[6,10,7,12,8,5,11,9,6,10,8,7].map((h, i) => (
            <div key={i} style={{
              width: "2px", height: `${h}px`,
              background: "rgba(255,255,255,0.3)", borderRadius: "1px",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function StudentIDCardModal({ onClose }) {
  const { activeChild, enrollment, students, switchChild, loading } = useParent();

  const cardRef                       = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg]                 = useState(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Reset msg when child switches
  useEffect(() => { setMsg(null); }, [activeChild?.id]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setMsg(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link     = document.createElement("a");
      const safeName = (activeChild?.name || "student").replace(/\s+/g, "_");
      link.download  = `ID_Card_${safeName}.png`;
      link.href      = canvas.toDataURL("image/png");
      link.click();
      setMsg({ type: "success", text: "ID card downloaded!" });
    } catch (err) {
      console.error("[StudentIDCard] download failed:", err);
      setMsg({ type: "error", text: "Download failed. Please try again." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* Panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
          style={{
            maxWidth: "420px", width: "100%",
            overflow: "hidden",
            animation: "idcard-in 0.22s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                Student ID Card
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Preview &amp; download identity card
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">close</span>
            </button>
          </div>

          {/* Child tabs — visible only if parent has multiple children */}
          {students.length > 1 && (
            <div className="flex gap-1 px-5 pt-3 pb-1 overflow-x-auto">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => switchChild(s.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    s.id === activeChild?.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}

          {/* Card Preview */}
          <div className="p-6 flex justify-center bg-slate-100 dark:bg-slate-800">
            {loading ? (
              <div className="w-[340px] h-[260px] rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : (
              <IDCardVisual
                child={activeChild}
                enrollment={enrollment}
                cardRef={cardRef}
              />
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">
                {downloading ? "hourglass_empty" : "download"}
              </span>
              {downloading ? "Generating…" : "Download PNG"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Status message */}
          {msg && (
            <div className={`mx-5 mb-4 text-xs font-semibold flex items-center gap-1.5 ${
              msg.type === "success" ? "text-green-600" : "text-red-500"
            }`}>
              <span className="material-symbols-outlined text-sm">
                {msg.type === "success" ? "check_circle" : "error"}
              </span>
              {msg.text}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes idcard-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  );
}