"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!registerRes.ok) {
        const payload = await registerRes.json().catch(() => ({}));
        setError(payload.error || "Failed to create account.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInRes || signInRes.error) {
        router.push("/login");
        return;
      }

      router.push("/repositories");
      router.refresh();
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg shadow-slate-200/60 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Register</h1>
        <p className="mt-2 text-sm text-slate-600">Create an account to save and manage resumes.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-800">
            Name (optional)
            <input
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-slate-800">
            Email
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-slate-800">
            Password
            <input
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-teal-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
