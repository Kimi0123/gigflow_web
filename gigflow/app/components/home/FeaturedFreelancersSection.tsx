"use client";

import Link from "next/link";

const freelancers = [
  {
    name: "Sophia Kaur",
    role: "Full-Stack Developer",
    rate: "Rs. 8,500/hr",
    rating: 4.9,
    reviews: 24,
    skills: ["React", "Node.js", "PostgreSQL"],
    initials: "SK",
    color: "bg-sky-400",
    location: "Canada",
  },
  {
    name: "Marcus Chen",
    role: "UI/UX Designer",
    rate: "Rs. 7,000/hr",
    rating: 5.0,
    reviews: 18,
    skills: ["Figma", "Framer", "Tailwind"],
    initials: "MC",
    color: "bg-indigo-400",
    location: "Singapore",
  },
  {
    name: "Aaliya Patel",
    role: "AI/ML Engineer",
    rate: "Rs. 11,000/hr",
    rating: 4.8,
    reviews: 12,
    skills: ["Python", "TensorFlow", "LangChain"],
    initials: "AP",
    color: "bg-emerald-400",
    location: "India",
  },
  {
    name: "Liam Brooks",
    role: "Brand & Motion",
    rate: "Rs. 6,500/hr",
    rating: 4.9,
    reviews: 31,
    skills: ["After Effects", "Illustrator", "3D"],
    initials: "LB",
    color: "bg-orange-400",
    location: "United Kingdom",
  },
];

export function FeaturedFreelancersSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#38bdf8] mb-2">
              Top Talent
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111d31] tracking-tight">
              Featured Freelancers
            </h2>
          </div>
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#38bdf8] border border-sky-300 rounded-xl px-4 py-2 hover:bg-sky-50 transition"
          >
            Browse All Freelancers
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {freelancers.map((f) => (
            <div
              key={f.name}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-lg relative"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[11px] font-bold text-[#0284c7]">
                  Verified
                </span>
              </div>

              <div>
                {/* Avatar */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center text-sm font-black text-white shrink-0`}>
                    {f.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#111d31] leading-tight">
                      {f.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {f.role}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-amber-400">
                        <path d="m8 1.5 1.8 3.7 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.6l.7-4L2.2 5.8l4-.6L8 1.5Z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#111d31]">{f.rating}</span>
                  <span className="text-xs text-slate-400">({f.reviews})</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {f.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Rate</p>
                  <p className="text-base font-black text-[#111d31]">{f.rate}</p>
                </div>
                <Link
                  href="/register?role=client"
                  className="inline-flex items-center gap-1 bg-[#38bdf8] text-white rounded-lg px-3 py-1.5 text-xs font-bold transition hover:bg-[#0ea5e9]"
                >
                  Hire
                  <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
