"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="GigFlow home">
              <Image
                src="/assets/logo.svg"
                alt="GigFlow"
                width={36}
                height={36}
                className="rounded-lg w-9 h-9"
              />
              <span className="text-xl font-extrabold text-white tracking-tight">
                GigFlow
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              The modern freelance marketplace connecting businesses with verified talent across development, design, and marketing.
            </p>
            <div className="flex gap-3">
              {[
                {
                  label: "GitHub Repository",
                  href: "https://github.com",
                  icon: (
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  ),
                },
                {
                  label: "Twitter/X",
                  href: "https://x.com",
                  icon: (
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  ),
                },
              ].map((sn) => (
                <a
                  key={sn.label}
                  href={sn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sn.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#38bdf8] hover:text-white transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {sn.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              For Clients
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/dashboard/client" className="hover:text-sky-300 transition">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/client" className="hover:text-sky-300 transition">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/freelancers" className="hover:text-sky-300 transition">
                  Browse Freelancers
                </Link>
              </li>
              <li>
                <Link href="/register?role=client" className="hover:text-sky-300 transition">
                  Create Client Account
                </Link>
              </li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              For Freelancers
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/dashboard/freelancer" className="hover:text-sky-300 transition">
                  Freelancer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/freelancer" className="hover:text-sky-300 transition">
                  Browse Open Jobs
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-sky-300 transition">
                  Manage Profile
                </Link>
              </li>
              <li>
                <Link href="/register?role=freelancer" className="hover:text-sky-300 transition">
                  Create Freelancer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation & Account */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Account &amp; Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/login" className="hover:text-sky-300 transition">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-sky-300 transition">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/freelancers" className="hover:text-sky-300 transition">
                  Public Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-300 transition">
                  Role Router
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GigFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300 transition">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition">
              Terms
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
