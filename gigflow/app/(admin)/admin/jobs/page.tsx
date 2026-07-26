"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../providers/AuthContext";
import {
  AdminAnalyticsApiError,
  deleteJobApi,
} from "../../../lib/api/adminAnalyticsApi";
import { jobApi, type Job } from "../../../lib/api/jobApi";

export default function AdminJobsPage() {
  const { token } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadJobs = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await jobApi.browse(token, {
        page,
        search,
      });
      setJobs(result.jobs);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteJobApi(token, deleteTarget.id);
      setDeleteTarget(null);
      await loadJobs();
    } catch (err) {
      if (err instanceof AdminAnalyticsApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError(err instanceof Error ? err.message : "Unable to delete job");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div>
      <div className="border-b border-[#e1e8f0] bg-white px-5 py-4 lg:px-8">
        <h1 className="text-[24px] font-black tracking-[0.02em]">Job Moderation</h1>
      </div>

      <section className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-bold text-[#667893]">
              {total} job{total !== 1 ? "s" : ""} found
            </p>
          </div>

          <form className="flex min-w-0" onSubmit={handleSearch}>
            <input
              className="h-11 w-full min-w-[220px] border border-[#d8e3ee] bg-white px-4 text-[14px] outline-none focus:border-[#28aee4] sm:w-[320px]"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title or skill..."
              value={searchInput}
            />
            <button
              className="h-11 border border-l-0 border-[#28aee4] bg-[#28aee4] px-5 text-[12px] font-black uppercase tracking-[0.16em] text-white"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 border border-[#f0c7c7] bg-[#fff5f5] px-4 py-3 text-[14px] font-semibold text-[#a93c3c]">
            {error}
          </div>
        )}

        <div className="overflow-hidden border border-[#dfe7f0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-[#f4f7fa] text-[11px] font-black uppercase tracking-[0.16em] text-[#687a93]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f6]">
                {isLoading && jobs.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-[14px] font-semibold text-[#6f8099]"
                      colSpan={7}
                    >
                      Loading jobs...
                    </td>
                  </tr>
                )}

                {!isLoading && jobs.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-12 text-center text-[14px] font-semibold text-[#6f8099]"
                      colSpan={7}
                    >
                      No jobs found.
                    </td>
                  </tr>
                )}

                {jobs.map((job) => (
                  <tr className="text-[14px]" key={job.id}>
                    <td className="px-4 py-4 font-mono text-[12px] text-[#63758e]">
                      {job.id.slice(-8)}
                    </td>
                    <td className="px-4 py-4 font-bold text-[#111d31] max-w-[300px] truncate">
                      {job.title}
                    </td>
                    <td className="px-4 py-4 text-[#536782]">
                      {job.client?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#111d31]">
                      {job.budget}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.14em] ${
                          job.status === "open"
                            ? "border border-[#cdebd9] bg-[#f0fbf4] text-[#247a43]"
                            : job.status === "in-progress"
                            ? "border border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
                            : "border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#6f8099]">
                      {job.postedAt}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        className="border border-[#f0caca] px-3 py-1.5 text-[12px] font-bold text-[#c64a4a] transition hover:bg-[#fff5f5]"
                        onClick={() => {
                          setDeleteTarget(job);
                          setDeleteError("");
                        }}
                        type="button"
                      >
                        Delete Job
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111d31]/45 px-4 py-6">
          <div className="w-full max-w-[460px] border border-[#dfe7f0] bg-white p-6 shadow-[0_24px_80px_rgba(17,29,49,0.2)]">
            <h2 className="text-[20px] font-black text-[#111d31]">Delete Job?</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#5f708a]">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
            </p>

            {deleteError && (
              <div className="mt-4 border border-[#f0c7c7] bg-[#fff5f5] px-4 py-3 text-[13px] font-semibold text-[#a93c3c]">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="border border-[#d8e3ee] px-4 py-2 text-[12px] font-bold text-[#52647e] transition hover:bg-[#f4f7fa]"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="bg-[#c94a4a] px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#b83e3e] disabled:opacity-60"
                disabled={isDeleting}
                onClick={handleDelete}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
