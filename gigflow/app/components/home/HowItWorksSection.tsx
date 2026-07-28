"use client";

const steps = [
  {
    step: "01",
    title: "Post a Job",
    desc: "Describe your project requirements, duration, and budget in minutes.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Review Proposals",
    desc: "Receive bid amounts and tailored cover letters from interested freelancers.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Hire & Collaborate",
    desc: "Accept proposals to launch an active contract with integrated messaging.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Complete & Review",
    desc: "Approve delivered work to complete the contract and exchange ratings.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-[#38bdf8] mb-2">
            Simple Process
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111d31] tracking-tight">
            How GigFlow Works in 4 Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-3">
            From job creation to contract fulfillment—GigFlow keeps every interaction organized.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Step Number Background */}
              <div className="absolute top-4 right-5 text-5xl font-black text-slate-200/80 select-none pointer-events-none">
                {step.step}
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#38bdf8] flex items-center justify-center mb-5">
                  {step.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#111d31] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
