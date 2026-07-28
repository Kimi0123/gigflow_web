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

  // Top-up state
  const [topupAmount, setTopupAmount] = useState("1000");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState("1000");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    paymentApi
      .getWallet(token)
      .then(setWallet)
      .catch((err) => setError(err?.message || "Failed to load wallet."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const numAmount = Number(topupAmount);
    if (!numAmount || numAmount <= 0) {
      setTopupError("Please enter a valid positive amount.");
      return;
    }
    setTopupLoading(true);
    setTopupError(null);
    setTopupSuccess(null);
    try {
      const res = await paymentApi.mockTopup(token, numAmount);
      setWallet((prev) =>
        prev
          ? {
              balance: res.balance,
              transactions: [res.transaction, ...prev.transactions],
            }
          : null
      );
      setTopupSuccess(`Successfully added Rs. ${numAmount.toLocaleString()} (Demo).`);
      setTimeout(() => setTopupSuccess(null), 5000);
    } catch (err: any) {
      setTopupError(err?.message || "Failed to add funds.");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const numAmount = Number(withdrawAmount);
    if (!numAmount || numAmount <= 0) {
      setWithdrawError("Please enter a valid positive amount.");
      return;
    }
    setWithdrawLoading(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);
    try {
      const res = await paymentApi.withdraw(token, numAmount);
      setWallet((prev) =>
        prev
          ? {
              balance: res.balance,
              transactions: [res.transaction, ...prev.transactions],
            }
          : null
      );
      setWithdrawSuccess(`Successfully withdrew Rs. ${numAmount.toLocaleString()}.`);
      setTimeout(() => setWithdrawSuccess(null), 5000);
    } catch (err: any) {
      setWithdrawError(err?.message || "Failed to process withdrawal.");
    } finally {
      setWithdrawLoading(false);
    }
  };

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
        <div className="flex flex-col gap-6 border-b border-[#e9eef5] p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#70829d]">
              Wallet Balance
            </p>
            <p className="mt-2 text-[38px] font-black leading-none tracking-tight text-[#111d31]">
              Rs.{" "}
              <span>{balance.toLocaleString()}</span>
            </p>
            <p className="mt-2 text-[12px] text-[#94a3b8]">
              Available balance
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Mock Topup Form */}
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:w-72">
              <p className="text-[12px] font-extrabold text-[#1e293b]">
                Add Funds
              </p>
              <form onSubmit={handleTopup} className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#64748b]">
                    Amount (NPR)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-[13px] font-semibold text-[#0f172a] focus:border-[#60bb46] focus:outline-none focus:ring-1 focus:ring-[#60bb46]"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {topupError && (
                  <p className="text-[11px] font-semibold text-[#dc2626]">
                    {topupError}
                  </p>
                )}

                {topupSuccess && (
                  <p className="text-[11px] font-semibold text-[#16a34a]">
                    {topupSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={topupLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#60bb46] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#52a43b] disabled:opacity-60"
                >
                  {topupLoading ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing…
                    </>
                  ) : (
                    <>Add Funds (Demo)</>
                  )}
                </button>

                <p className="text-[10px] italic text-[#94a3b8]">
                  Demo only — no real payment gateway.
                </p>
              </form>
            </div>

            {/* Withdraw Form */}
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:w-72">
              <p className="text-[12px] font-extrabold text-[#1e293b]">
                Withdraw Funds
              </p>
              <form onSubmit={handleWithdraw} className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#64748b]">
                    Amount (NPR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-[13px] font-semibold text-[#0f172a] focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {withdrawError && (
                  <p className="text-[11px] font-semibold text-[#dc2626]">
                    {withdrawError}
                  </p>
                )}

                {withdrawSuccess && (
                  <p className="text-[11px] font-semibold text-[#16a34a]">
                    {withdrawSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0284c7] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-[#0369a1] disabled:opacity-60"
                >
                  {withdrawLoading ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing…
                    </>
                  ) : (
                    <>Withdraw</>
                  )}
                </button>

                <p className="text-[10px] italic text-[#94a3b8]">
                  Demo only — funds are not transferred to a real account.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex divide-x divide-[#f1f5f9] px-6 py-4">
          <div className="flex-1 pr-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#70829d]">
              Total Outgoing (Funded / Withdrawn)
            </p>
            <p className="mt-1 text-[17px] font-extrabold text-[#dc2626]">
              Rs.{" "}
              {transactions
                .filter((t) => t.type === "fund" || t.type === "withdraw")
                .reduce((s, t) => s + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="flex-1 pl-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#70829d]">
              Total Incoming (Received / Top-ups)
            </p>
            <p className="mt-1 text-[17px] font-extrabold text-[#16a34a]">
              Rs.{" "}
              {transactions
                .filter((t) => t.type === "release" || t.type === "topup")
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
              Fund a contract, top up funds, or withdraw to see activity here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {transactions.map((tx) => {
              const isIncoming = tx.type === "release" || tx.type === "topup";
              const label =
                tx.type === "fund"
                  ? "Contract Funded"
                  : tx.type === "release"
                  ? "Payment Received"
                  : tx.type === "topup"
                  ? "Wallet Top-up (Demo)"
                  : tx.type === "withdraw"
                  ? "Withdrawal (Demo)"
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
