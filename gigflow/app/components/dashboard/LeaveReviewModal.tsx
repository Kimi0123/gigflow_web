"use client";

import { useState } from "react";
import type { Contract } from "../../lib/api/contractApi";

export function LeaveReviewModal({
  contract,
  onClose,
  onSubmit,
}: {
  contract: Contract;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a comment for your review.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111d31]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-[#e9eef5] px-6 py-4">
          <div>
            <h2 className="text-[17px] font-black text-[#111d31]">Leave a Review</h2>
            <p className="text-[12px] text-[#70829d] truncate max-w-[280px]">{contract.jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#b91c1c]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <svg
                      className={`h-7 w-7 ${active ? "fill-[#f59e0b] text-[#f59e0b]" : "fill-none stroke-[#cbd5e1]"}`}
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                    >
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                );
              })}
              <span className="ml-2 text-[14px] font-bold text-[#111d31]">{hoverRating || rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">Feedback Comment</label>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience working on this contract..."
              className="w-full rounded-xl border border-[#dce5ef] p-3 text-[13px] text-[#111d31] outline-none transition focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-[#94a3b8]">{1000 - comment.length} characters remaining</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#dce5ef] px-4 py-2.5 text-[13px] font-bold text-[#6b7280] transition hover:bg-[#f7f8fa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#38bdf8] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#0ea5e9] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
