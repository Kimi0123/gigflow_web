"use client";

import Link from "next/link";

const services = [
  {
    title: "Website & Landing Page Design",
    category: "Graphics & Design",
    price: "Starting at Rs. 5,000",
    tags: ["Figma", "UI/UX"],
    badge: "Popular",
    badgeColor: "bg-sky-50 text-[#38bdf8] border-sky-200",
  },
  {
    title: "React & Next.js Web Application",
    category: "Programming & Tech",
    price: "Starting at Rs. 15,000",
    tags: ["React", "Next.js", "TypeScript"],
    badge: "Top Demand",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    title: "SEO Copywriting & Technical Articles",
    category: "Writing & Translation",
    price: "Starting at Rs. 2,500",
    tags: ["SEO", "Blog", "Docs"],
    badge: "Fast Turnaround",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    title: "Social Media Strategy & Content",
    category: "Digital Marketing",
    price: "Starting at Rs. 4,000",
    tags: ["Instagram", "Content", "Strategy"],
    badge: "Popular",
    badgeColor: "bg-sky-50 text-[#38bdf8] border-sky-200",
  },
  {
    title: "AI API & LLM Chatbot Integration",
    category: "AI Services",
    price: "Starting at Rs. 20,000",
    tags: ["Gemini", "GPT-4", "Node.js"],
    badge: "Trending",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    title: "Logo Design & Brand Guidelines",
    category: "Graphics & Design",
    price: "Starting at Rs. 3,000",
    tags: ["Branding", "Vector", "SVG"],
    badge: "Top Rated",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
];

export function PopularServicesSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-[#38bdf8] mb-2">
            Marketplace Services
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111d31] tracking-tight">
            High-Demand Offerings
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-3">
            Explore key project categories where GigFlow freelancers excel.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Link
              key={svc.title}
              href="/freelancers"
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-md group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {svc.category}
                  </p>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${svc.badgeColor}`}>
                    {svc.badge}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#111d31] group-hover:text-[#38bdf8] transition-colors mb-4 leading-snug">
                  {svc.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {svc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 mt-auto">
                <p className="text-xs font-bold text-[#111d31]">{svc.price}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-[#38bdf8]">
                  <span>Explore</span>
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
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
