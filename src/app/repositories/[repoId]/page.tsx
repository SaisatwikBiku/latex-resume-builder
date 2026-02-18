"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { ResumeData } from "@/lib/resumeSchema";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";

const defaultData: ResumeData = {
  basics: { name: "Your Name", email: "", phone: "", location: "", website: "", summary: "" },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
};

export default function RepositoryWorkspacePage() {
  const { status } = useSession();
  const params = useParams<{ repoId: string }>();
  const repoId = params?.repoId ?? "";

  const [repositoryName, setRepositoryName] = useState("Repository");
  const [data, setData] = useState<ResumeData>(defaultData);
  const [commitTitle, setCommitTitle] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!repoId || status !== "authenticated") return;

    let mounted = true;

    async function loadWorkspace() {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      try {
        const repoRes = await fetch(`/api/repositories/${encodeURIComponent(repoId)}`);
        if (!repoRes.ok) throw new Error("Failed to load repository.");
        const repoPayload = await repoRes.json();

        if (!mounted) return;
        setRepositoryName(repoPayload.repository?.name ?? "Repository");

        const latestVersionId = repoPayload.repository?.latestVersionId as string | null;
        if (!latestVersionId) {
          setData(defaultData);
          return;
        }

        const versionRes = await fetch(
          `/api/repositories/${encodeURIComponent(repoId)}/versions/${encodeURIComponent(latestVersionId)}`
        );
        if (!versionRes.ok) throw new Error("Failed to load latest commit.");
        const versionPayload = await versionRes.json();
        if (mounted) setData((versionPayload.data ?? defaultData) as ResumeData);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load workspace.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadWorkspace();

    return () => {
      mounted = false;
    };
  }, [repoId, status]);

  async function generatePdfFrom(payload: ResumeData) {
    const res = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "PDF generation failed");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    setIsGenerating(true);
    setError(null);
    try {
      await generatePdfFrom(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to download PDF.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCommit() {
    if (!repoId) return;

    setIsCommitting(true);
    setError(null);
    setMessage(null);
    try {
      const title = commitTitle.trim() || `Commit ${new Date().toLocaleString()}`;
      const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, data }),
      });
      if (!res.ok) throw new Error("Failed to create commit.");

      setCommitTitle("");
      setMessage("Commit created.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create commit.");
    } finally {
      setIsCommitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Repository Workspace</p>
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
              href={`/repositories/${repoId}/commits`}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Commits
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
            <label className="text-xs font-medium text-slate-700">
              Commit Title
              <input
                value={commitTitle}
                onChange={(e) => setCommitTitle(e.target.value)}
                placeholder="e.g. Add internship achievements"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                disabled={isLoading}
              />
            </label>
            <button
              onClick={() => void handleCommit()}
              disabled={isCommitting || isLoading}
              className="h-10 w-full self-end rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 sm:col-span-1 sm:w-auto"
            >
              {isCommitting ? "Committing..." : "Commit"}
            </button>
            <button
              onClick={() => void handleDownload()}
              disabled={isGenerating || isLoading}
              className="h-10 w-full self-end rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              {isGenerating ? "Generating..." : "Download PDF"}
            </button>
          </div>
          {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </section>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading workspace...
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_600px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <ResumeForm value={data} onChange={setData} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24 xl:self-start">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4">
                <p className="text-sm font-semibold text-slate-900">Live Preview</p>
              </div>
              <div className="p-3 sm:p-6">
                <div className="aspect-[210/297] max-h-[75vh] overflow-auto rounded-lg border border-slate-300 bg-white shadow-sm sm:max-h-none">
                  <ResumePreview data={data} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
