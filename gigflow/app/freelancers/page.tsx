"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../providers/AuthContext";
import {
  freelancerApi,
  resolveAssetUrl,
  type FreelancerProfile,
} from "../lib/api/freelancerApi";

export default function FreelancersPage() {
  const { token, user } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await freelancerApi.listFreelancers(token, {
        search,
        page,
        limit,
      });
      setFreelancers(data.freelancers);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load freelancers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, search, page]);

  useEffect(() => {
    loadFreelancers();
  }, [loadFreelancers]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-[#0f172a]">
              Gig<span className="text-[#38bdf8]">Flow</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs font-bold text-[#475569] hover:text-[#0f172a]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-bold text-[#334155] hover:bg-[#e2e8f0]"
                >
                  My Profile
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-[#38bdf8] px-4 py-2 text-xs font-bold text-white hover:bg-[#0ea5e9]"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Title & Search Bar */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0f172a]">
            Find Freelancers
          </h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Browse top talent, skills, ratings, and verified experience.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, title, or skills (e.g. React, Developer)..."
                className="w-full rounded-xl border border-[#cbd5e1] bg-white py-3 pl-10 pr-4 text-sm text-[#0f172a] shadow-sm outline-none transition placeholder:text-[#94a3b8] focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20"
              />
              <svg
                className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94a3b8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="text-xs font-semibold text-[#64748b]">
              Showing {pagination.total} freelancer{pagination.total !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : freelancers.length === 0 ? (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-[#0f172a]">No freelancers found</h3>
            <p className="mt-1 text-sm text-[#64748b]">
              {search
                ? `No freelancers matched "${search}". Try a different keyword.`
                : "No freelancers have registered yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {freelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold text-[#334155] shadow-sm transition hover:bg-[#f8fafc] disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 text-xs font-semibold text-[#64748b]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-bold text-[#334155] shadow-sm transition hover:bg-[#f8fafc] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function FreelancerCard({ freelancer }: { freelancer: FreelancerProfile }) {
  const avatarUrl = freelancer.profilePicture
    ? resolveAssetUrl(freelancer.profilePicture)
    : null;
  const fullName = `${freelancer.firstName} ${freelancer.lastName}`.trim();
  const topSkills = freelancer.skills.slice(0, 4);

  return (
    <Link
      href={`/freelancers/${freelancer.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:border-[#38bdf8] hover:shadow-md"
    >
      <div>
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 shrink-0 rounded-full object-cover border border-[#cbd5e1]"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#38bdf8] text-base font-black text-white">
              {freelancer.initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-extrabold text-[#0f172a] transition group-hover:text-[#38bdf8]">
              {fullName}
            </h3>
            <p className="truncate text-xs font-medium text-[#64748b]">
              {freelancer.title || "Freelancer"}
            </p>

            {/* Rating display */}
            <div className="mt-1 flex items-center gap-1 text-xs">
              {freelancer.totalReviews > 0 ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]"
                    viewBox="0 0 24 24"
                  >
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-bold text-[#0f172a]">
                    {freelancer.averageRating.toFixed(1)}
                  </span>
                  <span className="text-[#94a3b8]">
                    ({freelancer.totalReviews})
                  </span>
                </>
              ) : (
                <span className="font-medium text-[#94a3b8]">No reviews yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio snippet if available */}
        {freelancer.bio && (
          <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-[#475569]">
            {freelancer.bio}
          </p>
        )}

        {/* Skills tags */}
        {topSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-[#dce5ef] bg-[#f0f8ff] px-2 py-0.5 text-[10px] font-bold text-[#4b6a8a]"
              >
                {skill}
              </span>
            ))}
            {freelancer.skills.length > 4 && (
              <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#64748b]">
                +{freelancer.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-[#f1f5f9] pt-3.5 flex items-center justify-between text-[11px] text-[#64748b]">
        <span>{freelancer.completedContractsCount} jobs completed</span>
        <span className="font-bold text-[#38bdf8] group-hover:underline">
          View Profile &rarr;
        </span>
      </div>
    </Link>
  );
}
