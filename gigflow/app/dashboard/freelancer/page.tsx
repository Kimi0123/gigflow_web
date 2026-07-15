"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../providers/AuthContext";
import FreelancerDashboard from "../../components/dashboard/FreelancerDashboard";

export default function FreelancerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "freelancer") {
      router.replace(user.role === "admin" ? "/admin/users" : "/dashboard/client");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "freelancer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl bg-[#38bdf8] shadow-[0_8px_32px_rgba(56,189,248,0.35)]" />
          <svg className="absolute inset-0 -m-2 h-16 w-16 animate-spin" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#38bdf8" strokeWidth="3" strokeDasharray="140 36" strokeLinecap="round" opacity="0.3" />
          </svg>
        </div>
      </div>
    );
  }

  return <FreelancerDashboard />;
}
