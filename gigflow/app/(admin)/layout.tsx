"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../providers/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isLoading: isAuthLoading, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAuthLoading) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [isAdmin, isAuthLoading, router, token]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isAuthLoading || !token || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 text-[#111d31]">
        <div className="border border-[#dfe7f0] bg-white px-6 py-5 text-[13px] font-bold uppercase tracking-[0.2em] text-[#667893]">
          Checking admin access
        </div>
      </main>
    );
  }

  const isAnalyticsActive = pathname === "/admin";
  const isUsersActive = pathname.startsWith("/admin/users");
  const isJobsActive = pathname.startsWith("/admin/jobs");

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#111d31]">
      <header className="border-b border-[#e1e8f0] bg-white">
        <div className="flex flex-col gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6f8099]">
                Admin Panel
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                className="border border-[#dce6f0] bg-white px-4 py-1.5 text-[12px] font-bold text-[#5f708a] transition hover:bg-[#f4f7fa]"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <button
                className="border border-[#f0d3d3] bg-white px-4 py-1.5 text-[12px] font-bold text-[#c94a4a] transition hover:bg-[#fff5f5]"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="flex gap-2 border-t border-[#f0f4f8] pt-3">
            <Link
              href="/admin"
              className={`px-4 py-2 text-[12px] font-black uppercase tracking-[0.16em] transition ${
                isAnalyticsActive
                  ? "bg-[#111d31] text-white"
                  : "border border-[#d8e3ee] bg-white text-[#52647e] hover:bg-[#f4f7fa]"
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/admin/users"
              className={`px-4 py-2 text-[12px] font-black uppercase tracking-[0.16em] transition ${
                isUsersActive
                  ? "bg-[#111d31] text-white"
                  : "border border-[#d8e3ee] bg-white text-[#52647e] hover:bg-[#f4f7fa]"
              }`}
            >
              Users
            </Link>
            <Link
              href="/admin/jobs"
              className={`px-4 py-2 text-[12px] font-black uppercase tracking-[0.16em] transition ${
                isJobsActive
                  ? "bg-[#111d31] text-white"
                  : "border border-[#d8e3ee] bg-white text-[#52647e] hover:bg-[#f4f7fa]"
              }`}
            >
              Jobs
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
