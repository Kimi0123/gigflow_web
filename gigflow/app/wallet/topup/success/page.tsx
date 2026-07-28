"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { paymentApi, type VerifyTopupResult } from "../../../lib/api/paymentApi";

function TopupSuccessContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyTopupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataParam) {
      setError("Missing payment data parameter.");
      setLoading(false);
      return;
    }

    paymentApi
      .verifyTopup(dataParam)
      .then((res) => {
        setResult(res);
      })
      .catch((err) => {
        setError(err?.message || "Failed to verify eSewa payment.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dataParam]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#60bb46] border-t-transparent mb-4" />
        <h2 className="text-[18px] font-bold text-[#1e293b]">Verifying eSewa Payment...</h2>
        <p className="mt-1 text-[13px] text-[#64748b]">Please wait while we confirm your top-up.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626] mb-4">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 className="text-[20px] font-extrabold text-[#111d31]">Payment Verification Failed</h2>
        <p className="mt-2 text-[14px] font-semibold text-[#dc2626] max-w-md">{error}</p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-xl bg-[#38bdf8] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#0ea5e9] transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a] mb-4">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 className="text-[22px] font-black text-[#111d31]">Top-up Successful!</h2>
      <p className="mt-1 text-[14px] text-[#64748b]">
        Your eSewa payment of <span className="font-extrabold text-[#111d31]">Rs. {result?.transaction.amount.toLocaleString()}</span> has been added to your wallet.
      </p>

      <div className="mt-6 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-8 py-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#70829d]">Updated Wallet Balance</p>
        <p className="mt-1 text-[32px] font-black text-[#16a34a]">Rs. {result?.balance.toLocaleString()}</p>
      </div>

      <Link
        href="/dashboard"
        className="mt-8 rounded-xl bg-[#60bb46] px-8 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-[#52a43b] transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default function TopupSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#e9eef5] bg-white p-6 shadow-sm">
        <Suspense fallback={
          <div className="p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#60bb46] border-t-transparent mx-auto mb-2" />
            <p className="text-[13px] text-[#64748b]">Loading...</p>
          </div>
        }>
          <TopupSuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
