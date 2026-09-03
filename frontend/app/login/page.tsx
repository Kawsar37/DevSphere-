"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Code2, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ email, password });
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to sign in. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/50 shadow-sm flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm mb-1">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            Welcome back to DevSphere
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Sign in to join the discussion and share your engineering insights.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-error/20 rounded-lg flex items-start gap-2.5 text-xs text-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="email">
              Work Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                required
                className="w-full h-10 pl-9 pr-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-on-surface" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-9 pr-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 mt-2 bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-outline-variant/30 text-center text-xs text-secondary">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create Developer Account
          </Link>
        </div>
      </div>
    </div>
  );
}
