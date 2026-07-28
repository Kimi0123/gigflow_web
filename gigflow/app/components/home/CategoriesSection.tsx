"use client";

import Link from "next/link";

const categories = [
  {
    name: "Programming & Tech",
    query: "Programming",
    color: "bg-blue-100/80 text-blue-600",
    borderHover: "hover:border-blue-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <polyline points="16 18 22 12 16 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="8 6 2 12 8 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Video & Animation",
    query: "Video",
    color: "bg-pink-100/80 text-pink-600",
    borderHover: "hover:border-pink-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m10 9 5 3-5 3V9Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "AI Services",
    query: "AI",
    color: "bg-indigo-100/80 text-indigo-600",
    borderHover: "hover:border-indigo-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3.5 9.5 12 12 20.5M12 3.5l2.5 8.5L12 20.5M3.5 12h17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Music & Audio",
    query: "Audio",
    color: "bg-amber-100/80 text-amber-600",
    borderHover: "hover:border-amber-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Business",
    query: "Business",
    color: "bg-emerald-100/80 text-emerald-600",
    borderHover: "hover:border-emerald-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <rect x="2" y="7" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Graphics & Design",
    query: "Design",
    color: "bg-orange-100/80 text-orange-600",
    borderHover: "hover:border-orange-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <circle cx="13.5" cy="6.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M13.5 10v4.5l-3 3-2-2 1-1-3-3 3.5-1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 15.5 4 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Digital Marketing",
    query: "Marketing",
    color: "bg-teal-100/80 text-teal-600",
    borderHover: "hover:border-teal-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Writing & Translation",
    query: "Writing",
    color: "bg-purple-100/80 text-purple-600",
    borderHover: "hover:border-purple-300",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7">
        <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function CategoriesSection() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-[#38bdf8] mb-2">
            Browse Categories
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111d31] tracking-tight">
            Explore Skills &amp; Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-3">
            Find qualified talent across technical and creative domains.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/freelancers?search=${encodeURIComponent(cat.query)}`}
              className={`flex flex-col justify-between p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${cat.borderHover} group`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                {cat.icon}
              </div>
              <div className="mt-auto">
                <p className="text-xs sm:text-sm font-bold text-[#111d31] leading-snug group-hover:text-[#38bdf8] transition-colors">
                  {cat.name}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-2">
                  <span>Browse</span>
                  <svg viewBox="0 0 16 16" className="w-3 h-3 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#38bdf8]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M8 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
