"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"find" | "hire">("find");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex min-h-screen items-start justify-center pt-28 px-4">
      <div className="w-full max-w-[380px]">
        {/* Tab navigation */}
        <div className="flex gap-6 mb-8 border-b border-gray-200">
          <Link
            href="/login"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
          >
            LOG IN
          </Link>
          <Link
            href="/register"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-900 border-b-2 border-gray-900 -mb-px"
          >
            SIGN UP
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight mb-1">
          Join GigFlow
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Start earning on your own terms today.
        </p>

        {/* Form */}
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-1.5">
              FULL NAME
            </label>
            <input
              type="text"
              placeholder="Alex Rivera"
              className="w-full bg-[#EAF5FB] rounded-md px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="you@domain.com"
              className="w-full bg-[#EAF5FB] rounded-md px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          {/* I want to toggle */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-1.5">
              I WANT TO
            </label>
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => setRole("find")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest transition-colors ${
                  role === "find"
                    ? "bg-sky-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                FIND WORK
              </button>
              <button
                type="button"
                onClick={() => setRole("hire")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest border-l border-gray-200 transition-colors ${
                  role === "hire"
                    ? "bg-sky-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                HIRE TALENT
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="w-full bg-[#EAF5FB] rounded-md px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-1.5">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                className="w-full bg-[#EAF5FB] rounded-md px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-sky-500"
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <Link href="#" className="underline text-gray-800 hover:text-sky-500 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline text-gray-800 hover:text-sky-500 transition-colors">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Submit */}
          <button className="w-full bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold tracking-widest py-4 rounded-md transition-colors flex items-center justify-center gap-2">
            CREATE ACCOUNT
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Already a member?{" "}
          <Link
            href="/login"
            className="text-gray-900 font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
