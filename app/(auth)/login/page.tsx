"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-start justify-center pt-28 px-4">
      <div className="w-full max-w-[380px]">
        {/* Tab navigation */}
        <div className="flex gap-6 mb-8 border-b border-gray-200">
          <Link
            href="/login"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-900 border-b-2 border-gray-900 -mb-px"
          >
            LOG IN
          </Link>
          <Link
            href="/register"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
          >
            SIGN UP
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight mb-1">
          Welcome Back.
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Log in to your freelance dashboard.
        </p>

        {/* Form */}
        <div className="space-y-5">
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

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                defaultValue="••••••••••"
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

          {/* Remember me / Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 accent-sky-500"
              />
              <span className="text-xs font-semibold tracking-widest text-gray-500">
                REMEMBER ME
              </span>
            </label>
            <Link
              href="#"
              className="text-xs font-semibold tracking-widest text-gray-500 hover:text-gray-800 transition-colors"
            >
              FORGOT PASSWORD?
            </Link>
          </div>

          {/* Submit */}
          <button className="w-full bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold tracking-widest py-4 rounded-md transition-colors flex items-center justify-center gap-2">
            LOG IN
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

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button className="w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-3 rounded-md transition-colors flex items-center justify-center gap-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          New to Gigflow?{" "}
          <Link
            href="/register"
            className="text-gray-900 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
