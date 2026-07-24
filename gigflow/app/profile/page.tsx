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
          <div className="flex items-center gap-4">
            {user && (
              <Link
                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                href={`/freelancers/${user.id}`}
              >
                View Public Profile
              </Link>
            )}
            <Link className="text-sm font-semibold text-sky-600" href="/dashboard">
              Dashboard
            </Link>
          </div>
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
  const [title, setTitle] = useState(user.title || "");
  const [bio, setBio] = useState(user.bio || "");
  const [skills, setSkills] = useState(
    Array.isArray(user.skills) ? user.skills.join(", ") : ""
  );
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const result = await updateProfileAction(
      { firstName, lastName, phoneNumber, title, bio, skills },
      profilePicture,
      cvFile,
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
    setCvFile(null);
  };

  const parsedSkillsChips = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const removeSkillChip = (skillToRemove: string) => {
    const updated = parsedSkillsChips.filter(
      (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
    );
    setSkills(updated.join(", "));
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {user.profilePicture && (
        <div className="flex items-center gap-4">
          <Image
            src={resolveAssetUrl(user.profilePicture)}
            alt="Profile"
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 rounded-full object-cover border border-gray-200"
          />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Profile Photo
            </p>
            <p className="text-xs text-gray-400">Choose a new image below to update</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            First Name
          </label>
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Last Name
          </label>
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
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
          Phone Number
        </label>
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

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
          Professional Title
        </label>
        <input
          className={fieldClass}
          placeholder="e.g. Senior Full-Stack Developer"
          value={title}
          maxLength={100}
          onChange={(event) => {
            setTitle(event.target.value);
            setFieldErrors((current) => ({ ...current, title: "" }));
          }}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Bio
          </label>
          <span className="text-xs text-gray-400">{500 - bio.length} chars left</span>
        </div>
        <textarea
          rows={4}
          className={`${fieldClass} resize-none`}
          placeholder="Tell clients or freelancers about yourself, your background, and experience..."
          value={bio}
          maxLength={500}
          onChange={(event) => {
            setBio(event.target.value);
            setFieldErrors((current) => ({ ...current, bio: "" }));
          }}
        />
        {fieldErrors.bio && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.bio}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
          Skills (comma-separated)
        </label>
        <input
          className={fieldClass}
          placeholder="e.g. React, Next.js, Node.js, TypeScript"
          value={skills}
          onChange={(event) => {
            setSkills(event.target.value);
            setFieldErrors((current) => ({ ...current, skills: "" }));
          }}
        />
        {parsedSkillsChips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {parsedSkillsChips.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-md border border-[#dce5ef] bg-[#f0f8ff] px-2.5 py-1 text-[11px] font-bold text-[#4b6a8a]"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkillChip(s)}
                  className="ml-0.5 text-gray-400 hover:text-red-500"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        {fieldErrors.skills && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.skills}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
          Profile Photo
        </label>
        <input
          type="file"
          accept="image/*"
          className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 bg-white"
          onChange={(event) => setProfilePicture(event.target.files?.[0] || null)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
          CV / Resume (PDF)
        </label>
        {user.cvUrl && (
          <div className="mb-2 text-xs">
            <span className="text-gray-500">Current CV: </span>
            <a
              href={resolveAssetUrl(user.cvUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-600 underline hover:text-sky-700"
            >
              View Uploaded CV
            </a>
          </div>
        )}
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 bg-white"
          onChange={(event) => setCvFile(event.target.files?.[0] || null)}
        />
        {fieldErrors.cv && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.cv}
          </p>
        )}
      </div>

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
