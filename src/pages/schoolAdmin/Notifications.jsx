import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState, useMemo } from "react";
import { useSchoolAdmin } from "../../context/SchoolAdminProvider";

const FALLBACK_NOTIFICATIONS = [
  {
    id: 1,
    type: "student",
    title: "New Student Registered",
    message: "Emma Wilson has been added to Grade 8-A",
    time: "2 min ago",
    read: false,
    icon: "school",
  },
  {
    id: 2,
    type: "teacher",
    title: "Teacher Assigned",
    message: "Dr. Robert Miller assigned to Physics",
    time: "1 hour ago",
    read: false,
    icon: "person",
  },
  {
    id: 3,
    type: "alert",
    title: "Attendance Alert",
    message: "High absence rate detected in Class 9-B",
    time: "3 hours ago",
    read: true,
    icon: "warning",
  },
  {
    id: 4,
    type: "system",
    title: "System Update",
    message: "New grading feature added",
    time: "Yesterday",
    read: true,
    icon: "settings",
  },
  {
    id: 5,
    type: "mapping",
    title: "Parent Mapping Complete",
    message: "Parent linked successfully with student",
    time: "Yesterday",
    read: false,
    icon: "diversity_1",
  },
];

const CATEGORY_COLORS = {
  student: "bg-[#e5eeff] text-[#0058be]",
  teacher: "bg-[#e9ddff] text-[#6b38d4]",
  alert: "bg-[#ffdad6] text-[#ba1a1a]",
  system: "bg-[#eff4ff] text-[#0058be]",
  mapping: "bg-[#e5eeff] text-[#0058be]",
  default: "bg-[#f3f4f6] text-[#374151]"
};

function mapApiNotification(n) {
  return {
    id: n.id,
    type: n.category || n.type || "system",
    title: n.title,
    desc: n.message || n.desc || "",
    time: n.created_at || n.time || "",
    read: n.is_read ?? n.read ?? false,
    icon: n.icon || "notifications",
  };
}

export default function Notifications() {
  const { 
    notifications: apiNotifications, 
    markAllNotificationsRead,
    markNotificationRead 
  } = useSchoolAdmin();
  
  const [filter, setFilter] = useState("all");

  // Memoize mapped data transformations
  const notifications = useMemo(() => {
    return apiNotifications.length > 0
      ? apiNotifications.map(mapApiNotification)
      : FALLBACK_NOTIFICATIONS;
  }, [apiNotifications]);

  // Memoize targeted filtering rules
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return !n.read;
      return n.type === "alert";
    });
  }, [notifications, filter]);

  const formatTime = (timeValue) => {
    if(!timeValue) return "";
    const date = new Date(timeValue);

    if(isNaN(date.getTime())){
      return timeValue; //Fallback to just returning the original string ("2 min ago", "Yesterday")
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <SchoolLayout title="Notifications">
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Notifications</h1>
            <p className="text-[#6b7280]">Track system alerts and updates</p>
          </div>
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="text-sm font-semibold text-[#0058be] hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "alert", label: "Alerts" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                filter === item.key
                  ? "bg-[#0058be] text-white"
                  : "bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e0eeff]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredNotifications.map((n) => {
            const colorClass = CATEGORY_COLORS[n.type] || CATEGORY_COLORS.default;
            
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`bg-surface-container-lowest p-5 rounded-lg shadow-sm flex gap-4 items-start border transition ${
                  !n.read 
                    ? "border-[#0058be]/30 cursor-pointer hover:bg-slate-50/50" 
                    : "border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colorClass}`}>
                  <span className="material-symbols-outlined text-lg">{n.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#0b1c30]">{n.title}</p>
                  <p className="text-sm text-[#6b7280] mt-1">{n.desc}</p>
                  <p className="text-xs text-[#9aa1b1] mt-2">{formatTime(n.time)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 bg-[#0058be] rounded-full mt-2" />
                )}
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-500 text-sm">No notifications found matches this filter view.</p>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}
