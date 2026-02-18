"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { ResumeData } from "@/lib/resumeSchema";

type CommitSummary = {
  id: string;
  title: string;
  versionNumber: number;
  updatedAt?: string | null;
};

export default function CommitsPage() {
  const { status } = useSession();
  const params = useParams<{ repoId: string }>();
  const repoId = params?.repoId ?? "";

  const [repositoryName, setRepositoryName] = useState("Repository");
  const [commits, setCommits] = useState<CommitSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingCommitId, setDownloadingCommitId] = useState<string | null>(null);
  const [openMenuCommitId, setOpenMenuCommitId] = useState<string | null>(null);

  useEffect(() => {
    if (!repoId || status !== "authenticated") return;

    let mounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const repoRes = await fetch(`/api/repositories/${encodeURIComponent(repoId)}`);
        if (!repoRes.ok) throw new Error("Failed to load repository.");
        const repoPayload = await repoRes.json();

        const commitsRes = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/versions`);
        if (!commitsRes.ok) throw new Error("Failed to load commits.");
        const commitsPayload = await commitsRes.json();

        if (!mounted) return;
        setRepositoryName(repoPayload.repository?.name ?? "Repository");
        setCommits((commitsPayload.versions ?? []) as CommitSummary[]);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load commits.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [repoId, status]);

  async function downloadPdfFromCommit(commitId: string) {
    setDownloadingCommitId(commitId);
    setError(null);
    try {
      const versionRes = await fetch(
        `/api/repositories/${encodeURIComponent(repoId)}/versions/${encodeURIComponent(commitId)}`
      );
      if (!versionRes.ok) throw new Error("Failed to load commit.");
      const versionPayload = await versionRes.json();
      const data = versionPayload.data as ResumeData;

      const pdfRes = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({}));
        throw new Error(err.error || "PDF generation failed");
      }

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repositoryName.replace(/\s+/g, "-").toLowerCase()}-${commitId.slice(-6)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to download commit PDF.");
    } finally {
      setDownloadingCommitId(null);
    }
  }

  async function handleRenameCommit(commit: CommitSummary) {
    const nextTitle = window.prompt("Rename commit", commit.title)?.trim();
    if (!nextTitle || nextTitle === commit.title) return;

    setError(null);
    try {
      const res = await fetch(
        `/api/repositories/${encodeURIComponent(repoId)}/versions/${encodeURIComponent(commit.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle }),
        }
      );
      if (!res.ok) throw new Error("Failed to rename commit.");
      setCommits((prev) => prev.map((item) => (item.id === commit.id ? { ...item, title: nextTitle } : item)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to rename commit.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Commit History</p>
              <h1 className="truncate text-base font-bold sm:text-lg">{repositoryName}</h1>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3 sm:overflow-visible sm:pb-0">
            <Link href="/" className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Repositories
            </Link>
            <Link
              href={`/repositories/${repoId}`}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}

          {isLoading ? (
            <p className="text-sm text-slate-600">Loading commits...</p>
          ) : commits.length === 0 ? (
            <p className="text-sm text-slate-600">No commits yet. Go to workspace and create your first commit.</p>
          ) : (
            <div className="space-y-2">
              {commits.map((commit) => (
                <div
                  key={commit.id}
                  className="relative flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/repositories/${repoId}/commits/${commit.id}`}
                      className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                    >
                      {commit.title}
                    </Link>
                    <p className="text-xs text-slate-500">Commit #{commit.versionNumber}</p>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-2 sm:static sm:shrink-0">
                    <button
                      onClick={() => setOpenMenuCommitId((prev) => (prev === commit.id ? null : commit.id))}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm leading-none text-slate-700 hover:bg-slate-50"
                      aria-label="Commit actions"
                    >
                      ⋯
                    </button>
                  </div>
                  {openMenuCommitId === commit.id && (
                    <div className="absolute right-3 top-10 z-10 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                      <button
                        onClick={() => {
                          setOpenMenuCommitId(null);
                          void handleRenameCommit(commit);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuCommitId(null);
                          void downloadPdfFromCommit(commit.id);
                        }}
                        disabled={downloadingCommitId === commit.id}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      >
                        {downloadingCommitId === commit.id ? "Downloading..." : "Download"}
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
