"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { ResumeData } from "@/lib/resumeSchema";

type VersionDetail = {
  id: string;
  title: string;
  versionNumber: number;
  company?: string | null;
  data?: ResumeData;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function VersionsPage() {
  const { status } = useSession();
  const params = useParams<{ repoId: string }>();
  const repoId = params?.repoId ?? "";

  const [repositoryName, setRepositoryName] = useState("Repository");
  const [versions, setVersions] = useState<VersionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const repoRes = await fetch(`/api/repositories/${encodeURIComponent(repoId)}`);
        if (!repoRes.ok) throw new Error("Failed to load repository.");
        const repoPayload = await repoRes.json();

        const versionsRes = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/versions`);
        if (!versionsRes.ok) throw new Error("Failed to load versions.");
        const versionsPayload = await versionsRes.json();

        if (!mounted) return;
        setRepositoryName(repoPayload.repository?.name ?? "Repository");

        const list = (versionsPayload.versions ?? []) as VersionDetail[];

        // load each version's detail to get full data for diffs
        const details = await Promise.all(
          list.map(async (v: VersionDetail) => {
            try {
              const res = await fetch(
                `/api/repositories/${encodeURIComponent(repoId)}/versions/${encodeURIComponent(v.id)}`
              );
              if (!res.ok) return { ...v, data: undefined } as VersionDetail;
              const payload = await res.json();
              return { ...v, data: payload.data ?? undefined, company: payload.company ?? v.company } as VersionDetail;
            } catch {
              return { ...v, data: undefined } as VersionDetail;
            }
          })
        );

        if (mounted) setVersions(details);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load versions.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [repoId, status]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 640);
    }
    // run on mount
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Versions</p>
                <h1 className="truncate text-base font-bold sm:text-lg">{repositoryName}</h1>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3 sm:overflow-visible sm:pb-0">
              <Link href="/repositories" className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Repositories</Link>
              <Link href={`/repositories/${repoId}`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Workspace</Link>
              <Link href={`/repositories/${repoId}/commits`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Commits</Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-5">
            <p className="text-sm text-slate-600">The Versions view is best viewed on a desktop — please open this page on a larger screen to see diffs between commits.</p>
          </section>
        </main>
      </div>
    );
  }

  function topLevelKeys(data?: ResumeData) {
    if (!data) return [] as string[];
    return Object.keys(data) as (keyof ResumeData)[] as string[];
  }

  function changedSections(a?: ResumeData, b?: ResumeData) {
    if (!a || !b) return topLevelKeys(a ?? b).filter((k) => true);
    const keys = Array.from(new Set([...topLevelKeys(a), ...topLevelKeys(b)]));
    return keys.filter((k) => JSON.stringify((a as any)[k]) !== JSON.stringify((b as any)[k]));
  }

  function DiffBlock({ oldVal, newVal }: { oldVal: unknown; newVal: unknown }) {
    const oldStr = oldVal === undefined ? "" : JSON.stringify(oldVal, null, 2);
    const newStr = newVal === undefined ? "" : JSON.stringify(newVal, null, 2);

    const oldLines = oldStr.split("\n");
    const newLines = newStr.split("\n");
    const max = Math.max(oldLines.length, newLines.length);

    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <div className="text-xs text-slate-500">Older</div>
          <div className="max-h-48 overflow-auto rounded border bg-white p-2 text-xs font-mono">
            {Array.from({ length: max }).map((_, i) => {
              const o = oldLines[i] ?? "";
              const n = newLines[i] ?? "";
              const changed = o !== n;
              return (
                <div
                  key={i}
                  className={changed ? "rounded px-1 py-0.5 bg-rose-50 text-rose-800" : "px-1"}
                  style={{ whiteSpace: "pre" }}
                >
                  {o || ""}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Newer</div>
          <div className="max-h-48 overflow-auto rounded border bg-white p-2 text-xs font-mono">
            {Array.from({ length: max }).map((_, i) => {
              const o = oldLines[i] ?? "";
              const n = newLines[i] ?? "";
              const changed = o !== n;
              return (
                <div
                  key={i}
                  className={changed ? "rounded px-1 py-0.5 bg-emerald-50 text-emerald-800" : "px-1"}
                  style={{ whiteSpace: "pre" }}
                >
                  {n || ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Versions</p>
                <h1 className="truncate text-base font-bold sm:text-lg">{repositoryName}</h1>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3 sm:overflow-visible sm:pb-0">
              <Link href="/repositories" className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Repositories</Link>
              <Link href={`/repositories/${repoId}`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Workspace</Link>
              <Link href={`/repositories/${repoId}/commits`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Commits</Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-8">
            <p className="text-sm text-slate-600">Loading versions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    );
  }

  if (!versions.length) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Versions</p>
                <h1 className="truncate text-base font-bold sm:text-lg">{repositoryName}</h1>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3 sm:overflow-visible sm:pb-0">
              <Link href="/repositories" className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Repositories</Link>
              <Link href={`/repositories/${repoId}`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Workspace</Link>
              <Link href={`/repositories/${repoId}/commits`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Commits</Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-600">No versions found.</p>
        </main>
      </div>
    );
  }

  // versions are expected newest-first from API; sort by versionNumber asc for chronological pairing
  const sorted = [...versions].sort((a, b) => (a.versionNumber ?? 0) - (b.versionNumber ?? 0));

  const pairs: { older: VersionDetail; newer: VersionDetail; changed: string[] }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const older = sorted[i - 1];
    const newer = sorted[i];
    const changed = changedSections(older.data, newer.data);
    pairs.push({ older, newer, changed });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Versions</p>
              <h1 className="truncate text-base font-bold sm:text-lg">{repositoryName}</h1>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3 sm:overflow-visible sm:pb-0">
            <Link href="/repositories" className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Repositories</Link>
            <Link href={`/repositories/${repoId}`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Workspace</Link>
            <Link href={`/repositories/${repoId}/commits`} className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Commits</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:p-5">
          <p className="mb-3 text-sm text-slate-600">Showing diffs between consecutive versions (older → newer).</p>

          {pairs.map((pair, idx) => (
            <div key={idx} className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{pair.older.title} → {pair.newer.title}</div>
                  <div className="text-xs text-slate-500">#{pair.older.versionNumber} → #{pair.newer.versionNumber}</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {pair.newer.company && <div className="mb-1"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{pair.newer.company}</span></div>}
                  <div>{pair.newer.updatedAt ? new Date(pair.newer.updatedAt).toLocaleString() : ''}</div>
                </div>
              </div>

              <div className="mt-3">
                {pair.changed.length === 0 ? (
                  <div className="text-sm text-slate-600">No top-level changes detected.</div>
                ) : (
                  pair.changed.map((section) => (
                    <div key={section} className="mb-3">
                      <div className="text-sm font-medium text-slate-800">{section}</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <DiffBlock oldVal={(pair.older.data as any)?.[section]} newVal={(pair.newer.data as any)?.[section]} />
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
