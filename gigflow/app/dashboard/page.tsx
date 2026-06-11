"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getSavedUser } from "../lib/cookies/authCookies";
import type { AuthUser } from "../lib/api/authApi";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getSavedUser());
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-10 flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">
              Welcome
              {user ? `, ${user.firstName} ${user.lastName}` : " to GigFlow"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Log out
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-gray-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Profile
            </p>
            <p className="mt-3 text-sm text-gray-700">
              {user?.email || "Session cookie not found"}
            </p>
          </div>
          <div className="rounded-md border border-gray-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Role
            </p>
            <p className="mt-3 text-sm capitalize text-gray-700">
              {user?.role || "Guest"}
            </p>
          </div>
          <div className="rounded-md border border-gray-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Sprint
            </p>
            <p className="mt-3 text-sm text-gray-700">Auth flow complete</p>
          </div>
        </div>

        {!user && (
          <p className="mt-8 text-sm text-gray-600">
            Please{" "}
            <Link
              className="font-semibold text-sky-600 underline"
              href="/login"
            >
              log in
            </Link>{" "}
            to load your saved session.
          </p>
        )}
      </section>
    </main>
  );
}
