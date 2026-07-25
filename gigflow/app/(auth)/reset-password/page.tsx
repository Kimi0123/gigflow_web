"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  resetPasswordAction,
  verifyResetCodeAction,
} from "../../actions/authActions";
import { useAuth } from "../../providers/AuthContext";
import type { ResetPasswordFormValues } from "../../lib/validations/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordFormContainer />
    </Suspense>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-28">
      <div className="w-full max-w-[380px] text-center">
        <p className="text-sm font-semibold text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function ResetPasswordFormContainer() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const urlCode = searchParams.get("code") || "";
  const { logout } = useAuth();

  const [step, setStep] = useState<"verify" | "setPassword">("verify");
  const [isAutoVerifying, setIsAutoVerifying] = useState(() => {
    return Boolean(urlEmail && urlCode);
  });

  const [email, setEmail] = useState(urlEmail);
  const [code, setCode] = useState(urlCode);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpiredOrInvalidToken, setIsExpiredOrInvalidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-verify on mount when both email and code are present in URL
  useEffect(() => {
    if (urlEmail && urlCode) {
      let isMounted = true;

      void (async () => {
        const result = await verifyResetCodeAction({
          email: urlEmail,
          code: urlCode,
        });

        if (!isMounted) return;

        setIsAutoVerifying(false);

        if (result.ok) {
          setStep("setPassword");
        } else {
          setIsExpiredOrInvalidToken(true);
          setErrorMessage("This reset code is invalid or has expired");
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [urlEmail, urlCode]);

  // Step 1: Verify Email + Code (Manual Entry)
  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setIsExpiredOrInvalidToken(false);

    const result = await verifyResetCodeAction({ email, code });

    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFieldErrors(result.fieldErrors);
        setErrorMessage(result.message);
      } else {
        setIsExpiredOrInvalidToken(true);
        setErrorMessage("This reset code is invalid or has expired");
      }
      return;
    }

    setFieldErrors({});
    setStep("setPassword");
  };

  // Step 2: Set New Password
  const handleResetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setIsExpiredOrInvalidToken(false);

    const formValues: ResetPasswordFormValues = {
      email,
      code,
      newPassword,
      confirmPassword,
    };

    const result = await resetPasswordAction(formValues);

    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFieldErrors(result.fieldErrors);
        setErrorMessage(result.message);
      } else {
        setIsExpiredOrInvalidToken(true);
        setErrorMessage("This reset code is invalid or has expired");
      }
      return;
    }

    // Always clear session on successful password reset
    logout();
    setIsSuccess(true);
  };

  // Render loading state while auto-verifying URL params
  if (isAutoVerifying) {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 pt-28">
        <div className="w-full max-w-[380px] text-center">
          <p className="text-sm font-semibold text-gray-500">
            Verifying your link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-28">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex gap-6 border-b border-gray-200">
          <span className="-mb-px border-b-2 border-gray-900 pb-3 text-xs font-semibold tracking-widest text-gray-900">
            {step === "verify" ? "VERIFY CODE" : "NEW PASSWORD"}
          </span>
        </div>

        <h1 className="mb-1 text-3xl font-extrabold uppercase tracking-tight text-gray-900">
          {step === "verify" ? "Verify Code." : "Set New Password."}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {step === "verify"
            ? "Enter your email and the 6-digit code sent to your inbox."
            : "Choose a strong password for your account."}
        </p>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">
                Your password has been successfully reset!
              </p>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500"
            >
              LOG IN NOW
              <ArrowIcon />
            </Link>
          </div>
        ) : isExpiredOrInvalidToken ? (
          <div className="rounded-md bg-red-50 p-6 border border-red-200 text-center space-y-4">
            <h2 className="text-base font-bold text-red-900">
              Code Expired or Invalid
            </h2>
            <p className="text-xs text-red-700 leading-relaxed">
              This password reset code is invalid or has expired (codes are valid for 1 hour).
            </p>
            <div className="flex flex-col gap-2">
              {step === "setPassword" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpiredOrInvalidToken(false);
                    setStep("verify");
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white py-2.5 text-xs font-semibold tracking-widest text-gray-700 transition-colors hover:bg-gray-50"
                >
                  RE-VERIFY CODE
                </button>
              )}
              <Link
                href="/forgot-password"
                className="inline-block w-full rounded-md bg-sky-400 py-3 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500"
              >
                REQUEST NEW CODE
              </Link>
            </div>
          </div>
        ) : step === "verify" ? (
          /* STEP 1: Verify Email + Code (Manual Entry) */
          <form className="space-y-5" onSubmit={handleVerifySubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                EMAIL ADDRESS
              </label>

              {urlEmail ? (
                /* Read-only locked email when arrived from link */
                <div className="space-y-1">
                  <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
                    <span className="truncate">{email}</span>
                    <span className="ml-2 shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Locked
                    </span>
                  </div>
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-sky-600 hover:underline"
                    >
                      Not you? Request a new link
                    </Link>
                  </div>
                </div>
              ) : (
                /* Editable email input when no URL param */
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrors((current) => ({ ...current, email: "" }));
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
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                RESET CODE
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.trim());
                  setFieldErrors((current) => ({ ...current, code: "" }));
                }}
                placeholder="6-digit code"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm font-mono tracking-wider text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              {fieldErrors.code && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.code}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {isSubmitting ? "VERIFYING..." : "VERIFY CODE"}
              <ArrowIcon />
            </button>
          </form>
        ) : (
          /* STEP 2: Set New Password */
          <form className="space-y-5" onSubmit={handleResetSubmit} noValidate>
            <div className="rounded-md bg-sky-50 p-3 border border-sky-100 flex items-center justify-between">
              <span className="text-xs text-sky-800 font-medium truncate">
                Resetting for: <strong>{email}</strong>
              </span>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                Code Verified
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setFieldErrors((current) => ({ ...current, newPassword: "" }));
                  }}
                  placeholder="At least 8 chars (letter + number)"
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
              {fieldErrors.newPassword && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-gray-500">
                CONFIRM PASSWORD
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
                }}
                placeholder="Re-enter new password"
                className="w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
              <ArrowIcon />
            </button>
          </form>
        )}
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
