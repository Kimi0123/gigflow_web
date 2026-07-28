"use client";

const highlights = [
  {
    title: "Escrow Protection",
    desc: "Clients fund milestones safely, and payments are released upon contract approval.",
    icon: (
      <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Direct Proposals",
    desc: "Freelancers submit clear cover letters, bid amounts, and estimated delivery times.",
    icon: (
      <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "Contract Lifecycle",
    desc: "Track active jobs from proposal acceptance through completion and client review.",
    icon: (
      <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
        <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Integrated Chat",
    desc: "Real-time contract messaging with unread notification tracking across all active projects.",
    icon: (
      <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function PlatformHighlightsSection() {
  return (
    <section className="bg-gradient-to-br from-[#0f172a] via-[#1a3353] to-[#0c2340] py-14 sm:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-sky-400 mb-2">
            Built for Transparency
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How GigFlow Empowers Collaborators
          </h2>
        </div>

        {/* Grid of honest platform features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs transition hover:bg-white/10 hover:border-sky-400/40 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                {h.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{h.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
