"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import {
  type ClientStats,
  type Job,
  type JobStatus,
  type PostJobPayload,
  type Proposal,
  type UpdateJobPayload,
  ApiError,
  jobApi,
} from "../../lib/api/jobApi";
import DashboardHeader from "./DashboardHeader";

// ─── Constants ────────────────────────────────────────────────────────────────
const categoryOptions = [
  "Development", "Design", "Writing", "Marketing",
  "Video & Animation", "AI Services", "Music & Audio", "Business",
];
const durationOptions = [
  "Less than 1 week", "1–2 weeks", "1 month", "2–3 months",
  "3–6 months", "6+ months", "Ongoing",
];
const skillSuggestions = [
  "React", "Next.js", "TypeScript", "Node.js", "Python",
  "Figma", "UI/UX", "SEO", "Content Writing", "Branding",
  "After Effects", "TailwindCSS", "PostgreSQL", "AWS", "Machine Learning",
];
const navItems = [
  { label: "Overview", href: "#" },
  { label: "My Jobs", href: "#" },
  { label: "Proposals", href: "#" },
];

interface PostJobForm {
  title: string;
  description: string;
  category: string;
  budgetType: "fixed" | "hourly";
  budgetMin: string;
  budgetMax: string;
  skills: string;
  duration: string;
  status: "open" | "draft";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user, token } = useAuth();
  const [activeNav, setActiveNav] = useState("Overview");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const firstName = user?.firstName || "there";

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoadingJobs(true);
    try {
      const data = await jobApi.myJobs(token);
      setJobs(data);
    } catch {
      showToast("error", "Failed to load your jobs.");
    } finally {
      setLoadingJobs(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const data = await jobApi.clientStats(token);
      setStats(data);
    } catch {
      // silently fail stats
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

  const handlePostJob = async (payload: PostJobPayload) => {
    if (!token) return;
    const newJob = await jobApi.post(token, payload);
    setJobs((prev) => [newJob, ...prev]);
    setStats((prev) =>
      prev
        ? {
            ...prev,
            totalJobs: prev.totalJobs + 1,
            activeJobs: payload.status === "open" ? prev.activeJobs + 1 : prev.activeJobs,
          }
        : prev
    );
    showToast("success", "Job posted! Freelancers can now apply.");
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!token) return;
    try {
      await jobApi.delete(token, jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setStats((prev) =>
        prev ? { ...prev, totalJobs: Math.max(0, prev.totalJobs - 1) } : prev
      );
      showToast("success", "Job deleted.");
    } catch {
      showToast("error", "Failed to delete job.");
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    if (!token) return;
    try {
      const updated = await jobApi.update(token, jobId, { status });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch {
      showToast("error", "Failed to update job status.");
    }
  };

  const filteredJobs =
    statusFilter === "all" ? jobs : jobs.filter((j) => j.status === statusFilter);

  const statCards = [
    { label: "Total Jobs Posted", value: stats?.totalJobs ?? "—", icon: "briefcase", color: "#38bdf8", bg: "#e0f7ff" },
    { label: "Active Jobs", value: stats?.activeJobs ?? "—", icon: "circle-check", color: "#22c55e", bg: "#dcfce7" },
    { label: "Proposals Received", value: stats?.totalProposals ?? "—", icon: "users", color: "#818cf8", bg: "#ede9fe" },
    { label: "Freelancers Hired", value: stats?.hired ?? "—", icon: "star", color: "#f59e0b", bg: "#fef3c7" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader
        searchPlaceholder="Search your jobs, proposals..."
        navItems={navItems}
        activeNav={activeNav}
        onNavClick={setActiveNav}
      />

      <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-7">
        {/* Welcome */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[26px] font-black tracking-tight text-[#111d31]">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1 text-[14px] text-[#6b7280]">
              Manage your jobs, review proposals, and hire top freelancers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#38bdf8] px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#0ea5e9] hover:shadow-[0_8px_24px_rgba(56,189,248,0.35)]"
          >
            <PlusIcon className="h-4 w-4" />
            Post a New Job
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-5 py-3.5 ${
              toast.type === "success"
                ? "border-[#bbf7d0] bg-[#f0fdf4]"
                : "border-[#fecaca] bg-[#fef2f2]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5 text-[#22c55e]" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-[#dc2626]" />
            )}
            <p
              className={`text-[14px] font-semibold ${
                toast.type === "success" ? "text-[#15803d]" : "text-[#b91c1c]"
              }`}
            >
              {toast.message}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border border-[#e9eef5] bg-white p-5 shadow-sm"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: stat.bg }}
              >
                <StatIcon name={stat.icon} color={stat.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[22px] font-black leading-none text-[#111d31]">
                  {loadingStats ? (
                    <span className="inline-block h-5 w-10 animate-pulse rounded bg-[#e9eef5]" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="mt-1 truncate text-[11px] font-semibold text-[#70829d]">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs section */}
        <div className="rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#e9eef5] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[17px] font-extrabold text-[#111d31]">My Jobs</h2>
              <p className="text-[12px] text-[#70829d]">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "open", "closed", "draft"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                    statusFilter === s
                      ? "bg-[#38bdf8] text-white"
                      : "border border-[#e5e9ef] bg-white text-[#6b7280] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingJobs ? (
            <div className="space-y-px divide-y divide-[#f1f5f9]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#f1f5f9]" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#f1f5f9]" />
                  <div className="mt-4 h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center">
              <BriefcaseIcon className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
              <p className="text-[15px] font-semibold text-[#94a3b8]">No jobs found</p>
              <button
                type="button"
                onClick={() => setShowPostModal(true)}
                className="mt-4 text-[13px] font-bold text-[#38bdf8] underline"
              >
                Post your first job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {filteredJobs.map((job) => (
                <ClientJobCard
                  key={job.id}
                  job={job}
                  token={token!}
                  onDelete={() => handleDeleteJob(job.id)}
                  onStatusChange={(s) => handleStatusChange(job.id, s)}
                  onToast={showToast}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showPostModal && (
        <PostJobModal
          onClose={() => setShowPostModal(false)}
          onPost={handlePostJob}
        />
      )}
    </main>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function ClientJobCard({
  job,
  token,
  onDelete,
  onStatusChange,
  onToast,
}: {
  job: Job;
  token: string;
  onDelete: () => void;
  onStatusChange: (s: JobStatus) => void;
  onToast: (type: "success" | "error", msg: string) => void;
}) {
  const [showProposals, setShowProposals] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusConfig: Record<JobStatus, { label: string; color: string; bg: string; border: string }> = {
    open: { label: "Open", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    closed: { label: "Closed", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    draft: { label: "Draft", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  };
  const s = statusConfig[job.status];

  const loadProposals = async () => {
    if (showProposals) { setShowProposals(false); return; }
    setShowProposals(true);
    setLoadingProposals(true);
    try {
      const data = await jobApi.proposals(token, job.id);
      setProposals(data);
    } catch {
      onToast("error", "Failed to load proposals.");
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleAcceptReject = async (proposalId: string, action: "accepted" | "rejected") => {
    try {
      const updated = await jobApi.updateProposalStatus(token, proposalId, action);
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? updated : p)));
      if (action === "accepted") onStatusChange("closed");
      onToast("success", action === "accepted" ? "Freelancer hired!" : "Proposal rejected.");
    } catch {
      onToast("error", "Failed to update proposal.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this job and all its proposals?")) return;
    setDeleting(true);
    onDelete();
  };

  return (
    <div className="group p-5 transition hover:bg-[#fafcff]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[15px] font-extrabold text-[#111d31] transition group-hover:text-[#38bdf8]">
              {job.title}
            </h3>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
            >
              {s.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#70829d]">
            <span className="flex items-center gap-1"><TagIcon className="h-3.5 w-3.5" />{job.category}</span>
            <span className="flex items-center gap-1"><CurrencyIcon className="h-3.5 w-3.5" />{job.budget}</span>
            <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{job.duration}</span>
            <span className="text-[#94a3b8]">{job.postedAt}</span>
          </div>
          <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">
            {job.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span key={skill} className="rounded-md border border-[#dce5ef] bg-[#f0f8ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4b6a8a]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
          <div className="rounded-xl border border-[#dce5ef] bg-[#f7f8fa] px-4 py-3 text-center">
            <p className="text-[22px] font-black leading-none text-[#111d31]">{job.proposalCount}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#70829d]">Proposals</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadProposals}
              className="rounded-lg bg-[#38bdf8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#0ea5e9]"
            >
              {showProposals ? "Hide" : "View"}
            </button>
            {job.status === "open" && (
              <button
                type="button"
                onClick={() => onStatusChange("closed")}
                className="rounded-lg border border-[#e5e9ef] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6b7280] transition hover:border-[#f59e0b] hover:text-[#b45309]"
                title="Close job"
              >
                <LockIcon className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-lg border border-[#e5e9ef] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6b7280] transition hover:border-[#dc2626] hover:text-[#dc2626] disabled:opacity-50"
              title="Delete job"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Proposals Panel */}
      {showProposals && (
        <div className="mt-5 rounded-xl border border-[#dce5ef] bg-[#f7f9fc]">
          <div className="border-b border-[#dce5ef] px-4 py-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#70829d]">
              Proposals for this job
            </p>
          </div>
          {loadingProposals ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-[#e9eef5]" />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#94a3b8]">
              No proposals yet. Share your job link to get more applicants.
            </div>
          ) : (
            <div className="divide-y divide-[#e9eef5]">
              {proposals.map((p) => (
                <ProposalRow
                  key={p.id}
                  proposal={p}
                  onAccept={() => handleAcceptReject(p.id, "accepted")}
                  onReject={() => handleAcceptReject(p.id, "rejected")}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Proposal Row (client view) ───────────────────────────────────────────────
function ProposalRow({
  proposal,
  onAccept,
  onReject,
}: {
  proposal: Proposal;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "#92400e", bg: "#fffbeb" },
    accepted: { label: "Accepted", color: "#15803d", bg: "#f0fdf4" },
    rejected: { label: "Rejected", color: "#b91c1c", bg: "#fef2f2" },
    withdrawn: { label: "Withdrawn", color: "#374151", bg: "#f9fafb" },
  };
  const sc = statusConfig[proposal.status] ?? statusConfig.pending;
  const fl = proposal.freelancer;
  const initials = fl?.initials ?? "??";

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#38bdf8] text-[11px] font-black text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#111d31] truncate">
              {fl?.name ?? "Anonymous Freelancer"}
            </p>
            <p className="text-[11px] text-[#70829d]">{fl?.email}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="text-[15px] font-black text-[#111d31]">
              Rs. {proposal.bidAmount.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#70829d]">{proposal.deliveryTime}</p>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{ color: sc.color, background: sc.bg }}
          >
            {sc.label}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-[11px] font-bold text-[#38bdf8] transition hover:text-[#0284c7]"
      >
        {expanded ? "Hide cover letter ↑" : "Read cover letter ↓"}
      </button>

      {expanded && (
        <p className="mt-2 rounded-lg bg-white px-4 py-3 text-[13px] leading-relaxed text-[#374151] border border-[#e9eef5]">
          {proposal.coverLetter}
        </p>
      )}

      {proposal.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#16a34a]"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Hire
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex items-center gap-1.5 rounded-lg border border-[#fecaca] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#dc2626] transition hover:bg-[#fef2f2]"
          >
            <XIcon className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post Job Modal ────────────────────────────────────────────────────────────
function PostJobModal({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (payload: PostJobPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<PostJobForm>({
    title: "", description: "", category: "",
    budgetType: "fixed", budgetMin: "", budgetMax: "",
    skills: "", duration: "", status: "open",
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Partial<Record<keyof PostJobForm | "api", string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = <K extends keyof PostJobForm>(k: K, v: PostJobForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.description.trim() || form.description.trim().length < 50)
      e.description = "Please write at least 50 characters";
    if (!form.category) e.category = "Please select a category";
    return e;
  };
  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!form.budgetMin.trim() || isNaN(Number(form.budgetMin)))
      e.budgetMin = "Enter a valid budget";
    if (!form.duration) e.duration = "Please select a duration";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      await onPost({
        title: form.title,
        description: form.description,
        category: form.category,
        budgetType: form.budgetType,
        budgetMin: Number(form.budgetMin),
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        duration: form.duration,
        status: asDraft ? "draft" : "open",
      });
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to post job. Try again.";
      setErrors({ api: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between border-b border-[#e9eef5] px-7 py-5">
          <div>
            <h2 className="text-[19px] font-black text-[#111d31]">Post a New Job</h2>
            <p className="text-[12px] text-[#70829d]">Step {step} of 2</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="h-1 bg-[#f1f5f9]">
          <div className="h-full bg-[#38bdf8] transition-all duration-500" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="max-h-[70vh] overflow-y-auto px-7 py-6">
            {errors.api && (
              <div className="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#b91c1c]">
                {errors.api}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-5">
                <Field label="Job Title" required error={errors.title}>
                  <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Senior React Developer for E-Commerce App"
                    className={inputCls(!!errors.title)} />
                </Field>
                <Field label="Category" required error={errors.category}>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls(!!errors.category)}>
                    <option value="">Select a category</option>
                    {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Job Description" required error={errors.description}>
                  <textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe the work, requirements, deliverables..."
                    className={`${inputCls(!!errors.description)} resize-none`} />
                  <p className="mt-1 text-right text-[11px] text-[#94a3b8]">{form.description.length} chars</p>
                </Field>
                <Field label="Required Skills" hint="comma-separated">
                  <input type="text" value={form.skills} onChange={(e) => update("skills", e.target.value)}
                    placeholder="e.g. React, Node.js, TypeScript" className={inputCls(false)} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skillSuggestions.slice(0, 8).map((s) => (
                      <button key={s} type="button"
                        onClick={() => update("skills", form.skills ? `${form.skills}, ${s}` : s)}
                        className="rounded-md border border-[#dce5ef] bg-[#f7f8fa] px-2.5 py-1 text-[10px] font-semibold text-[#6b7280] transition hover:border-[#38bdf8] hover:text-[#38bdf8]">
                        + {s}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">Budget Type</label>
                  <div className="flex gap-3">
                    {(["fixed", "hourly"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => update("budgetType", t)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-bold transition ${
                          form.budgetType === t ? "border-[#38bdf8] bg-[#f0fbff] text-[#0284c7]" : "border-[#e5e9ef] text-[#6b7280]"
                        }`}>
                        {t === "fixed" ? "Fixed Price" : "Hourly Rate"}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Budget (Rs.)" required error={errors.budgetMin}>
                  <div className="flex gap-3">
                    <input type="number" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)}
                      placeholder="Min" className={`flex-1 ${inputCls(!!errors.budgetMin)}`} />
                    <span className="flex items-center text-[#94a3b8]">–</span>
                    <input type="number" value={form.budgetMax} onChange={(e) => update("budgetMax", e.target.value)}
                      placeholder="Max (optional)" className={`flex-1 ${inputCls(false)}`} />
                  </div>
                </Field>
                <Field label="Project Duration" required error={errors.duration}>
                  <select value={form.duration} onChange={(e) => update("duration", e.target.value)} className={inputCls(!!errors.duration)}>
                    <option value="">Select duration</option>
                    {durationOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <div className="rounded-xl border border-[#dce5ef] bg-[#f7f9fc] p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#70829d]">Preview</p>
                  <p className="text-[15px] font-extrabold text-[#111d31]">{form.title || "—"}</p>
                  <p className="mt-0.5 text-[12px] text-[#6b7280]">{form.category || "No category"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#e9eef5] px-7 py-4">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} className="text-[13px] font-bold text-[#6b7280] hover:text-[#38bdf8]">← Back</button>
            ) : (
              <button type="button" onClick={onClose} className="text-[13px] font-bold text-[#6b7280] hover:text-[#374151]">Cancel</button>
            )}

            {step === 1 ? (
              <button type="button" onClick={handleNext} className="flex items-center gap-2 rounded-xl bg-[#38bdf8] px-7 py-2.5 text-[13px] font-bold text-white hover:bg-[#0ea5e9]">
                Continue →
              </button>
            ) : (
              <div className="flex gap-2">
                <button type="button" disabled={isSubmitting} onClick={(e) => handleSubmit(e as never, true)}
                  className="rounded-xl border border-[#e5e9ef] px-5 py-2.5 text-[13px] font-bold text-[#6b7280] hover:border-[#94a3b8] disabled:opacity-50">
                  Save as Draft
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#38bdf8] px-7 py-2.5 text-[13px] font-bold text-white hover:bg-[#0ea5e9] disabled:opacity-60">
                  {isSubmitting ? <><SpinnerIcon className="h-4 w-4 animate-spin" /> Posting...</> : <><CheckIcon className="h-4 w-4" /> Post Job</>}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-[14px] text-[#111d31] outline-none transition placeholder:text-[#9ca3af] focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 ${
    hasError ? "border-[#dc2626]" : "border-[#dce5ef]"
  }`;

function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">
        {label} {required && <span className="text-[#dc2626]">*</span>}
        {hint && <span className="ml-1.5 text-[10px] font-normal normal-case text-[#94a3b8]">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-[#dc2626]">{error}</p>}
    </div>
  );
}

function StatIcon({ name, color }: { name: string; color: string }) {
  const p = { className: "h-5 w-5", style: { color } };
  if (name === "briefcase") return <BriefcaseIcon {...p} />;
  if (name === "circle-check") return <CheckCircleIcon {...p} />;
  if (name === "users") return <UsersIcon {...p} />;
  if (name === "star") return <StarIcon {...p} />;
  return null;
}

// Icons
function PlusIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>; }
function BriefcaseIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><rect x="2" y="7" width="20" height="14" rx="2" /></svg>; }
function CheckCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function UsersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" /></svg>; }
function StarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>; }
function TagIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" /></svg>; }
function CurrencyIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M14.5 8.5a3 3 0 0 0-5 2.2c0 2.5 5 2.5 5 5a3 3 0 0 1-5 .3" strokeLinecap="round" /><path d="M12 6v2M12 16v2" strokeLinecap="round" /></svg>; }
function ClockIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>; }
function TrashIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" strokeLinecap="round" /></svg>; }
function LockIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" /></svg>; }
function XIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>; }
function XCircleIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" /></svg>; }
function CheckIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function SpinnerIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round" /></svg>; }
