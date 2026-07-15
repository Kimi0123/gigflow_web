"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../providers/AuthContext";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "client") {
      router.replace("/dashboard/client");
    } else if (user.role === "admin") {
      router.replace("/admin/users");
    } else {
      // freelancer or any other role
      router.replace("/dashboard/freelancer");
    }
  }, [user, isLoading, router]);

  // Loading state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#f7f8fa]">
      <div className="relative">
        <div
          className="h-14 w-14 rounded-2xl"
          style={{
            background: "#38bdf8",
            boxShadow: "0 8px 32px rgba(56,189,248,0.35)",
          }}
        />
        {/* Spinner ring */}
        <svg
          className="absolute inset-0 -m-2 h-[72px] w-[72px] animate-spin"
          viewBox="0 0 72 72"
          fill="none"
        >
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="160 40"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-[#111d31]">
          Loading your dashboard…
        </p>
        <p className="mt-1 text-[13px] text-[#70829d]">
          Setting up your workspace
        </p>
      </div>
    </div>
  );
}
