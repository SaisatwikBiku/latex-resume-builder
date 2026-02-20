import Link from "next/link";
import { auth } from "@/auth";

const highlights = [
  "Repository-based resume management",
  "Commit history for every resume change",
  "Live preview while editing",
  "One-click LaTeX PDF export",
];

const featureGrid = [
  {
    title: "Role-based repositories",
    body: "Keep one repo per target role so your backend, data, and product resumes never collide.",
  },
  {
    title: "Git-style commits",
    body: "Snapshot changes with commit titles. Go back anytime without losing work.",
  },
  {
    title: "Editable history",
    body: "Open older commits on a dedicated page, update content, and re-export as needed.",
  },
  {
    title: "Reliable export",
    body: "Compile resumes using LaTeX for print-ready PDF formatting and consistency.",
  },
  {
    title: "Account-based storage",
    body: "All repositories are tied to your account with secure login and private access.",
  },
  {
    title: "Fast writing loop",
    body: "Structured form input plus live preview lets you iterate quickly with less formatting friction.",
  },
];

const faqs = [
  {
    q: "Is the live preview exactly the final PDF?",
    a: "Preview is a fast visual approximation for editing. The final downloaded file is generated from LaTeX.",
  },
  {
    q: "Can I maintain multiple resume versions?",
    a: "Yes. Create separate repositories and make commits within each one for different applications.",
  },
  {
    q: "Can I edit old commits?",
    a: "Yes. You can open a previous commit, update it, and export a PDF from that state.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
      <header className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">LaTeX Resume Builder</p>
          <h1 className="text-lg font-bold">Version control for your resume</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={session ? "/repositories" : "/login"}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {session ? "Open App" : "Login"}
          </Link>
          <Link
            href={session ? "/repositories" : "/register"}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            {session ? "Go to Repositories" : "Create account"}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1100px] gap-10 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:px-8 lg:pb-20 lg:pt-8">
        <section>
          <p className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            Built for serious job applications
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Stop managing resumes like random files.
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Organize resumes in repositories, commit versions by role, and export polished LaTeX PDFs when ready.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={session ? "/repositories" : "/register"}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {session ? "Open your repositories" : "Start free"}
            </Link>
            <Link
              href={session ? "/repositories" : "/login"}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {session ? "Continue editing" : "Sign in"}
            </Link>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-200/60 sm:p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Workflow</p>
            <ol className="mt-3 space-y-3 text-sm text-slate-700">
              <li className="rounded-lg bg-white px-3 py-2">1. Create a repository for a role or company.</li>
              <li className="rounded-lg bg-white px-3 py-2">2. Edit resume data in structured sections.</li>
              <li className="rounded-lg bg-white px-3 py-2">3. Commit versions and compare progress.</li>
              <li className="rounded-lg bg-white px-3 py-2">4. Download production-ready PDF output.</li>
            </ol>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300">Why this works</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              You keep each application variant isolated and traceable. No more <span className="font-semibold">resume_final_v12.pdf</span>.
            </p>
          </div>
        </section>
      </main>

      <section className="mx-auto w-full max-w-[1100px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Core Features</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureGrid.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">FAQ</p>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <article key={faq.q} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{faq.q}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Ready to try?</p>
            <h3 className="mt-3 text-2xl font-bold leading-tight">Build cleaner, role-specific resumes faster.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Start with one repository, create commits for each opportunity, and export polished PDFs on demand.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={session ? "/repositories" : "/register"}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                {session ? "Open app" : "Create account"}
              </Link>
              <Link
                href={session ? "/repositories" : "/login"}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                {session ? "Continue" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} LaTeX Resume Builder</p>
          <div className="flex items-center gap-4">
            <Link href={session ? "/repositories" : "/login"} className="hover:text-slate-900 hover:underline">
              {session ? "Open App" : "Login"}
            </Link>
            <Link href={session ? "/repositories" : "/register"} className="hover:text-slate-900 hover:underline">
              {session ? "Repositories" : "Create Account"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
