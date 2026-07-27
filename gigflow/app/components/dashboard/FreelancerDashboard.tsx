"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import {
  type FreelancerStats,
  type Job,
  type Proposal,
  type SubmitProposalPayload,
  ApiError,
  jobApi,
  proposalApi,
} from "../../lib/api/jobApi";
import { type Contract, contractApi } from "../../lib/api/contractApi";
import { reviewApi } from "../../lib/api/reviewApi";
import { resolveAssetUrl } from "../../lib/api/authApi";
import { UserRatingDisplay } from "../ui/UserRatingDisplay";
import { LeaveReviewModal } from "./LeaveReviewModal";
import DashboardHeader from "./DashboardHeader";
import MessagesTab from "./MessagesTab";

// ─── Constants ────────────────────────────────────────────────────────────────
const categoryTabs = ["All", "Development", "Design", "Writing", "Marketing", "AI Services"];
const budgetTypeFilters = ["All projects", "Fixed price", "Hourly"];
const skillFilters = ["React", "Node.js", "Figma", "TypeScript", "Python", "Branding", "SEO"];
const navItems = [
  { label: "Browse Jobs", href: "#" },
  { label: "My Proposals", href: "#" },
  { label: "Saved Jobs", href: "#" },
  { label: "My Contracts", href: "#" },
  { label: "Messages", href: "#" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FreelancerDashboard() {
  const { user, token } = useAuth();
  const [activeNav, setActiveNav] = useState("Browse Jobs");

  // Browse state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedSkills, setCheckedSkills] = useState<string[]>([]);

  // Proposals state
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Stats state
  const [stats, setStats] = useState<FreelancerStats | null>(null);

  // Contracts state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Real Saved Jobs state
  const [savedJobObjects, setSavedJobObjects] = useState<Job[]>([]);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);

  // Apply & Job details modal state
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<Job | null>(null);
  const [viewingJobDetails, setViewingJobDetails] = useState<Job | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const firstName = user?.firstName || "there";

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const savedJobIds = useMemo(
    () => new Set(savedJobObjects.map((j) => j.id)),
    [savedJobObjects]
  );

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoadingJobs(true);
    try {
      const result = await jobApi.browse(token, {
        category: activeCategory,
        budgetType:
          budgetFilter === "Fixed price"
            ? "fixed"
            : budgetFilter === "Hourly"
            ? "hourly"
            : undefined,
        skills: checkedSkills.join(","),
        search: searchQuery,
      });
      setJobs(result.jobs);
      setTotalJobs(result.total);
    } catch {
      showToast("error", "Failed to load jobs.");
    } finally {
      setLoadingJobs(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeCategory, budgetFilter, checkedSkills, searchQuery]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { void fetchJobs(); }, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchJobs, searchQuery]);

  const fetchSavedJobs = useCallback(async () => {
    if (!token) return;
    setLoadingSavedJobs(true);
    try {
      const data = await jobApi.savedJobs(token);
      setSavedJobObjects(data);
    } catch {
      showToast("error", "Failed to load saved jobs.");
    } finally {
      setLoadingSavedJobs(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const fetchProposals = useCallback(async () => {
    if (!token) return;
    setLoadingProposals(true);
    try {
      const data = await proposalApi.mine(token);
      setMyProposals(data);
      setAppliedJobIds(data.map((p) => p.jobId));
    } catch {
      showToast("error", "Failed to load proposals.");
    } finally {
      setLoadingProposals(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await proposalApi.stats(token);
      setStats(data);
    } catch {
      // silently fail
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeNav === "My Proposals") fetchProposals();
  }, [activeNav, fetchProposals]);

  const fetchContracts = useCallback(async () => {
    if (!token) return;
    setLoadingContracts(true);
    try {
      const data = await contractApi.getFreelancerContracts(token);
      setContracts(data);
    } catch {
      showToast("error", "Failed to load contracts.");
    } finally {
      setLoadingContracts(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeNav === "My Contracts" || activeNav === "Messages") fetchContracts();
  }, [activeNav, fetchContracts]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const toggleSave = async (job: Job) => {
    if (!token) return;
    const isSaved = savedJobIds.has(job.id);

    // Optimistic update
    if (isSaved) {
      setSavedJobObjects((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      setSavedJobObjects((prev) => [job, ...prev]);
    }

    try {
      if (isSaved) {
        await jobApi.unsave(token, job.id);
      } else {
        await jobApi.save(token, job.id);
      }
    } catch {
      // Rollback on failure
      if (isSaved) {
        setSavedJobObjects((prev) => [job, ...prev]);
      } else {
        setSavedJobObjects((prev) => prev.filter((j) => j.id !== job.id));
      }
      showToast("error", `Failed to ${isSaved ? "unsave" : "save"} job.`);
    }
  };

  const toggleSkill = (skill: string) =>
    setCheckedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const handleApplySuccess = (jobId: string, newProposal: Proposal) => {
    setAppliedJobIds((prev) => [...prev, jobId]);
    setMyProposals((prev) => [newProposal, ...prev]);
    setStats((prev) =>
      prev ? { ...prev, activeProposals: prev.activeProposals + 1 } : prev
    );
    setApplyingToJob(null);
    showToast("success", "Proposal submitted! The client will review it shortly.");
  };

  const handleWithdraw = async (proposalId: string, jobId: string) => {
    if (!token || !confirm("Withdraw this proposal?")) return;
    try {
      await proposalApi.withdraw(token, proposalId);
      setMyProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setAppliedJobIds((prev) => prev.filter((id) => id !== jobId));
      setStats((prev) =>
        prev ? { ...prev, activeProposals: Math.max(0, prev.activeProposals - 1) } : prev
      );
      showToast("success", "Proposal withdrawn.");
    } catch {
      showToast("error", "Failed to withdraw proposal.");
    }
  };

  const statCards = [
    { label: "Active Proposals", value: stats?.activeProposals ?? "—", icon: "send", color: "#38bdf8", bg: "#e0f7ff" },
    { label: "Jobs Won", value: stats?.jobsWon ?? "—", icon: "trophy", color: "#22c55e", bg: "#dcfce7" },
    { label: "Profile Views", value: "—", icon: "eye", color: "#818cf8", bg: "#ede9fe" },
    { label: "Saved Jobs", value: savedJobObjects.length, icon: "bookmark", color: "#f59e0b", bg: "#fef3c7" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader
        searchPlaceholder="Search jobs, skills, companies..."
        navItems={navItems}
        activeNav={activeNav}
        onNavClick={setActiveNav}
      />

      <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-7">
        {/* Welcome + stats */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[26px] font-black tracking-tight text-[#111d31]">
                Good day, {firstName} 
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <p className="text-[14px] text-[#6b7280]">
                  {totalJobs > 0 ? `${totalJobs} open jobs available for you.` : "Loading available jobs..."}
                </p>
                <UserRatingDisplay
                  initialSummary={{
                    averageRating: user?.averageRating,
                    totalReviews: user?.totalReviews,
                  }}
                />
              </div>
            </div>
            {/* Profile completion */}
            <div className="flex items-center gap-3 rounded-xl border border-[#dce5ef] bg-white px-4 py-3">
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="72 100" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#38bdf8]">72%</span>
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-[#111d31]">Profile Strength</p>
                <p className="text-[11px] text-[#70829d]">Add skills to boost visibility</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-[#e9eef5] bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: stat.bg }}>
                  <FStatIcon name={stat.icon} color={stat.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-[22px] font-black leading-none text-[#111d31]">{stat.value}</p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-[#70829d]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl border px-5 py-3.5 ${
            toast.type === "success" ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecaca] bg-[#fef2f2]"
          }`}>
            {toast.type === "success"
              ? <CheckCircleIcon className="h-5 w-5 text-[#22c55e]" />
              : <XCircleIcon className="h-5 w-5 text-[#dc2626]" />}
            <p className={`text-[14px] font-semibold ${toast.type === "success" ? "text-[#15803d]" : "text-[#b91c1c]"}`}>
              {toast.message}
            </p>
          </div>
        )}

        {/* Browse Jobs */}
        {activeNav === "Browse Jobs" && (
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="rounded-xl border border-[#e9eef5] bg-white p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70829d]">Search</p>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keyword..." className="w-full rounded-lg border border-[#dce5ef] py-2.5 pl-9 pr-3 text-[13px] text-[#374151] outline-none focus:border-[#38bdf8]" />
                </div>
              </div>

              <div className="rounded-xl border border-[#e9eef5] bg-white p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70829d]">Project Type</p>
                <div className="space-y-1.5">
                  {budgetTypeFilters.map((t) => (
                    <button key={t} type="button" onClick={() => setBudgetFilter(t)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                        budgetFilter === t ? "bg-[#e0f7ff] text-[#0284c7]" : "text-[#374151] hover:bg-[#f7f8fa]"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#e9eef5] bg-white p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70829d]">Filter by Skill</p>
                <div className="space-y-2.5">
                  {skillFilters.map((skill) => (
                    <label key={skill} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-[#374151]">
                      <div onClick={() => toggleSkill(skill)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                          checkedSkills.includes(skill) ? "border-[#38bdf8] bg-[#38bdf8]" : "border-[#d1d5db] bg-white"
                        }`}>
                        {checkedSkills.includes(skill) && (
                          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 6 3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </div>
                      {skill}
                    </label>
                  ))}
                </div>
                {checkedSkills.length > 0 && (
                  <button type="button" onClick={() => setCheckedSkills([])} className="mt-3 text-[11px] font-bold text-[#38bdf8] hover:text-[#0284c7]">
                    Clear filters
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-[#e9eef5] bg-white p-4">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#70829d]">Saved Jobs</p>
                <p className="text-[28px] font-black leading-none text-[#111d31]">{savedJobObjects.length}</p>
                <button type="button" onClick={() => setActiveNav("Saved Jobs")} className="mt-2 text-[11px] font-bold text-[#38bdf8] hover:text-[#0284c7]">
                  View saved →
                </button>
              </div>
            </aside>

            {/* Job feed */}
            <section>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {categoryTabs.map((cat) => (
                  <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 rounded-lg px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                      activeCategory === cat ? "bg-[#38bdf8] text-white" : "border border-[#e5e9ef] bg-white text-[#6b7280] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#70829d]">
                  <span className="font-extrabold text-[#111d31]">{loadingJobs ? "…" : jobs.length}</span> jobs found
                </p>
              </div>

              {loadingJobs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-[#e9eef5] bg-white p-6">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-[#f1f5f9]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-[#f1f5f9]" />
                          <div className="h-3 w-1/2 animate-pulse rounded bg-[#f1f5f9]" />
                          <div className="h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="rounded-2xl border border-[#e9eef5] bg-white py-16 text-center">
                  <SearchIcon className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
                  <p className="text-[15px] font-semibold text-[#94a3b8]">No jobs found</p>
                  <button type="button"
                    onClick={() => { setActiveCategory("All"); setBudgetFilter("All projects"); setSearchQuery(""); setCheckedSkills([]); }}
                    className="mt-3 text-[13px] font-bold text-[#38bdf8] underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      highlighted={i < 2}
                      isSaved={savedJobIds.has(job.id)}
                      isApplied={appliedJobIds.includes(job.id)}
                      onSave={() => toggleSave(job)}
                      onApply={() => setApplyingToJob(job)}
                      onViewDetails={() => setViewingJobDetails(job)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* My Proposals */}
        {activeNav === "My Proposals" && (
          <ProposalsTab
            proposals={myProposals}
            loading={loadingProposals}
            onWithdraw={handleWithdraw}
          />
        )}

        {/* Saved Jobs */}
        {activeNav === "Saved Jobs" && (
          <SavedJobsTab
            jobs={savedJobObjects}
            loading={loadingSavedJobs}
            onUnsave={(job) => toggleSave(job)}
            onApply={(job) => setApplyingToJob(job)}
            onViewDetails={(job) => setViewingJobDetails(job)}
            appliedJobs={appliedJobIds}
            savedJobIds={savedJobIds}
          />
        )}

        {/* My Contracts */}
        {activeNav === "My Contracts" && (
          <ContractsTab
            contracts={contracts}
            loading={loadingContracts}
            token={token}
            userId={user?.id || user?._id}
            onToast={showToast}
          />
        )}

        {/* Messages */}
        {activeNav === "Messages" && (
          <MessagesTab
            role="freelancer"
            contracts={contracts}
            onToast={showToast}
          />
        )}
      </div>

      {/* Job Details Modal */}
      {viewingJobDetails && (
        <JobDetailsModal
          job={viewingJobDetails}
          isSaved={savedJobIds.has(viewingJobDetails.id)}
          isApplied={appliedJobIds.includes(viewingJobDetails.id)}
          onClose={() => setViewingJobDetails(null)}
          onSave={() => toggleSave(viewingJobDetails)}
          onApply={() => {
            const targetJob = viewingJobDetails;
            setViewingJobDetails(null);
            setApplyingToJob(targetJob);
          }}
        />
      )}

      {/* Apply Modal */}
      {applyingToJob && token && (
        <ApplyModal
          job={applyingToJob}
          token={token}
          onClose={() => setApplyingToJob(null)}
          onSuccess={(proposal) => handleApplySuccess(applyingToJob.id, proposal)}
        />
      )}
    </main>
  );
}

// ─── Contracts Tab ────────────────────────────────────────────────────────────
function ContractsTab({
  contracts,
  loading,
  token,
  userId,
  onToast,
}: {
  contracts: Contract[];
  loading: boolean;
  token?: string | null;
  userId?: string;
  onToast: (type: "success" | "error", msg: string) => void;
}) {
  const [reviewedContractIds, setReviewedContractIds] = useState<string[]>([]);
  const [reviewingContract, setReviewingContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!token || !userId) return;
    const completed = contracts.filter((c) => c.status === "completed");
    if (completed.length === 0) return;

    let isMounted = true;
    Promise.all(
      completed.map(async (c) => {
        try {
          const reviews = await reviewApi.getContractReviews(token, c.id);
          const myReview = reviews.find((r) => r.reviewerId === userId);
          return myReview ? c.id : null;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (isMounted) {
        setReviewedContractIds(results.filter((id): id is string => id !== null));
      }
    });

    return () => { isMounted = false; };
  }, [token, userId, contracts]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!token || !reviewingContract) return;
    await reviewApi.submitReview(token, reviewingContract.id, { rating, comment });
    setReviewedContractIds((prev) => [...prev, reviewingContract.id]);
    onToast("success", "Review submitted successfully!");
  };

  return (
    <div className="rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#e9eef5] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[17px] font-extrabold text-[#111d31]">My Contracts</h2>
          <p className="text-[12px] text-[#70829d]">
            {contracts.length} contract{contracts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-px divide-y divide-[#f1f5f9]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5">
              <div className="h-5 w-2/3 animate-pulse rounded bg-[#f1f5f9]" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#f1f5f9]" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
            </div>
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[15px] font-semibold text-[#94a3b8]">No active contracts</p>
          <p className="mt-1 text-[13px] text-[#70829d]">
            When a client accepts your proposal, your contract will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#f1f5f9]">
          {contracts.map((contract) => {
            const isReviewed = reviewedContractIds.includes(contract.id);
            return (
              <div key={contract.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[16px] font-bold text-[#111d31]">{contract.jobTitle}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        contract.status === "completed"
                          ? "bg-[#dcfce7] text-[#166534]"
                          : contract.status === "cancelled"
                          ? "bg-[#fee2e2] text-[#991b1b]"
                          : "bg-[#e0f7ff] text-[#0369a1]"
                      }`}
                    >
                      {contract.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#6b7280]">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3.5 w-3.5" />
                      Client: {contract.clientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Agreed: Rs. {contract.agreedAmount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Started: {contract.startedAt}
                    </span>
                    {contract.completedAt && (
                      <span className="flex items-center gap-1 text-[#166534]">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Completed: {contract.completedAt}
                      </span>
                    )}
                  </div>
                </div>

                {contract.status === "completed" && (
                  <div className="flex shrink-0 items-center">
                    {isReviewed ? (
                      <span className="rounded-full border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1 text-[11px] font-bold text-[#64748b]">
                        Reviewed ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewingContract(contract)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#38bdf8] px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#0ea5e9]"
                      >
                        Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviewingContract && (
        <LeaveReviewModal
          contract={reviewingContract}
          onClose={() => setReviewingContract(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  job,
  highlighted,
  isSaved,
  isApplied,
  onSave,
  onApply,
  onViewDetails,
}: {
  job: Job;
  highlighted: boolean;
  isSaved: boolean;
  isApplied: boolean;
  onSave: () => void;
  onApply: () => void;
  onViewDetails?: () => void;
}) {
  // Generate a consistent colour from the company name
  const colors = ["#38bdf8", "#818cf8", "#34d399", "#fb923c", "#a855f7", "#f59e0b"];
  const colorIdx = (job.client.name?.charCodeAt(0) ?? 0) % colors.length;
  const avatarColor = colors[colorIdx];

  return (
    <article className={`relative rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(17,29,49,0.08)] ${
      highlighted ? "border-[#38bdf8] shadow-[0_0_0_1px_rgba(56,189,248,0.15)]" : "border-[#e9eef5]"
    }`}>
      <div className="flex gap-4">
        {job.client.profilePicture ? (
          <img
            src={resolveAssetUrl(job.client.profilePicture)}
            alt={job.client.name || "Client"}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-black text-white"
            style={{ background: avatarColor }}>
            {job.client.initials || "GF"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="font-bold text-[#374151]">{job.client.name || "GigFlow Client"}</span>
            <span className="text-[#9ca3af]">{job.postedAt}</span>
          </div>
          <h2
            onClick={onViewDetails}
            className="mt-2 text-[16px] font-extrabold leading-tight text-[#111d31] cursor-pointer hover:text-[#38bdf8] transition-colors"
          >
            {job.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6b7280]">{job.description}</p>

          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className="mt-1.5 text-[12px] font-bold text-[#38bdf8] hover:underline inline-flex items-center gap-1"
            >
              View full details →
            </button>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((tag) => (
              <span key={tag} className="rounded-md border border-[#dce5ef] bg-[#f0f8ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4b6a8a]">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 border-t border-[#f1f5f9] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-[12px]">
              <div className="border-r border-[#e5e9ef] pr-4">
                <p className="text-[16px] font-black text-[#111d31]">{job.budget}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#70829d]">{job.budgetType}</p>
              </div>
              <span className="flex items-center gap-1.5 text-[#70829d]"><ClockIcon className="h-3.5 w-3.5" />{job.duration}</span>
              <span className="flex items-center gap-1.5 text-[#70829d]"><UsersIcon className="h-3.5 w-3.5" />{job.proposalCount} proposal{job.proposalCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onSave} aria-label={isSaved ? "Unsave" : "Save job"}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  isSaved ? "border-[#38bdf8] bg-[#e0f7ff] text-[#0284c7]" : "border-[#e5e9ef] text-[#94a3b8] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                }`}>
                <BookmarkIcon className="h-4 w-4" filled={isSaved} />
              </button>
              {isApplied ? (
                <span className="flex items-center gap-1.5 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2 text-[12px] font-bold text-[#15803d]">
                  <CheckCircleIcon className="h-4 w-4" /> Applied
                </span>
              ) : (
                <button type="button" onClick={onApply}
                  className="flex items-center gap-1.5 rounded-lg bg-[#38bdf8] px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#0ea5e9]">
                  Apply Now <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Proposals Tab ────────────────────────────────────────────────────────────
function ProposalsTab({
  proposals, loading, onWithdraw,
}: {
  proposals: Proposal[]; loading: boolean; onWithdraw: (proposalId: string, jobId: string) => void;
}) {
  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: "Under Review", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
    accepted: { label: "Accepted 🎉", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    rejected: { label: "Not Selected", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    withdrawn: { label: "Withdrawn", color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
  };

  return (
    <div className="rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
      <div className="border-b border-[#e9eef5] p-5">
        <h2 className="text-[17px] font-extrabold text-[#111d31]">My Proposals</h2>
        <p className="text-[12px] text-[#70829d]">{proposals.length} submitted proposals</p>
      </div>
      {loading ? (
        <div className="divide-y divide-[#f1f5f9]">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse p-5"><div className="h-4 w-2/3 rounded bg-[#f1f5f9]" /></div>)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="py-16 text-center">
          <SendIcon className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" />
          <p className="text-[15px] font-semibold text-[#94a3b8]">No proposals yet</p>
          <p className="mt-1 text-[13px] text-[#94a3b8]">Browse jobs and submit your first proposal</p>
        </div>
      ) : (
        <div className="divide-y divide-[#f1f5f9]">
          {proposals.map((p) => {
            const s = statusConfig[p.status] ?? statusConfig.pending;
            return (
              <div key={p.id} className="flex flex-col gap-3 p-5 transition hover:bg-[#fafcff] sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-extrabold text-[#111d31]">{p.jobTitle}</h3>
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#70829d]">Submitted {p.submittedAt}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-right">
                    <p className="text-[16px] font-black text-[#111d31]">Rs. {p.bidAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#70829d]">Your Bid</p>
                  </div>
                  {p.status === "pending" && (
                    <button type="button" onClick={() => onWithdraw(p.id, p.jobId)}
                      className="rounded-lg border border-[#fecaca] px-3 py-1.5 text-[11px] font-bold text-[#dc2626] transition hover:bg-[#fef2f2]">
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Saved Jobs Tab ───────────────────────────────────────────────────────────
function SavedJobsTab({
  jobs,
  loading,
  onUnsave,
  onApply,
  onViewDetails,
  appliedJobs,
  savedJobIds,
}: {
  jobs: Job[];
  loading: boolean;
  onUnsave: (job: Job) => void;
  onApply: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  appliedJobs: string[];
  savedJobIds: Set<string>;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-[#e9eef5] bg-white p-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-[#f1f5f9]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#f1f5f9]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#f1f5f9]" />
                <div className="h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e9eef5] bg-white py-20 text-center">
        <BookmarkIcon className="mx-auto mb-3 h-10 w-10 text-[#cbd5e1]" filled={false} />
        <p className="text-[15px] font-semibold text-[#94a3b8]">No saved jobs yet</p>
        <p className="mt-1 text-[13px] text-[#94a3b8]">Bookmark jobs you like to find them here</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          highlighted={false}
          isSaved={savedJobIds.has(job.id)}
          isApplied={appliedJobs.includes(job.id)}
          onSave={() => onUnsave(job)}
          onApply={() => onApply(job)}
          onViewDetails={() => onViewDetails(job)}
        />
      ))}
    </div>
  );
}

// ─── Job Details Modal ────────────────────────────────────────────────────────
function JobDetailsModal({
  job,
  isSaved,
  isApplied,
  onClose,
  onSave,
  onApply,
}: {
  job: Job;
  isSaved: boolean;
  isApplied: boolean;
  onClose: () => void;
  onSave: () => void;
  onApply: () => void;
}) {
  const colors = ["#38bdf8", "#818cf8", "#34d399", "#fb923c", "#a855f7", "#f59e0b"];
  const avatarColor = colors[(job.client.name?.charCodeAt(0) ?? 0) % colors.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e9eef5] px-7 py-5">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {job.client.profilePicture ? (
              <img
                src={resolveAssetUrl(job.client.profilePicture)}
                alt={job.client.name || "Client"}
                className="h-10 w-10 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-black text-white"
                style={{ background: avatarColor }}
              >
                {job.client.initials || "GF"}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[18px] font-black text-[#111d31] leading-snug">{job.title}</h2>
              <p className="text-[12px] text-[#70829d]">
                Posted by <span className="font-bold text-[#374151]">{job.client.name || "GigFlow Client"}</span> · {job.postedAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Details body */}
        <div className="max-h-[65vh] overflow-y-auto space-y-6 px-7 py-6">
          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#e9eef5] bg-[#f7f8fa] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#70829d]">Budget</p>
              <p className="mt-0.5 text-[15px] font-black text-[#111d31]">{job.budget}</p>
              <p className="text-[11px] text-[#6b7280] uppercase font-semibold">{job.budgetType}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#70829d]">Duration</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#111d31] flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5 text-[#70829d]" /> {job.duration}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#70829d]">Proposals</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#111d31] flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5 text-[#70829d]" /> {job.proposalCount}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">Job Description</h3>
            <p className="text-[14px] leading-relaxed text-[#374151] whitespace-pre-line">{job.description}</p>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-[#dce5ef] bg-[#f0f8ff] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4b6a8a]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#e9eef5] px-7 py-4">
          <button
            type="button"
            onClick={onSave}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-bold transition ${
              isSaved
                ? "border-[#38bdf8] bg-[#e0f7ff] text-[#0284c7]"
                : "border-[#dce5ef] text-[#6b7280] hover:border-[#38bdf8] hover:text-[#38bdf8]"
            }`}
          >
            <BookmarkIcon className="h-4 w-4" filled={isSaved} />
            {isSaved ? "Saved" : "Save Job"}
          </button>

          {isApplied ? (
            <span className="flex items-center gap-1.5 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-2.5 text-[13px] font-bold text-[#15803d]">
              <CheckCircleIcon className="h-4 w-4" /> Applied
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onApply();
              }}
              className="flex items-center gap-2 rounded-xl bg-[#38bdf8] px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#0ea5e9]"
            >
              Apply Now <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({
  job, token, onClose, onSuccess,
}: {
  job: Job; token: string; onClose: () => void; onSuccess: (p: Proposal) => void;
}) {
  const [form, setForm] = useState<SubmitProposalPayload>({ coverLetter: "", bidAmount: 0, deliveryTime: "" });
  const [errors, setErrors] = useState<{ coverLetter?: string; bidAmount?: string; deliveryTime?: string; api?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const update = (key: keyof SubmitProposalPayload, val: string | number) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleGenerateDraft = async () => {
    if (form.coverLetter.trim().length > 0) {
      const confirmed = window.confirm(
        "This will replace your current cover letter with an AI-generated draft. Continue?"
      );
      if (!confirmed) return;
    }
    setIsGenerating(true);
    setErrors((p) => ({ ...p, api: "" }));
    try {
      const { draft } = await jobApi.generateProposalDraft(token, job.id);
      setForm((p) => ({ ...p, coverLetter: draft }));
      setErrors((p) => ({ ...p, coverLetter: "" }));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "AI draft generation is temporarily unavailable, please write your cover letter manually";
      setErrors((p) => ({ ...p, api: msg }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.coverLetter || form.coverLetter.length < 50) errs.coverLetter = "Please write at least 50 characters";
    if (!form.bidAmount || form.bidAmount <= 0) errs.bidAmount = "Enter a valid bid amount";
    if (!form.deliveryTime) errs.deliveryTime = "Delivery timeline is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const proposal = await proposalApi.submit(token, job.id, form);
      onSuccess(proposal);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to submit proposal. Try again.";
      setErrors({ api: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = ["#38bdf8", "#818cf8", "#34d399", "#fb923c", "#a855f7", "#f59e0b"];
  const avatarColor = colors[(job.client.name?.charCodeAt(0) ?? 0) % colors.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between border-b border-[#e9eef5] px-7 py-5">
          <div className="min-w-0 pr-4">
            <h2 className="text-[17px] font-black text-[#111d31]">Submit a Proposal</h2>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-[#70829d]">{job.title}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 border-b border-[#e9eef5] bg-[#f7f8fa] px-7 py-3.5">
          {job.client.profilePicture ? (
            <img
              src={resolveAssetUrl(job.client.profilePicture)}
              alt={job.client.name || "Client"}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white" style={{ background: avatarColor }}>
              {job.client.initials || "GF"}
            </div>
          )}
          <div>
            <p className="text-[13px] font-bold text-[#111d31]">{job.client.name || "GigFlow Client"}</p>
            <p className="text-[12px] text-[#70829d]">{job.budget} · {job.budgetType}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto space-y-5 px-7 py-5">
            {errors.api && (
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#b91c1c]">
                {errors.api}
              </div>
            )}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">
                  Cover Letter <span className="text-[#dc2626]">*</span>
                </label>
                <button
                  type="button"
                  id="generate-ai-draft-btn"
                  onClick={handleGenerateDraft}
                  disabled={isGenerating || isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl border border-[#dce5ef] px-3 py-1.5 text-[11px] font-bold text-[#6b7280] transition hover:border-[#38bdf8] hover:text-[#38bdf8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? (
                    <><SpinnerIcon className="h-3 w-3 animate-spin" /> Generating...</>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </button>
              </div>
              <textarea rows={6} value={form.coverLetter}
                onChange={(e) => update("coverLetter", e.target.value)}
                placeholder="Introduce yourself and explain why you're the best fit for this job..."
                className={`w-full resize-none rounded-xl border px-4 py-3 text-[14px] text-[#111d31] outline-none transition placeholder:text-[#9ca3af] focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 ${
                  errors.coverLetter ? "border-[#dc2626]" : "border-[#dce5ef]"
                }`} />
              <div className="mt-1 flex justify-between">
                {errors.coverLetter ? <p className="text-[11px] text-[#dc2626]">{errors.coverLetter}</p> : <span />}
                <p className="text-[11px] text-[#94a3b8]">{form.coverLetter.length} / 500</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">
                Your Bid (Rs.) <span className="text-[#dc2626]">*</span>
              </label>
              <p className="mb-2 text-[11px] text-[#70829d]">Client&apos;s budget: <span className="font-bold text-[#111d31]">{job.budget}</span></p>
              <input type="number" value={form.bidAmount || ""}
                onChange={(e) => update("bidAmount", Number(e.target.value))}
                placeholder={job.budgetType === "hourly" ? "Enter hourly rate" : "Enter total amount"}
                className={`w-full rounded-xl border px-4 py-3 text-[14px] text-[#111d31] outline-none transition focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 ${
                  errors.bidAmount ? "border-[#dc2626]" : "border-[#dce5ef]"
                }`} />
              {errors.bidAmount && <p className="mt-1 text-[11px] text-[#dc2626]">{errors.bidAmount}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#374151]">
                Delivery Timeline <span className="text-[#dc2626]">*</span>
              </label>
              <input type="text" value={form.deliveryTime}
                onChange={(e) => update("deliveryTime", e.target.value)}
                placeholder="e.g. 3 weeks, 2 months..."
                className={`w-full rounded-xl border px-4 py-3 text-[14px] text-[#111d31] outline-none transition focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 ${
                  errors.deliveryTime ? "border-[#dc2626]" : "border-[#dce5ef]"
                }`} />
              {errors.deliveryTime && <p className="mt-1 text-[11px] text-[#dc2626]">{errors.deliveryTime}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#e9eef5] px-7 py-4">
            <button type="button" onClick={onClose} className="text-[13px] font-bold text-[#6b7280] hover:text-[#374151]">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#38bdf8] px-7 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0ea5e9] disabled:opacity-60">
              {isSubmitting ? <><SpinnerIcon className="h-4 w-4 animate-spin" /> Submitting...</> : <><SendIcon className="h-4 w-4" /> Submit Proposal</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function FStatIcon({ name, color }: { name: string; color: string }) {
  const p = { style: { color }, className: "h-5 w-5" };
  if (name === "send") return <SendIcon {...p} />;
  if (name === "trophy") return <TrophyIcon {...p} />;
  if (name === "eye") return <EyeIcon {...p} />;
  if (name === "bookmark") return <BookmarkIcon {...p} filled={true} />;
  return null;
}
function SendIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function TrophyIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H3V4h18v5h-3M6 9a6 6 0 0 0 12 0M6 9H3M18 9h3M12 15v4M8 21h8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function EyeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function BookmarkIcon({ className, style, filled }: { className?: string; style?: React.CSSProperties; filled?: boolean }) { return <svg className={className} style={style} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>; }
function CheckCircleIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function XCircleIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" /></svg>; }
function ArrowRightIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>; }
function UsersIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" /></svg>; }
function SearchIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>; }
function XIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>; }
function SpinnerIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round" /></svg>; }
