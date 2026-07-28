"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

const popularSearches = [
  "Website Design",
  "React Developer",
  "Logo Design",
  "Content Writing",
  "Video Editing",
  "AI Integration",
];

export function HeroSection() {
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState("All Categories");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/freelancers?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/freelancers");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a3353] to-[#0c2340] min-h-[85vh] flex flex-col justify-center py-12 sm:py-20 lg:py-24">
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-15 pointer-events-none"
        src="/videos/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="GigFlow hero background video"
      />

      {/* Decorative radial gradients */}
      <div className="absolute -top-24 -right-24 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/12 blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tagline Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            The Modern Freelance Marketplace
          </span>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5">
            Find Skilled Freelancers.{" "}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Build Better Projects.
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal mb-8 sm:mb-10">
            GigFlow connects businesses and clients with verified talent across development, design, marketing, and writing—with escrow-backed security.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto max-w-3xl mb-6">
          <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-white/10 gap-2">
            <div className="flex items-center gap-3 flex-1 px-3 py-2 sm:py-0">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for a service or skill (e.g. React, UI/UX)..."
                className="w-full text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium outline-none bg-transparent"
                aria-label="Search services"
              />
            </div>

            <div className="hidden md:flex items-center border-l border-slate-200 px-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs sm:text-sm font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
                aria-label="Category filter"
              >
                <option value="All Categories">All Categories</option>
                <option value="Programming">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Writing">Writing</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#38bdf8] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0ea5e9] shrink-0"
            >
              <span>Search</span>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-10 text-xs text-slate-300">
          <span className="font-semibold text-slate-400 mr-1">Popular:</span>
          {popularSearches.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSearchValue(s);
                router.push(`/freelancers?search=${encodeURIComponent(s)}`);
              }}
              className="rounded-full bg-white/10 hover:bg-sky-500/20 hover:text-sky-300 border border-white/15 px-3 py-1 text-xs font-medium text-slate-200 transition cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#38bdf8] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-[#0ea5e9] hover:-translate-y-0.5"
          >
            Start Hiring Today
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                d="M4 10h12M10 4l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/30 bg-white/5 px-8 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-xs transition hover:bg-white/15 hover:border-white/50"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Honest Trust Indicator */}
        <div className="flex items-center justify-center gap-4 text-slate-300 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                viewBox="0 0 16 16"
                className="w-4 h-4 fill-amber-400"
              >
                <path d="m8 1.5 1.8 3.7 4 .6-2.9 2.8.7 4L8 10.4 4.4 12.6l.7-4L2.2 5.8l4-.6L8 1.5Z" />
              </svg>
            ))}
          </div>
          <span>Verified Client Ratings &amp; Escrow Payments</span>
        </div>
      </div>
    </section>
  );
}
