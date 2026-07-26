"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AdminUsersApiError,
  createAdminUserApi,
  deleteAdminUserApi,
  listAdminUsersApi,
  updateAdminUserApi,
  type AdminUser,
  type AdminUserPayload,
  type AdminUserRole,
  type AdminUsersMeta,
} from "../../../lib/api/adminUsersApi";
import { useAuth } from "../../../providers/AuthContext";

const limit = 10;
const blankForm: AdminUserPayload = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  role: "freelancer",
  password: "",
};

type FormMode = "create" | "edit";

type UserFormState = AdminUserPayload;

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token, isLoading: isAuthLoading, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminUsersMeta>({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<FormMode | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(blankForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadUsers = useCallback(async () => {
    if (!token || !isAdmin) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await listAdminUsersApi({ token, page, limit, search });
      setUsers(result.data);
      setMeta(result.meta);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, page, search, token]);

 useEffect(() => {
  if (!token || !isAdmin) return;

  const loadTimer = window.setTimeout(() => {
    void loadUsers();
  }, 0);

  return () => window.clearTimeout(loadTimer);
}, [isAdmin, loadUsers, token]);

  const pageSummary = useMemo(() => {
    if (meta.total === 0) return "0 users";
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return `${start}-${end} of ${meta.total} users`;
  }, [meta]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setForm(blankForm);
    setFieldErrors({});
    setFormError("");
  };

  const openEditModal = (nextUser: AdminUser) => {
    setModalMode("edit");
    setSelectedUser(nextUser);
    setForm({
      firstName: nextUser.firstName,
      lastName: nextUser.lastName,
      email: nextUser.email,
      phoneNumber: nextUser.phoneNumber,
      role: nextUser.role,
      password: "",
    });
    setFieldErrors({});
    setFormError("");
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalMode(null);
    setSelectedUser(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (form.firstName.trim().length < 2) errors.firstName = "First name must be at least 2 characters";
    if (form.lastName.trim().length < 2) errors.lastName = "Last name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email address";
    if (form.phoneNumber.trim().length < 5) errors.phoneNumber = "Phone number must be at least 5 characters";

    const password = form.password?.trim() || "";
    if (modalMode === "create" && password.length < 8) errors.password = "Password must be at least 8 characters";
    if (password && (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))) {
      errors.password = "Password must include at least one letter and one number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !modalMode || !validateForm()) return;

    setIsSaving(true);
    setFormError("");

    const payload: AdminUserPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      role: form.role,
      password: form.password?.trim() || undefined,
    };

    try {
      if (modalMode === "create") {
        await createAdminUserApi(payload, token);
        setPage(1);
      } else if (selectedUser) {
        await updateAdminUserApi(selectedUser.id, payload, token);
      }

      setModalMode(null);
      setSelectedUser(null);
      await loadUsers();
    } catch (saveError) {
      if (saveError instanceof AdminUsersApiError) {
        setFormError(saveError.message);
        setFieldErrors(saveError.fieldErrors);
      } else {
        setFormError(saveError instanceof Error ? saveError.message : "Unable to save user");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteAdminUserApi(deleteTarget.id, token);
      setDeleteTarget(null);
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (nextPage === page) await loadUsers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div>
      <div className="border-b border-[#e1e8f0] bg-white px-5 py-4 lg:px-8">
        <h1 className="text-[24px] font-black tracking-[0.02em]">User Management</h1>
      </div>

      <section className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Total Users" value={String(meta.total)} />
            <Metric label="Current Page" value={String(meta.page)} />
            <Metric label="Page Count" value={String(meta.totalPages)} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form className="flex min-w-0" onSubmit={handleSearch}>
              <label className="sr-only" htmlFor="user-search">Search users</label>
              <input
                id="user-search"
                className="h-11 w-full min-w-[220px] border border-[#d8e3ee] bg-white px-4 text-[14px] outline-none focus:border-[#28aee4] sm:w-[340px]"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email"
                value={searchInput}
              />
              <button className="h-11 border border-l-0 border-[#28aee4] bg-[#28aee4] px-5 text-[12px] font-black uppercase tracking-[0.16em] text-white" type="submit">
                Search
              </button>
            </form>
            <button className="h-11 bg-[#111d31] px-5 text-[12px] font-black uppercase tracking-[0.16em] text-white" onClick={openCreateModal} type="button">
              New User
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-[#f0c7c7] bg-[#fff5f5] px-4 py-3 text-[14px] font-semibold text-[#a93c3c]">
            {error}
          </div>
        )}

        <div className="overflow-hidden border border-[#dfe7f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#e8edf3] px-4 py-3">
            <p className="text-[13px] font-bold text-[#667893]">{pageSummary}</p>
            {isLoading && <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#28aee4]">Loading</p>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-[#f4f7fa] text-[11px] font-black uppercase tracking-[0.16em] text-[#687a93]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status / Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f6]">
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td className="px-4 py-12 text-center text-[14px] font-semibold text-[#6f8099]" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                )}

                {isLoading && users.length === 0 && (
                  <tr>
                    <td className="px-4 py-12 text-center text-[14px] font-semibold text-[#6f8099]" colSpan={6}>
                      Loading users...
                    </td>
                  </tr>
                )}

                {users.map((nextUser) => (
                  <tr className="text-[14px]" key={nextUser.id}>
                    <td className="px-4 py-4 font-mono text-[12px] text-[#63758e]">{nextUser.id.slice(-8)}</td>
                    <td className="px-4 py-4 font-bold text-[#111d31]">{nextUser.name}</td>
                    <td className="px-4 py-4 text-[#536782]">{nextUser.email}</td>
                    <td className="px-4 py-4"><RoleBadge role={nextUser.role} /></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="w-fit border border-[#cdebd9] bg-[#f0fbf4] px-2 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#247a43]">Active</span>
                        <span className="text-[12px] font-semibold text-[#6f8099]">{formatDate(nextUser.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="border border-[#d8e3ee] px-3 py-2 text-[12px] font-bold text-[#52647e]" onClick={() => openEditModal(nextUser)} type="button">
                          Edit
                        </button>
                        <button className="border border-[#f0caca] px-3 py-2 text-[12px] font-bold text-[#c64a4a]" onClick={() => setDeleteTarget(nextUser)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#e8edf3] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-semibold text-[#6f8099]">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button className="h-10 border border-[#d8e3ee] px-4 text-[12px] font-bold disabled:cursor-not-allowed disabled:opacity-45" disabled={page <= 1 || isLoading} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
                Previous
              </button>
              <button className="h-10 border border-[#d8e3ee] px-4 text-[12px] font-bold disabled:cursor-not-allowed disabled:opacity-45" disabled={page >= meta.totalPages || isLoading} onClick={() => setPage((value) => value + 1)} type="button">
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalMode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#111d31]/45 px-4 py-6">
          <div className="w-full max-w-[640px] border border-[#dfe7f0] bg-white shadow-[0_24px_80px_rgba(17,29,49,0.2)]">
            <div className="flex items-center justify-between border-b border-[#e8edf3] px-5 py-4">
              <h2 className="text-[20px] font-black">{modalMode === "create" ? "Create User" : "Edit User"}</h2>
              <button className="text-[22px] leading-none text-[#667893]" onClick={closeModal} type="button" aria-label="Close user form">
                x
              </button>
            </div>

            <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
              {formError && <div className="border border-[#f0c7c7] bg-[#fff5f5] px-3 py-2 text-[13px] font-semibold text-[#a93c3c]">{formError}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" error={fieldErrors.firstName}>
                  <input className="form-input" value={form.firstName} onChange={(event) => setForm((value) => ({ ...value, firstName: event.target.value }))} />
                </Field>
                <Field label="Last name" error={fieldErrors.lastName}>
                  <input className="form-input" value={form.lastName} onChange={(event) => setForm((value) => ({ ...value, lastName: event.target.value }))} />
                </Field>
                <Field label="Email" error={fieldErrors.email}>
                  <input className="form-input" type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} />
                </Field>
                <Field label="Phone" error={fieldErrors.phoneNumber}>
                  <input className="form-input" value={form.phoneNumber} onChange={(event) => setForm((value) => ({ ...value, phoneNumber: event.target.value }))} />
                </Field>
                <Field label="Role" error={fieldErrors.role}>
                  <select className="form-input" value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value as AdminUserRole }))}>
                    <option value="freelancer">Freelancer</option>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label={modalMode === "create" ? "Password" : "New password"} error={fieldErrors.password}>
                  <input className="form-input" type="password" value={form.password || ""} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} placeholder={modalMode === "edit" ? "Leave blank to keep current" : ""} />
                </Field>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e8edf3] pt-4">
                <button className="border border-[#d8e3ee] px-4 py-2 text-[12px] font-bold text-[#52647e]" onClick={closeModal} type="button">
                  Cancel
                </button>
                <button className="bg-[#111d31] px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60" disabled={isSaving} type="submit">
                  {isSaving ? "Saving" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111d31]/45 px-4 py-6">
          <div className="w-full max-w-[430px] border border-[#dfe7f0] bg-white p-5 shadow-[0_24px_80px_rgba(17,29,49,0.2)]">
            <h2 className="text-[20px] font-black">Delete user?</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#5f708a]">
              This will permanently delete {deleteTarget.name} ({deleteTarget.email}).
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button className="border border-[#d8e3ee] px-4 py-2 text-[12px] font-bold text-[#52647e]" disabled={isDeleting} onClick={() => setDeleteTarget(null)} type="button">
                Cancel
              </button>
              <button className="bg-[#c94a4a] px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-white disabled:opacity-60" disabled={isDeleting} onClick={handleDelete} type="button">
                {isDeleting ? "Deleting" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#dfe7f0] bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f8099]">{label}</p>
      <p className="mt-1 text-[24px] font-black text-[#111d31]">{value}</p>
    </div>
  );
}

function Field({ children, error, label }: { children: ReactNode; error?: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-black uppercase tracking-[0.14em] text-[#63758e]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[12px] font-semibold text-[#c94a4a]">{error}</span>}
    </label>
  );
}

function RoleBadge({ role }: { role: AdminUserRole }) {
  const className =
    role === "admin"
      ? "border-[#cfd6ff] bg-[#f2f4ff] text-[#3846a8]"
      : role === "client"
        ? "border-[#d6e4f8] bg-[#f2f7ff] text-[#28659f]"
        : "border-[#d8eadf] bg-[#f3fbf6] text-[#267549]";

  return <span className={`inline-flex px-2 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${className}`}>{role}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}


