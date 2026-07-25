"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPasswordAction } from "../../actions/authActions";
import type { ForgotPasswordFormValues } from "../../lib/validations/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    const result = await forgotPasswordAction({ email });

    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFieldErrors(result.fieldErrors);
        setMessage(result.message);
        return;
      }
    }

    // Always show generic success message on completion (backend is non-revealing)
    setFieldErrors({});
    setIsSuccess(true);
    setMessage(
      result.ok
        ? result.message
        : "If an account with that email exists, a reset link has been sent"
    );
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-28">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex gap-6 border-b border-gray-200">
          <Link
            href="/login"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-400 transition-colors hover:text-gray-700"
          >
            LOG IN
          </Link>
          <span className="-mb-px border-b-2 border-gray-900 pb-3 text-xs font-semibold tracking-widest text-gray-900">
            FORGOT PASSWORD
          </span>
        </div>

        <h1 className="mb-1 text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Reset Password.
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">{message}</p>
            </div>
            <p className="text-xs text-gray-500">
              Please check your inbox (and spam folder). The link will expire in 1 hour.
            </p>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500"
            >
              BACK TO LOG IN
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors({});
                  setMessage("");
                }}
                placeholder="you@domain.com"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {message && !isSuccess && (
              <p className="text-sm font-medium text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {isSubmitting ? "SENDING LINK..." : "SEND RESET LINK"}
              <ArrowIcon />
            </button>

            <p className="mt-8 text-center text-sm text-gray-500">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-900 hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
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
  );
}
