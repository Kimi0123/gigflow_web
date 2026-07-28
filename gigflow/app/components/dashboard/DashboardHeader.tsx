"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import { useSocket } from "../../providers/SocketContext";
import { messageApi } from "../../lib/api/messageApi";
import {
  notificationApi,
  NotificationModel,
  NotificationType,
} from "../../lib/api/notificationApi";
import { resolveAssetUrl } from "../../lib/api/authApi";

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  navItems?: { label: string; href: string; active?: boolean }[];
  onNavClick?: (label: string) => void;
  activeNav?: string;
  onPostJob?: () => void;
}

function formatNotificationTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export default function DashboardHeader({
  searchPlaceholder = "Search...",
  navItems = [],
  onNavClick,
  activeNav,
  onPostJob,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

  // Notification states
  const [notificationUnreadCount, setNotificationUnreadCount] = useState<number>(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const fullName = user
    ? user.fullName || `${user.firstName} ${user.lastName}`.trim()
    : "";
  const initials = user?.firstName?.slice(0, 2).toUpperCase() || "??";

  const fetchUnreadMessageCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await messageApi.getUnreadCount(token);
      setUnreadMessageCount(data.unreadCount);
    } catch {
      // non-critical
    }
  }, [token]);

  const fetchNotificationUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationApi.getUnreadCount(token);
      setNotificationUnreadCount(data.unreadCount);
    } catch {
      // non-critical
    }
  }, [token]);

  useEffect(() => {
    void fetchUnreadMessageCount();
    void fetchNotificationUnreadCount();
  }, [fetchUnreadMessageCount, fetchNotificationUnreadCount, activeNav]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      void fetchUnreadMessageCount();
    };

    const handleNewNotification = (newNotif: NotificationModel) => {
      setNotificationUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("notification", handleNewNotification);
    };
  }, [socket, fetchUnreadMessageCount]);

  const toggleNotificationDropdown = async () => {
    const nextState = !notificationDropdownOpen;
    setNotificationDropdownOpen(nextState);
    if (nextState && token) {
      setLoadingNotifications(true);
      try {
        const data = await notificationApi.getNotifications(token);
        setNotifications(data);
      } catch {
        // non-critical
      } finally {
        setLoadingNotifications(false);
      }
    }
  };

  const handleNotificationClick = async (notif: NotificationModel) => {
    if (!token) return;
    if (!notif.read) {
      try {
        await notificationApi.markAsRead(token, notif.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notif.id ? { ...item, read: true } : item
          )
        );
        setNotificationUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // non-critical
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await notificationApi.markAllAsRead(token);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true }))
      );
      setNotificationUnreadCount(0);
    } catch {
      // non-critical
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";
  const dashboardHref = isClient
    ? "/dashboard/client"
    : isFreelancer
    ? "/dashboard/freelancer"
    : "/";

  return (
    <header className="sticky top-0 z-30 border-b border-[#e9eef5] bg-white/95 backdrop-blur">
      {/* Top bar */}
      <div className="flex h-[58px] items-center gap-3 px-4 sm:px-7">
        {/* Logo */}
        <Link
          href={dashboardHref}
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image src="/assets/logo.svg" alt="GigFlow" width={38} height={38} />
          <span className="hidden text-[17px] font-extrabold tracking-tight text-[#111d31] sm:block">
            GigFlow
          </span>
        </Link>

        {/* Search */}
        <label className="relative hidden w-full max-w-[600px] md:block">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8191aa]" />
          <input
            className="h-[40px] w-full rounded-xl border border-[#dce5ef] bg-[#f0f8ff] pl-10 pr-4 text-[14px] text-[#374151] outline-none placeholder:text-[#9caec1] focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20"
            placeholder={searchPlaceholder}
          />
        </label>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Role-specific CTA */}
          {isClient &&
            (onPostJob ? (
              <button
                type="button"
                onClick={onPostJob}
                className="hidden items-center gap-1.5 rounded-lg bg-[#38bdf8] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#0ea5e9] sm:flex"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Post a Job
              </button>
            ) : (
              <Link
                href="/dashboard/client"
                className="hidden items-center gap-1.5 rounded-lg bg-[#38bdf8] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#0ea5e9] sm:flex"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Post a Job
              </Link>
            ))}
          {isFreelancer && (
            <Link
              href="/dashboard/freelancer"
              className="hidden items-center gap-1.5 rounded-lg border border-[#e5e9ef] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#677894] transition hover:border-[#38bdf8] hover:text-[#38bdf8] sm:flex"
            >
              <BriefcaseIcon className="h-3.5 w-3.5" />
              Find Work
            </Link>
          )}

          {/* Messages shortcut icon with unread badge */}
          <button
            type="button"
            aria-label="Messages"
            onClick={() => onNavClick?.("Messages")}
            className="relative text-[#63748e] transition hover:text-[#38bdf8]"
            title="Messages"
          >
            <ChatBubbleIcon className="h-5 w-5" />
            {unreadMessageCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#38bdf8] px-1 text-[9px] font-bold text-white shadow-xs">
                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
              </span>
            )}
          </button>

          {/* Notifications button & dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={toggleNotificationDropdown}
              className="relative text-[#63748e] transition hover:text-[#38bdf8]"
              title="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {notificationUnreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#38bdf8] px-1 text-[9px] font-bold text-white shadow-xs">
                  {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setNotificationDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-30 mt-2 w-[320px] sm:w-[360px]">
                  <div className="overflow-hidden rounded-xl border border-[#dce5ef] bg-white shadow-[0_20px_60px_rgba(17,29,49,0.12)]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#edf2f6] px-4 py-3">
                      <h4 className="text-[13px] font-extrabold text-[#111d31]">
                        Notifications
                      </h4>
                      {notificationUnreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[11px] font-bold text-[#38bdf8] transition hover:text-[#0ea5e9]"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-[#edf2f6]">
                      {loadingNotifications ? (
                        <div className="p-4 text-center text-[12px] font-medium text-[#72839a]">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-[12px] font-medium text-[#72839a]">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`flex items-start gap-3 p-3.5 transition cursor-pointer ${
                              notif.read
                                ? "bg-white hover:bg-[#f8fafc]"
                                : "bg-[#f0f9ff] hover:bg-[#e0f2fe]"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <NotificationTypeIcon type={notif.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[12px] leading-snug ${
                                  notif.read
                                    ? "font-medium text-[#475569]"
                                    : "font-bold text-[#0f172a]"
                                }`}
                              >
                                {notif.message}
                              </p>
                              <p className="mt-1 text-[10px] font-medium text-[#94a3b8]">
                                {formatNotificationTime(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && (
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-[#38bdf8] shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Role badge */}
          <span
            className="hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] sm:inline-block"
            style={{
              background: isClient
                ? "rgba(56,189,248,0.1)"
                : "rgba(52,211,153,0.1)",
              color: isClient ? "#0284c7" : "#059669",
              border: isClient
                ? "1px solid rgba(56,189,248,0.25)"
                : "1px solid rgba(52,211,153,0.25)",
            }}
          >
            {user?.role || "member"}
          </span>

          {/* User dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-[#f4fbff] px-2.5 py-1.5 transition hover:border-[#38bdf8] hover:bg-white"
            >
              {user?.profilePicture ? (
                <img
                  src={resolveAssetUrl(user.profilePicture)}
                  alt={fullName || "User Avatar"}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#38bdf8] text-[11px] font-extrabold text-white">
                  {initials}
                </span>
              )}
              <span className="hidden min-w-0 lg:block">
                <span className="block max-w-[110px] truncate text-[13px] font-extrabold text-[#111d31]">
                  {fullName || "Account"}
                </span>
                <span className="block text-[10px] font-semibold capitalize text-[#72839a]">
                  {user?.role || "Member"}
                </span>
              </span>
              <ChevronDownIcon className="hidden h-3.5 w-3.5 text-[#9caec1] lg:block" />
            </button>

            {userDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-30 mt-2 w-[220px]">
                  <div className="overflow-hidden rounded-xl border border-[#dce5ef] bg-white shadow-[0_20px_60px_rgba(17,29,49,0.12)]">
                    {/* User info */}
                    <div className="border-b border-[#edf2f6] px-4 py-3">
                      <p className="truncate text-[14px] font-extrabold text-[#111d31]">
                        {fullName || "GigFlow User"}
                      </p>
                      <p className="truncate text-[11px] text-[#72839a]">
                        {user?.email}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[#5d6f8d] transition hover:bg-[#eef8ff] hover:text-[#38bdf8]"
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                        My Profile
                      </Link>
                      <Link
                        href="/profile/password"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[#5d6f8d] transition hover:bg-[#eef8ff] hover:text-[#38bdf8]"
                      >
                        <SettingsIcon className="h-3.5 w-3.5" />
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-bold uppercase tracking-[0.12em] text-[#dc2626] transition hover:bg-[#fff5f5]"
                      >
                        <LogoutIcon className="h-3.5 w-3.5" />
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      {navItems.length > 0 && (
        <nav className="flex h-[46px] items-end overflow-x-auto px-4 sm:px-7">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.href && item.href.startsWith("/")) {
                  router.push(item.href);
                } else {
                  onNavClick?.(item.label);
                }
              }}
              className={`flex h-full shrink-0 items-center border-b-2 px-4 text-[11px] font-bold uppercase tracking-[0.22em] transition ${
                (activeNav ?? item.active) === item.label
                  ? "border-[#38bdf8] text-[#38bdf8]"
                  : "border-transparent text-[#6d7f98] hover:text-[#38bdf8]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

// ─── Notification Type Icon Helper ──────────────────────────────────────────
function NotificationTypeIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "proposal_received":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[#38bdf8]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </span>
      );
    case "proposal_accepted":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case "proposal_rejected":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case "new_message":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <ChatBubbleIcon className="h-4 w-4" />
        </span>
      );
    case "contract_completed":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
      );
    case "review_received":
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <svg className="h-4 w-4 fill-amber-400" viewBox="0 0 16 16">
            <path d="m8 1.5 1.8 3.7 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.6l.7-4L2.2 5.8l4-.6L8 1.5Z" />
          </svg>
        </span>
      );
    default:
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <BellIcon className="h-4 w-4" />
        </span>
      );
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M4 7h16v13H4z" />
    </svg>
  );
}
function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  );
}
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
