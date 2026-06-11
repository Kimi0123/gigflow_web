"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAction } from "../../actions/authActions";
import type { RegisterFormValues } from "../../lib/validations/auth";

const initialForm: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  role: "freelancer",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormValues>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = <Key extends keyof RegisterFormValues>(
    key: Key,
    value: RegisterFormValues[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const result = await registerAction(form);

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }

    setFieldErrors({});
    setMessage("Account created. Taking you to login...");
    setForm(initialForm);
    window.setTimeout(() => router.push("/login"), 700);
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-28">
      <div className="w-full max-w-95">
        <div className="mb-8 flex gap-6 border-b border-gray-200">
          <Link
            href="/login"
            className="pb-3 text-xs font-semibold tracking-widest text-gray-400 transition-colors hover:text-gray-700"
          >
            LOG IN
          </Link>
          <Link
            href="/register"
            className="-mb-px border-b-2 border-gray-900 pb-3 text-xs font-semibold tracking-widest text-gray-900"
          >
            SIGN UP
          </Link>
        </div>

        <h1 className="mb-1 text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          Join GigFlow
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Start earning on your own terms today.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                FIRST NAME
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) =>
                  updateForm("firstName", event.target.value)
                }
                placeholder="First Name"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                LAST NAME
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => updateForm("lastName", event.target.value)}
                placeholder="Last Name"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

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
              I WANT TO
            </label>
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              <button
                type="button"
                onClick={() => updateForm("role", "freelancer")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest transition-colors ${
                  form.role === "freelancer"
                    ? "bg-sky-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                FIND WORK
              </button>
              <button
                type="button"
                onClick={() => updateForm("role", "client")}
                className={`flex-1 border-l border-gray-200 py-3 text-xs font-semibold tracking-widest transition-colors ${
                  form.role === "client"
                    ? "bg-sky-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                HIRE TALENT
              </button>
            </div>
            {fieldErrors.role && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.role}
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
                placeholder="Min. 8 characters"
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

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) =>
                  updateForm("confirmPassword", event.target.value)
                }
                placeholder="Repeat password"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={
                  showConfirm
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
              >
                <EyeIcon />
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(event) =>
                updateForm("acceptedTerms", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-sky-500"
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <Link
                href="#"
                className="text-gray-800 underline transition-colors hover:text-sky-500"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="text-gray-800 underline transition-colors hover:text-sky-500"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {fieldErrors.acceptedTerms && (
            <p className="-mt-3 text-xs font-medium text-red-600">
              {fieldErrors.acceptedTerms}
            </p>
          )}

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
            {isSubmitting ? "CREATING..." : "CREATE ACCOUNT"}
            <ArrowIcon />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already a member?{" "}
          <Link
            href="/login"
            className="font-semibold text-gray-900 hover:underline"
          >
            Log in
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
