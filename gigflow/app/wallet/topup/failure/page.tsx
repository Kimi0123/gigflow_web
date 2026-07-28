"use client";

import Link from "next/link";

export default function TopupFailurePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#e9eef5] bg-white p-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626] mx-auto mb-4">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[22px] font-black text-[#111d31]">Payment Cancelled or Failed</h2>
        <p className="mt-2 text-[14px] text-[#64748b] leading-relaxed">
          Your eSewa top-up request was not completed. No funds were added to your wallet. You can try again anytime.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-xl bg-[#38bdf8] px-8 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-[#0ea5e9] transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
