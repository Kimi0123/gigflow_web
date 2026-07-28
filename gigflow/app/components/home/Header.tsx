"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Hire Freelancers",
    href: "/register?role=client",
    submenu: [
      { label: "Browse All Freelancers", href: "/freelancers" },
      { label: "Client Dashboard", href: "/dashboard/client" },
      { label: "Post a Job", href: "/dashboard/client" },
    ],
  },
  {
    label: "Find Work",
    href: "/dashboard/freelancer",
    submenu: [
      { label: "Browse Job Marketplace", href: "/dashboard/freelancer" },
      { label: "Freelancer Dashboard", href: "/dashboard/freelancer" },
      { label: "Create Account", href: "/register?role=freelancer" },
    ],
  },
  {
    label: "Explore",
    href: "/freelancers",
    submenu: [
      { label: "Top Freelancers", href: "/freelancers" },
      { label: "Job Directory", href: "/dashboard" },
    ],
  },
];

export function Header() {
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 shadow-md"
          : "border-b border-slate-100 shadow-xs"
      }`}
    >
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="GigFlow home"
        >
          <Image
            src="/assets/logo.svg"
            alt="GigFlow"
            width={40}
            height={40}
            className="rounded-xl w-9 h-9 sm:w-10 sm:h-10"
            priority
          />
          <span className="text-xl sm:text-2xl font-extrabold text-[#111d31] tracking-tight">
            GigFlow
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => setOpenNav(item.label)}
              onMouseLeave={() => setOpenNav(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-[#38bdf8] py-2"
              >
                {item.label}
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-[#38bdf8]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="m3 6 5 5 5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* Submenu Dropdown */}
              {openNav === item.label && item.submenu && (
                <div className="absolute left-0 top-full z-50 w-56 pt-1">
                  <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xl py-1.5">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-[#38bdf8]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 transition hover:border-[#38bdf8] hover:text-[#38bdf8]"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#38bdf8] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#0ea5e9] hover:shadow-sky-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
            <svg
              viewBox="0 0 20 20"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden hover:bg-slate-100 transition"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden shadow-lg">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <div key={item.label} className="py-1">
                <Link
                  href={item.href}
                  className="block py-2 text-base font-bold text-slate-800 hover:text-[#38bdf8]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                <div className="pl-3 border-l-2 border-slate-100 flex flex-col space-y-1 mt-1">
                  {item.submenu?.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className="block py-1.5 text-xs font-medium text-slate-600 hover:text-[#38bdf8]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-3">
            <Link
              href="/login"
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-center text-xs font-bold text-slate-700 hover:border-[#38bdf8] hover:text-[#38bdf8]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-xl bg-[#38bdf8] py-2.5 text-center text-xs font-bold text-white hover:bg-[#0ea5e9]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
