"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAction } from "../../actions/authActions";
import { useAuth } from "../../providers/AuthContext";
import type { LoginFormValues } from "../../lib/validations/auth";

const initialForm: LoginFormValues = {
  email: "",
  password: "",
  remember: true,
};

export default function LoginPage() {
  const { setSession } = useAuth();
  const [form, setForm] = useState<LoginFormValues>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = <Key extends keyof LoginFormValues>(
    key: Key,
    value: LoginFormValues[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const result = await loginAction(form);

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }

    setSession(result.data.token, result.data.user, form.remember);
    setFieldErrors({});
    setMessage("Login successful. Opening your dashboard...");
    window.setTimeout(() => window.location.replace("/dashboard"), 500);
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-28">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex gap-6 border-b border-gray-200">
          <Link
            href="/login"
            className="-mb-px border-b-2 border-gray-900 pb-3 text-xs font-semibold tracking-widest text-gray-900"
          >
            LOG IN
          </Link>
          <Link
            href="/register"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-400 transition-colors hover:text-gray-700"
          >
            SIGN UP
          </Link>
        </div>

        <h1 className="mb-1 text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Welcome Back.
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Log in to your freelance dashboard.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                placeholder="Your password"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon />
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(event) => updateForm("remember", event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-sky-500"
              />
              <span className="text-xs font-semibold tracking-widest text-gray-500">
                REMEMBER ME
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold tracking-widest text-gray-500 transition-colors hover:text-gray-800"
            >
              FORGOT PASSWORD?
            </Link>
          </div>

          {message && (
            <p
              className={`text-sm font-medium ${
                Object.keys(fieldErrors).some((key) => fieldErrors[key])
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isSubmitting ? "LOGGING IN..." : "LOG IN"}
            <ArrowIcon />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 py-3 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          New to Gigflow?{" "}
          <Link
            href="/register"
            className="font-semibold text-gray-900 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
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
  );
}
