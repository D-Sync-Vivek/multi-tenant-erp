import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState, useEffect } from "react";
import { getNotifications } from "../../services/schoolAdminApi";

export default function Notifications() {
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                // Map API keys to your UI keys and assign colors dynamically based on type
                const mappedData = data.notifications.map(n => {
                    let icon = "settings";
                    let color = "bg-[#eff4ff] text-[#0058be]";
                    
                    if (n.type === "alert") { icon = "warning"; color = "bg-[#ffdad6] text-[#ba1a1a]"; }
                    else if (n.type === "student") { icon = "school"; color = "bg-[#e5eeff] text-[#0058be]"; }
                    else if (n.type === "teacher") { icon = "person"; color = "bg-[#e9ddff] text-[#6b38d4]"; }
                    else if (n.type === "mapping") { icon = "diversity_1"; color = "bg-[#e5eeff] text-[#0058be]"; }

                    return {
                        id: n.id,
                        type: n.type,
                        title: n.title,
                        desc: n.message,
                        time: new Date(n.created_at).toLocaleDateString(), // Format timestamp
                        read: false, // Pulled from backend later if needed
                        icon,
                        color
                    };
                });
                setNotifications(mappedData);
            } catch (error) {
                console.error("Error fetching notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const filtered = filter === "all" 
        ? notifications 
        : notifications.filter(n => filter === "unread" ? !n.read : n.type === "alert");

    return (
        <SchoolLayout title="Notifications">
            <div className="max-w-5xl mx-auto">
                {/* ... Header and Filters remain exactly the same ... */}
                
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Loading notifications...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No notifications found.</p>
                    ) : (
                        filtered.map(n => (
                            <div key={n.id} className={`bg-white p-5 rounded-lg shadow-sm flex gap-4 items-start border ${!n.read ? "border-[#0058be]/30" : "border-transparent"}`}>
                                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${n.color}`}>
                                    <span className="material-symbols-outlined text-lg">{n.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-[#0b1c30]">{n.title}</p>
                                    <p className="text-sm text-[#6b7280] mt-1">{n.desc}</p>
                                    <p className="text-xs text-[#9aa1b1] mt-2">{n.time}</p>
                                </div>
                                {!n.read && <div className="w-2 h-2 bg-[#0058be] rounded-full mt-2"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </SchoolLayout>
    );
}