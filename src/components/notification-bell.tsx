"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCircle2, Info, Megaphone, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    if (!supabase) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription
    if (!supabase) return;
    
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          // Add new notification to the top
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  // Fetch when opened to ensure fresh data
  const prevOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      fetchNotifications();
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  async function markAsRead(id: string) {
    if (!supabase) return;
    
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  }

  async function markAllAsRead() {
    if (!supabase) return;
    
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="icon-button relative"
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-[var(--color-canvas-white)]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 z-50 w-80 sm:w-96 overflow-hidden rounded-[24px] border border-[rgba(83,88,98,0.12)] bg-white/95 backdrop-blur-xl shadow-[var(--shadow-xl)] dark:bg-[var(--color-canvas-white)]/95 dark:border-white/10"
          >
            <div className="flex items-center justify-between border-b border-[rgba(83,88,98,0.08)] px-5 py-4 dark:border-white/5">
              <h3 className="font-aeonik text-lg text-[var(--color-obsidian)]">Notifikasi</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-electric-blue)] hover:text-blue-600 transition-colors"
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="text-sm font-medium text-[var(--color-silver-pine)]">Memuat...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center px-4 text-center">
                  <Bell className="mb-3 h-8 w-8 text-[var(--color-ash-gray)] opacity-40" />
                  <p className="text-sm font-medium text-[var(--color-silver-pine)]">Belum ada notifikasi baru</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => {
                    // Determine icon and colors based on type
                    let Icon = Info;
                    let iconBg = "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
                    
                    if (notif.type === "announcement") {
                      Icon = Megaphone;
                      iconBg = "bg-purple-100 dark:bg-purple-900/30 text-purple-600";
                    } else if (notif.type === "request_update") {
                      Icon = CheckCircle2;
                      iconBg = "bg-[var(--color-mint-glaze)] text-[var(--color-silver-pine)]";
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) markAsRead(notif.id);
                          if (notif.link_url) window.open(notif.link_url, "_blank");
                        }}
                        className={`group relative flex cursor-pointer gap-4 border-b border-[rgba(83,88,98,0.04)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--color-arctic-mist)] dark:border-white/5 dark:hover:bg-white/5 ${
                          !notif.is_read ? "bg-[var(--color-whisper-fade-blue)]/30 dark:bg-blue-900/10" : ""
                        }`}
                      >
                        {!notif.is_read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[var(--color-electric-blue)]" />
                        )}
                        
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`text-sm font-bold text-[var(--color-obsidian)] ${!notif.is_read ? "text-[var(--color-obsidian)]" : "text-[var(--color-silver-pine)]"}`}>
                            {notif.title}
                          </h4>
                          <p className={`mt-1 text-xs leading-relaxed ${!notif.is_read ? "font-medium text-[var(--color-silver-pine)]" : "text-[var(--color-ash-gray)]"}`}>
                            {notif.message}
                          </p>
                          <span className="mt-2 block text-[10px] font-bold text-[var(--color-ash-gray)]">
                            {new Date(notif.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-full bg-white dark:bg-[var(--color-canvas-white)] shadow-sm text-[var(--color-ash-gray)] hover:text-green-500"
                            title="Tandai dibaca"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
