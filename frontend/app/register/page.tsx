"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Code2, User, Mail, Lock, FileText, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
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

    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        bio: bio.trim() || undefined,
      });

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to create account. Please try again.");
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
            Join DevSphere Community
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Connect with senior engineers, discuss system designs, and build your technical profile.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-error/20 rounded-lg flex items-start gap-2.5 text-xs text-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="name">
              Full Name <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                required
                className="w-full h-10 pl-9 pr-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="email">
              Work Email <span className="text-error">*</span>
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
            <label className="text-xs font-medium text-on-surface" htmlFor="password">
              Password <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full h-10 pl-9 pr-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="confirmPassword">
              Confirm Password <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full h-10 pl-9 pr-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="bio">
              Headline / Role (Optional)
            </label>
            <div className="relative flex items-center">
              <FileText className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                id="bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Senior Backend Engineer @ Stripe"
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-outline-variant/30 text-center text-xs text-secondary">
          <span>Already registered? </span>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In to your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
