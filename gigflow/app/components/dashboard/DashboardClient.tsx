"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import { categories, projects, projectTypes, skills } from "./dashboard.data";
import type { Project } from "./dashboard.types";

export default function DashboardClient() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All projects");
  const [checkedSkills, setCheckedSkills] = useState<string[]>(["Figma"]);

  const fullName = user
    ? user.fullName || `${user.firstName} ${user.lastName}`.trim()
    : "";

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesType =
        activeType === "All projects" || project.type === activeType;
      const matchesSkills =
        checkedSkills.length === 0 ||
        checkedSkills.some((skill) => project.tags.includes(skill));
      return matchesType && matchesSkills;
    });
  }, [activeType, checkedSkills]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSkill = (skill: string) => {
    setCheckedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  return (
    <main className="min-h-screen bg-white text-[#111d31]">
      <header className="sticky top-0 z-20 border-b border-[#e9eef5] bg-white/95 backdrop-blur">
        <div className="flex h-[58px] items-center gap-3 px-4 sm:px-7">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <Image src="/assets/logo.svg" alt="GigFlow" width={42} height={42} />
            <span className="text-[18px] font-extrabold text-black">GigFlow</span>
          </Link>

          <label className="relative hidden w-full max-w-[660px] md:block">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8191aa]" />
            <input
              className="h-[42px] w-full border border-[#d8e5ef] bg-[#eef8ff] pl-12 pr-4 text-[15px] text-[#50627f] outline-none placeholder:text-[#9caec1] focus:border-[#32b9f5]"
              placeholder="Search projects, skills, clients..."
            />
          </label>

          <div className="ml-auto flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#677894]">
            <Link href="#" className="hidden items-center gap-2 transition hover:text-[#28b7f7] sm:flex">
              <BriefcaseIcon className="h-4 w-4" />
              Post a job
            </Link>
            <button
              type="button"
              aria-label="Notifications"
              className="relative text-[#63748e] transition hover:text-[#28b7f7]"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#27baff]" />
            </button>
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-3 border border-[#d8edf9] bg-[#f4fbff] px-2 py-1.5 text-left transition hover:border-[#28b7f7] hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center bg-[#28b7f7] text-[12px] font-extrabold tracking-normal text-white">
                  {user?.firstName?.slice(0, 2).toUpperCase() || "AR"}
                </span>
                <span className="hidden min-w-0 pr-2 normal-case tracking-normal lg:block">
                  <span className="block max-w-[130px] truncate text-[13px] font-extrabold text-[#111d31]">
                    {fullName || "Account"}
                  </span>
                  <span className="block text-[11px] font-semibold capitalize text-[#72839a]">
                    {user?.role || "Member"}
                  </span>
                </span>
                <ChevronDownIcon className="hidden h-4 w-4 text-[#6d7f98] lg:block" />
              </button>

              <div className="invisible absolute right-0 top-full z-30 w-[230px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="border border-[#dfeaf3] bg-white p-2 shadow-[0_20px_50px_rgba(17,29,49,0.12)]">
                  <div className="border-b border-[#edf2f6] px-3 py-3">
                    <p className="truncate text-[14px] font-extrabold normal-case tracking-normal text-[#111d31]">
                      {fullName || "GigFlow User"}
                    </p>
                    <p className="truncate text-[12px] font-medium normal-case tracking-normal text-[#72839a]">
                      {user?.email || "Manage your account"}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="mt-2 flex items-center gap-3 px-3 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#5d6f8d] transition hover:bg-[#eef8ff] hover:text-[#28b7f7]"
                  >
                    <UserIcon className="h-4 w-4" />
                    Edit profile
                  </Link>
                  <Link
                    href="/profile/password"
                    className="flex items-center gap-3 px-3 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#5d6f8d] transition hover:bg-[#eef8ff] hover:text-[#28b7f7]"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-[#d94b4b] transition hover:bg-[#fff3f3]"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex h-[53px] items-end gap-5 overflow-x-auto px-4 sm:gap-9 sm:px-7">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`h-full border-b-2 px-6 text-[11px] font-bold uppercase tracking-[0.28em] transition ${
                activeCategory === category
                  ? "border-[#2ebaff] text-[#2ebaff]"
                  : "border-transparent text-[#6d7f98] hover:text-[#2ebaff]"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      </header>

      <div className="grid gap-8 px-4 py-9 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-7">
        <aside className="space-y-8">
          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.32em] text-[#70829d]">
              Project Type
            </p>
            <div className="space-y-2">
              {projectTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`h-[39px] w-full border px-4 text-left text-[14px] transition ${
                    activeType === type
                      ? "border-[#29b9fb] bg-[#f3fbff] text-[#20b8fa]"
                      : "border-[#e5e9ef] bg-white text-[#5d6f8d] hover:border-[#b9e8ff]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.32em] text-[#70829d]">
              Skills
            </p>
            <div className="space-y-3">
              {skills.map((skill) => (
                <label
                  key={skill}
                  className="flex cursor-pointer items-center gap-3 text-[14px] font-medium text-[#5d6f8d]"
                >
                  <input
                    type="checkbox"
                    checked={checkedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="h-4 w-4 appearance-none border border-[#dbe2eb] bg-white checked:border-[#2ebaff] checked:bg-[#2ebaff]"
                  />
                  {skill}
                </label>
              ))}
            </div>
          </section>

          <section className="border border-[#e8edf3] p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#70829d]">
              Saved Jobs
            </p>
            <p className="text-[30px] font-extrabold leading-none text-[#111d31]">
              1
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex text-[11px] font-bold uppercase tracking-[0.22em] text-[#27baff]"
            >
              View saved -
            </Link>
          </section>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full border border-[#e8edf3] py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70829d] transition hover:border-[#27baff] hover:text-[#27baff]"
          >
            Log out
          </button>
        </aside>

        <section className="min-w-0">
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-black uppercase leading-none tracking-[0.03em] text-[#111d31]">
                All Projects
              </h1>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#70829d]">
                {filteredProjects.length} Results
              </p>
            </div>

            <button
              type="button"
              className="flex h-[38px] w-[150px] items-center justify-center gap-2 border border-[#e5e9ef] text-[11px] font-bold uppercase tracking-[0.22em] text-[#70829d]"
            >
              Most Recent
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={`${project.company}-${project.budget}-${index}`}
                project={project}
                highlighted={index < 2}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectCard({
  project,
  highlighted,
}: {
  project: Project;
  highlighted: boolean;
}) {
  return (
    <article
      className={`relative border bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(17,29,49,0.08)] ${
        highlighted ? "border-[#29b9fb]" : "border-[#e8edf3]"
      }`}
    >
      <div className="flex gap-4 pr-10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#d7effd] bg-[#eaf8ff] text-[11px] font-black text-[#27baff]">
          {project.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#111d31]">
            <span>{project.company}</span>
            <VerifiedIcon className="h-4 w-4 text-[#28b7f7]" />
            <span className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-[#28b7f7] text-[#28b7f7]" />
              {project.rating}
            </span>
            <span className="text-[#7688a0]">({project.reviews})</span>
          </div>

          <h2 className="mt-5 text-[20px] font-black uppercase leading-tight tracking-[0.05em] text-[#111d31]">
            {project.title}
          </h2>
          <p className="mt-4 max-w-[1120px] text-[16px] leading-7 text-[#5e7190]">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[#d8e6f0] bg-[#eef7fc] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#60738e]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 border-t border-[#e8edf3] pt-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-5">
                <div className="border-r border-[#e8edf3] pr-6">
                  <p className="text-[19px] font-black text-[#111d31]">
                    {project.budget}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.26em] text-[#70829d]">
                    {project.type}
                  </p>
                </div>
                <MetaItem icon={<ClockIcon className="h-4 w-4" />} text={project.duration} />
                <MetaItem icon={<UsersIcon className="h-4 w-4" />} text={project.proposals} />
                <span className="text-[12px] font-medium text-[#8a9bb2]">
                  {project.posted}
                </span>
              </div>

              <Link
                href="#"
                className="flex h-10 w-[98px] items-center justify-center gap-2 bg-[#2eb8f4] text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#139fe0]"
              >
                Apply
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-7 top-6 flex items-start gap-2 text-right">
        <div>
          {project.featured && (
            <p className="text-[9px] font-black uppercase leading-none tracking-[0.34em] text-[#27baff]">
              Featured
            </p>
          )}
          <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-medium text-[#697b95]">
            <PinIcon className="h-3 w-3" />
            {project.location}
          </p>
        </div>
        <button type="button" aria-label="Save project" className="text-[#58708d]">
          <BookmarkIcon className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

function MetaItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#60738e]">
      {icon}
      {text}
    </span>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M4 7h16v13H4z" />
      <path d="M9 12h6" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 9.8 4.2 6.7 3.8 5.9 6.8 3.2 8.2 4.6 11 3.2 13.8 5.9 15.2 6.7 18.2 9.8 17.8 12 20l2.2-2.2 3.1.4.8-3 2.7-1.4-1.4-2.8 1.4-2.8-2.7-1.4-.8-3-3.1.4L12 2Zm-1.1 13.2-3-3 1.2-1.2 1.8 1.8 4-4 1.2 1.2-5.2 5.2Z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.4 7a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
