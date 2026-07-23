"use client";

import { useEffect, useState } from "react";
import { reviewApi, UserRatingSummary } from "../../lib/api/reviewApi";

export function UserRatingDisplay({
  token,
  userId,
  initialSummary,
  className = "",
}: {
  token?: string | null;
  userId?: string;
  initialSummary?: { averageRating?: number; totalReviews?: number };
  className?: string;
}) {
  const [summary, setSummary] = useState<UserRatingSummary | null>(() => {
    if (initialSummary && typeof initialSummary.averageRating === "number") {
      return {
        averageRating: initialSummary.averageRating,
        totalReviews: initialSummary.totalReviews ?? 0,
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSummary && typeof initialSummary.averageRating === "number") {
      setSummary({
        averageRating: initialSummary.averageRating,
        totalReviews: initialSummary.totalReviews ?? 0,
      });
      return;
    }

    if (!token || !userId) return;

    let isMounted = true;
    setLoading(true);
    reviewApi
      .getUserRatingSummary(token, userId)
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch(() => {
        // Silently fail
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, userId, initialSummary]);

  if (loading) {
    return <span className={`text-[11px] text-[#94a3b8] ${className}`}>Loading rating...</span>;
  }

  if (!summary || (summary.averageRating === 0 && summary.totalReviews === 0)) {
    return <span className={`text-[11px] font-medium text-[#94a3b8] ${className}`}>No reviews yet</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[12px] font-bold text-[#111d31] ${className}`}>
      <svg className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" viewBox="0 0 24 24">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {summary.averageRating.toFixed(1)}
      <span className="font-normal text-[#70829d]">({summary.totalReviews})</span>
    </span>
  );
}
