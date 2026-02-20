"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] px-4 py-10">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg shadow-slate-200/60 backdrop-blur">
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/repositories";

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

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f5ee_0%,#f8fafc_42%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg shadow-slate-200/60 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to access your resumes.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
              autoComplete="current-password"
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
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-teal-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
