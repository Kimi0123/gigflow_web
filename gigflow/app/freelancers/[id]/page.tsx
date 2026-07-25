"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../providers/AuthContext";
import {
  freelancerApi,
  resolveAssetUrl,
  type FreelancerProfile,
} from "../../lib/api/freelancerApi";
import { reviewApi, type Review } from "../../lib/api/reviewApi";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { token } = useAuth();

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPagination, setReviewsPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [reviewsPage, setReviewsPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Load public profile
  useEffect(() => {
    if (!userId) return;
    setLoadingProfile(true);
    setProfileError("");

    freelancerApi
      .getPublicProfile(token, userId)
      .then((data) => setProfile(data))
      .catch((err) => {
        setProfileError(err.message || "Failed to load user profile.");
      })
      .finally(() => setLoadingProfile(false));
  }, [userId, token]);

  // Load user reviews
  const loadReviews = useCallback(
    async (p: number) => {
      if (!userId) return;
      setLoadingReviews(true);
      try {
        const data = await reviewApi.getUserReviews(token || "", userId, p, 10);
        setReviews(data.reviews);
        setReviewsPagination(data.pagination);
      } catch {
        // Silently fail or empty reviews
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    },
    [userId, token]
  );

  useEffect(() => {
    loadReviews(reviewsPage);
  }, [loadReviews, reviewsPage]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-48 animate-pulse rounded-2xl bg-white" />
          <div className="h-32 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-6 py-12">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-bold text-[#0f172a]">User Not Found</h1>
          <p className="mt-2 text-sm text-[#64748b]">
            {profileError || "The requested user profile does not exist."}
          </p>
          <Link
            href="/freelancers"
            className="mt-6 inline-block rounded-xl bg-[#38bdf8] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0ea5e9]"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.profilePicture
    ? resolveAssetUrl(profile.profilePicture)
    : null;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const joinYear = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/freelancers" className="flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#0f172a]">
            &larr; Back to Directory
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-[#38bdf8] hover:underline">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Profile Header Card */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 shrink-0 rounded-full object-cover border-2 border-[#cbd5e1]"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#38bdf8] text-2xl font-black text-white">
                  {profile.initials}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-extrabold text-[#0f172a]">{fullName}</h1>
                <p className="mt-0.5 text-sm font-semibold text-[#64748b]">
                  {profile.title || (profile.role === "client" ? "Client" : "Freelancer")}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                  {/* Rating display */}
                  <div className="flex items-center gap-1.5">
                    {profile.totalReviews > 0 ? (
                      <>
                        <svg className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" viewBox="0 0 24 24">
                          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="font-bold text-[#0f172a]">
                          {profile.averageRating.toFixed(1)}
                        </span>
                        <span className="text-[#64748b]">
                          ({profile.totalReviews} review{profile.totalReviews !== 1 ? "s" : ""})
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-[#94a3b8]">No reviews yet</span>
                    )}
                  </div>

                  <span className="text-[#cbd5e1]">•</span>

                  <span className="text-[#64748b]">
                    Member since {joinYear}
                  </span>

                  <span className="text-[#cbd5e1]">•</span>

                  <span className="font-semibold text-[#0f172a]">
                    {profile.completedContractsCount} contract{profile.completedContractsCount !== 1 ? "s" : ""} completed
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons (CV download) */}
            {profile.cvUrl && (
              <a
                href={resolveAssetUrl(profile.cvUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#334155]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CV
              </a>
            )}
          </div>
        </div>

        {/* Bio Card */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
          <h2 className="text-base font-extrabold text-[#0f172a]">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#475569] whitespace-pre-line">
            {profile.bio || "No bio yet."}
          </p>
        </div>

        {/* Skills Card */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
            <h2 className="text-base font-extrabold text-[#0f172a]">Skills & Expertise</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-[#dce5ef] bg-[#f0f8ff] px-3 py-1.5 text-xs font-bold text-[#4b6a8a]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <h2 className="text-base font-extrabold text-[#0f172a]">
              Reviews ({reviewsPagination.total})
            </h2>
          </div>

          {loadingReviews ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-[#f8fafc]" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-sm font-medium text-[#94a3b8]">
              No reviews yet.
            </div>
          ) : (
            <div className="mt-6 divide-y divide-[#f1f5f9]">
              {reviews.map((review) => (
                <div key={review.id || review._id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {review.reviewerProfilePicture ? (
                        <Image
                          src={resolveAssetUrl(review.reviewerProfilePicture)}
                          alt={review.reviewerName}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-10 w-10 rounded-full object-cover border border-[#cbd5e1]"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#38bdf8] text-xs font-bold text-white">
                          {review.reviewerInitials}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">
                          {review.reviewerName}
                        </p>
                        <p className="text-[11px] capitalize text-[#64748b]">
                          {review.reviewerRole}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <svg
                            key={idx}
                            className={`h-4 w-4 ${
                              idx < review.rating
                                ? "fill-[#f59e0b] text-[#f59e0b]"
                                : "fill-[#e2e8f0] text-[#e2e8f0]"
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-[#94a3b8]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[#334155]">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Reviews Pagination */}
          {!loadingReviews && reviewsPagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 pt-4 border-t border-[#f1f5f9]">
              <button
                disabled={reviewsPage <= 1}
                onClick={() => setReviewsPage((p) => p - 1)}
                className="rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs font-bold text-[#334155] disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-[#64748b]">
                Page {reviewsPagination.page} of {reviewsPagination.totalPages}
              </span>
              <button
                disabled={reviewsPage >= reviewsPagination.totalPages}
                onClick={() => setReviewsPage((p) => p + 1)}
                className="rounded-lg border border-[#cbd5e1] px-3 py-1.5 text-xs font-bold text-[#334155] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
