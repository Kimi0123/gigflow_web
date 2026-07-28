"use client";

const testimonials = [
  {
    name: "Daniel Rivera",
    role: "Startup Client",
    text: "GigFlow made it easy to post a job, review proposals, and accept a candidate within a day. The escrow milestones gave us total peace of mind.",
    initials: "DR",
    color: "bg-sky-400",
  },
  {
    name: "Emma Johansson",
    role: "Freelance Engineer",
    text: "Submitting proposals and tracking contract progress in one place is seamless. The instant notification system keeps communication smooth.",
    initials: "EJ",
    color: "bg-indigo-400",
  },
  {
    name: "Priya Sharma",
    role: "Product Lead",
    text: "Having direct access to completed contract reviews and rating summaries helps us choose the right freelancer for each new project.",
    initials: "PS",
    color: "bg-emerald-400",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-[#38bdf8] mb-2">
            User Experience
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111d31] tracking-tight">
            What Clients &amp; Freelancers Say
          </h2>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <svg viewBox="0 0 32 32" className="w-7 h-7 text-sky-200 mb-4" fill="currentColor">
                  <path d="M10 8C6.7 8 4 10.7 4 14v10h10V14H7c0-1.7 1.3-3 3-3V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
                </svg>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#111d31]">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
