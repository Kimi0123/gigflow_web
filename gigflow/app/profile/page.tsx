"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { updateProfileAction } from "../actions/authActions";
import { resolveAssetUrl, type AuthUser } from "../lib/api/authApi";
import { saveAuthSession } from "../lib/cookies/authCookies";
import { useAuth } from "../providers/AuthContext";

const fieldClass =
  "w-full rounded-md bg-[#EAF5FB] px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400";

export default function ProfilePage() {
  const { user, token, refreshUser, isLoading } = useAuth();

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <section className="mx-auto w-full max-w-xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">
              Update Profile
            </h1>
          </div>
          <Link className="text-sm font-semibold text-sky-600" href="/dashboard">
            Dashboard
          </Link>
        </div>

        {user && token ? (
          <ProfileForm
            key={user.id}
            user={user}
            token={token}
            refreshUser={refreshUser}
          />
        ) : (
          <p className="text-sm font-medium text-gray-700">
            {isLoading ? "Loading profile..." : "Please log in again."}
          </p>
        )}
      </section>
    </main>
  );
}

function ProfileForm({
  user,
  token,
  refreshUser,
}: {
  user: AuthUser;
  token: string;
  refreshUser: () => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const result = await updateProfileAction(
      { firstName, lastName, phoneNumber },
      profilePicture,
      token
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      setMessage(result.message);
      return;
    }

    saveAuthSession(token, result.data, true);
    await refreshUser();
    setFieldErrors({});
    setMessage(result.message);
    setProfilePicture(null);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {user.profilePicture && (
        <Image
          src={resolveAssetUrl(user.profilePicture)}
          alt="Profile"
          width={96}
          height={96}
          unoptimized
          className="h-24 w-24 rounded-full object-cover"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input
            className={fieldClass}
            placeholder="First name"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              setFieldErrors((current) => ({ ...current, firstName: "" }));
            }}
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {fieldErrors.firstName}
            </p>
          )}
        </div>
        <div>
          <input
            className={fieldClass}
            placeholder="Last name"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              setFieldErrors((current) => ({ ...current, lastName: "" }));
            }}
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <input
          className={fieldClass}
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            setFieldErrors((current) => ({ ...current, phoneNumber: "" }));
          }}
        />
        {fieldErrors.phoneNumber && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.phoneNumber}
          </p>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700"
        onChange={(event) => setProfilePicture(event.target.files?.[0] || null)}
      />

      {message && <p className="text-sm font-medium text-gray-700">{message}</p>}

      <button
        disabled={isSubmitting}
        className="w-full rounded-md bg-sky-400 py-4 text-xs font-semibold tracking-widest text-white transition-colors hover:bg-sky-500 disabled:bg-sky-300"
      >
        {isSubmitting ? "SAVING..." : "SAVE PROFILE"}
      </button>
    </form>
  );
}
