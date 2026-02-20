"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { ResumeData } from "@/lib/resumeSchema";

type RepositorySummary = {
  id: string;
  name: string;
  latestVersionId: string | null;
  updatedAt?: string | null;
};

const defaultData: ResumeData = {
  basics: { name: "Your Name", email: "", phone: "", location: "", website: "", summary: "" },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
};

export default function Page() {
  const { status } = useSession();
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [newRepoName, setNewRepoName] = useState("");
  const [openMenuRepoId, setOpenMenuRepoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRepositories() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/repositories", { method: "GET" });
      if (!res.ok) throw new Error("Failed to load repositories.");
      const payload = await res.json();
      setRepositories((payload.repositories ?? []) as RepositorySummary[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load repositories.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    void loadRepositories();
  }, [status]);

  async function handleCreateRepository() {
    const name = newRepoName.trim() || `Resume Repo ${repositories.length + 1}`;
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, initialData: defaultData }),
      });
      if (!res.ok) throw new Error("Failed to create repository.");

      const payload = await res.json();
      const repo = payload.repository as { id: string; name: string; latestVersionId: string };
      setRepositories((prev) => [{ id: repo.id, name: repo.name, latestVersionId: repo.latestVersionId }, ...prev]);
      setNewRepoName("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create repository.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteRepository(repoId: string) {
    const confirmed = window.confirm("Delete this repository and all versions?");
    if (!confirmed) return;

    setError(null);
    try {
      const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete repository.");

      setRepositories((prev) => prev.filter((repo) => repo.id !== repoId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete repository.");
    }
  }

  async function handleRenameRepository(repo: RepositorySummary) {
    const nextName = window.prompt("Rename repository", repo.name)?.trim();
    if (!nextName || nextName === repo.name) return;

    setError(null);
    try {
      const res = await fetch(`/api/repositories/${encodeURIComponent(repo.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      if (!res.ok) throw new Error("Failed to rename repository.");
      setRepositories((prev) => prev.map((item) => (item.id === repo.id ? { ...item, name: nextName } : item)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to rename repository.");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Repositories</p>
            <h1 className="text-lg font-bold sm:text-xl">LaTeX Resume Builder</h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="w-full text-sm font-medium text-slate-700">
              New Repository
              <input
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="e.g. SWE-Backend-Resume"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <button
              onClick={() => void handleCreateRepository()}
              disabled={isCreating}
              className="h-10 w-full rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:min-w-44 sm:w-auto"
            >
              {isCreating ? "Creating..." : "Create Repository"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Repositories</h2>
            <span className="text-sm text-slate-500">{repositories.length} total</span>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-600">Loading repositories...</p>
          ) : repositories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">No repositories yet. Create one to start editing.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {repositories.map((repo) => (
                <div key={repo.id} className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/repositories/${repo.id}`}
                      className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                    >
                      {repo.name}
                    </Link>
                    <p className="truncate text-xs text-slate-500">ID: {repo.id}</p>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-2 sm:static sm:shrink-0">
                    <button
                      onClick={() => setOpenMenuRepoId((prev) => (prev === repo.id ? null : repo.id))}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm leading-none text-slate-700 hover:bg-slate-50"
                      aria-label="Repository actions"
                    >
                      ⋯
                    </button>
                  </div>
                  {openMenuRepoId === repo.id && (
                    <div className="absolute right-3 top-10 z-10 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-300/40">
                      <button
                        onClick={() => {
                          setOpenMenuRepoId(null);
                          void handleRenameRepository(repo);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuRepoId(null);
                          void handleDeleteRepository(repo.id);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
