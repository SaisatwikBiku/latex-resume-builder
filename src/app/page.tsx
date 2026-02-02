"use client";

import { useState } from "react";
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

export default function Page() {
  const [data, setData] = useState<ResumeData>(defaultData);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generatePdf() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
              <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-teal-600">Professional LaTeX Resume Builder</p>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">Create Your Resume</h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-0">Build a professional resume in minutes. Fill in your details, preview in real-time, and download a beautifully formatted PDF.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Form */}
          <div className="order-1 space-y-6 lg:order-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="mb-6 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">Step 1</p>
                <h2 className="text-2xl font-bold text-slate-900">Your Information</h2>
              </div>
              <ResumeForm value={data} onChange={setData} />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="order-2 lg:order-2 lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 sm:px-8">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">Step 2</p>
                  <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
                  <p className="text-xs text-slate-600">
                    HTML preview for quick editing. Final PDF is compiled when you download.
                  </p>
                </div>
              </div>

              {/* Preview Container */}
              <div className="flex justify-center bg-slate-50/50 p-4 sm:p-6">
                <div className="w-full max-w-[900px]">
                  <div className="aspect-[210/297] overflow-auto rounded-lg border border-slate-300 bg-white shadow-sm">
                    <ResumePreview data={data} />
                  </div>
                </div>
              </div>

              {/* Desktop CTA Button */}
              <div className="hidden lg:block border-t border-slate-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-600">Step 3</p>
                  <button
                    onClick={generatePdf}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition duration-200 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGenerating && (
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {isGenerating ? "Generating…" : "Download PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA Button - Step 3 */}
          <div className="order-3 lg:hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-gradient-to-br from-sky-50 to-blue-50 px-6 py-4 sm:px-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-600">Step 3</p>
                <h3 className="text-xl font-bold text-slate-900">Download Resume</h3>
                <p className="text-xs text-slate-600">Export your resume as PDF</p>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={generatePdf}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition duration-200 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating && (
                  <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isGenerating ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-slate-900">LaTeX Resume Builder</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Build professional resumes with precision. Powered by LaTeX for pixel-perfect typesetting.
            </p>
            <p className="text-xs text-slate-400 pt-2">
              Built with Next.js and LaTeX.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
