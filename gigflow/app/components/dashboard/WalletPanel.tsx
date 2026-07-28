"use client";

import { useEffect, useState } from "react";
import { paymentApi, type WalletSummary } from "../../lib/api/paymentApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
      <path d="M16 12a2 2 0 0 1 2-2h3v4h-3a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

// ─── WalletPanel ──────────────────────────────────────────────────────────────
export default function WalletPanel({ token }: { token?: string | null }) {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    paymentApi
      .getWallet(token)
      .then(setWallet)
      .catch((err) => setError(err?.message || "Failed to load wallet."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
        {/* Balance skeleton */}
        <div className="border-b border-[#e9eef5] p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-[#f1f5f9]" />
          <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[#f1f5f9]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#f1f5f9]" />
        </div>
        {/* Transaction skeletons */}
        <div className="divide-y divide-[#f1f5f9] p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-[#f1f5f9]" />
                <div className="space-y-1">
                  <div className="h-3 w-20 animate-pulse rounded bg-[#f1f5f9]" />
                  <div className="h-2.5 w-32 animate-pulse rounded bg-[#f1f5f9]" />
                </div>
              </div>
              <div className="h-4 w-20 animate-pulse rounded bg-[#f1f5f9]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-8 text-center shadow-sm">
        <p className="text-[14px] font-semibold text-[#b91c1c]">{error}</p>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions ?? [];

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
        <div className="flex items-start justify-between border-b border-[#e9eef5] p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#70829d]">
              Wallet Balance
            </p>
            <p className="mt-2 text-[38px] font-black leading-none tracking-tight text-[#111d31]">
              Rs.{" "}
              <span>{balance.toLocaleString()}</span>
            </p>
            <p className="mt-2 text-[12px] text-[#94a3b8]">
              Available for funding contracts
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f7ff]">
            <WalletIcon className="h-6 w-6 text-[#0284c7]" />
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex divide-x divide-[#f1f5f9] px-6 py-4">
          <div className="flex-1 pr-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#70829d]">
              Total Funded
            </p>
            <p className="mt-1 text-[17px] font-extrabold text-[#dc2626]">
              Rs.{" "}
              {transactions
                .filter((t) => t.type === "fund")
                .reduce((s, t) => s + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="flex-1 pl-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#70829d]">
              Total Received
            </p>
            <p className="mt-1 text-[17px] font-extrabold text-[#16a34a]">
              Rs.{" "}
              {transactions
                .filter((t) => t.type === "release")
                .reduce((s, t) => s + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
        <div className="border-b border-[#e9eef5] p-5">
          <h2 className="text-[17px] font-extrabold text-[#111d31]">
            Transaction History
          </h2>
          <p className="text-[12px] text-[#70829d]">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="py-16 text-center">
            <WalletIcon className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
            <p className="text-[15px] font-semibold text-[#94a3b8]">
              No transactions yet
            </p>
            <p className="mt-1 text-[13px] text-[#70829d]">
              Fund a contract to see activity here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {transactions.map((tx) => {
              const isIncoming = tx.type === "release";
              const label =
                tx.type === "fund"
                  ? "Contract Funded"
                  : tx.type === "release"
                  ? "Payment Received"
                  : "Refund";
              const date = new Date(tx.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isIncoming
                          ? "bg-[#dcfce7] text-[#16a34a]"
                          : "bg-[#fee2e2] text-[#dc2626]"
                      }`}
                    >
                      {isIncoming ? (
                        <ArrowDownIcon className="h-4 w-4" />
                      ) : (
                        <ArrowUpIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#111d31]">
                        {label}
                      </p>
                      <p className="text-[11px] text-[#94a3b8]">{date}</p>
                    </div>
                  </div>
                  <p
                    className={`text-[14px] font-extrabold ${
                      isIncoming ? "text-[#16a34a]" : "text-[#dc2626]"
                    }`}
                  >
                    {isIncoming ? "+" : "−"} Rs.{" "}
                    {tx.amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
