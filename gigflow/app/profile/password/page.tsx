"use client";

import Link from "next/link";
import { useState } from "react";
import { updatePasswordAction } from "../../actions/authActions";
import { useAuth } from "../../providers/AuthContext";

const fieldClass =
  "w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400";

export default function PasswordUpdatePage() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const result = await updatePasswordAction(
      { currentPassword, newPassword, confirmPassword },
      token
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }

    setFieldErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(result.message);
  };

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Security
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">
              Change Password
            </h1>
          </div>
          <Link className="text-sm font-semibold text-sky-600" href="/profile">
            Profile
          </Link>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="password"
            className={fieldClass}
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, currentPassword: "" }));
            }}
          />
          {fieldErrors.currentPassword && (
            <p className="-mt-3 text-xs font-medium text-red-600">
              {fieldErrors.currentPassword}
            </p>
          )}
          <input
            type="password"
            className={fieldClass}
            placeholder="New password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, newPassword: "" }));
            }}
          />
          {fieldErrors.newPassword && (
            <p className="-mt-3 text-xs font-medium text-red-600">
              {fieldErrors.newPassword}
            </p>
          )}
          <input
            type="password"
            className={fieldClass}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
            }}
          />
          {fieldErrors.confirmPassword && (
            <p className="-mt-3 text-xs font-medium text-red-600">
              {fieldErrors.confirmPassword}
            </p>
          )}

          {message && <p className="text-sm font-medium text-gray-700">{message}</p>}

          <button
            disabled={isSubmitting}
            className="w-full rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500 disabled:bg-sky-300"
          >
            {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
      </section>
    </main>
  );
}
