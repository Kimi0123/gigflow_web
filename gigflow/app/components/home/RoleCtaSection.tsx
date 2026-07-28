"use client";

import Link from "next/link";

export function RoleCtaSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a3353] to-[#0c2340] text-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 shadow-2xl">
          {/* For Freelancers */}
          <div className="p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-sky-400 mb-3 block">
                For Freelancers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                Find Great Clients &amp; Work
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Browse open job listings, submit proposal bids, and manage active client contracts with secure escrow completion.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                    ✓
                  </span>
                  <span>Browse jobs across 50+ skill categories</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                    ✓
                  </span>
                  <span>AI-assisted proposal draft generation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                    ✓
                  </span>
                  <span>Build your public profile &amp; verified rating</span>
                </li>
              </ul>
            </div>
            <Link
              href="/register?role=freelancer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#38bdf8] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#0ea5e9] self-start"
            >
              <span>Join as Freelancer</span>
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* For Clients */}
          <div className="p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400 mb-3 block">
                For Clients
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                Hire Talent &amp; Launch Faster
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Post job listings, compare freelancer proposals, manage active contracts, and rate finished deliverables.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                    ✓
                  </span>
                  <span>Post jobs for free with flexible budget types</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                    ✓
                  </span>
                  <span>Review all applicant proposals in one view</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                    ✓
                  </span>
                  <span>Milestone escrow protection until approval</span>
                </li>
              </ul>
            </div>
            <Link
              href="/register?role=client"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-white/20 self-start"
            >
              <span>Post a Job Today</span>
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
