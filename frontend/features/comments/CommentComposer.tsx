"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { Send, Loader2, Code, CornerDownRight } from "lucide-react";

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
}

export function CommentComposer({
  onSubmit,
  placeholder = "Share your thoughts or ask a technical question...",
}: CommentComposerProps) {
  const { user, isAuthenticated } = useAuth();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="p-5 bg-surface rounded-xl border border-dashed border-outline-variant/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-secondary">
          <CornerDownRight className="w-4 h-4 text-primary" />
          <span>Join the discussion and share your engineering perspective.</span>
        </div>
        <Link
          href="/login"
          className="px-3.5 py-1.5 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary-hover transition-colors shrink-0"
        >
          Sign in to Comment
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setBody("");
    } catch (err: any) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-3">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-outline-variant/40 shrink-0 mt-1"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-1">
            {user ? user.name.charAt(0).toUpperCase() : "D"}
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 bg-surface border border-outline-variant/60 rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all leading-relaxed resize-y font-sans"
          />

          <div className="flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-outline">
              <Code className="w-3 h-3" />
              <span>Supports technical code blocks</span>
            </div>

            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="ml-auto px-4 py-1.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Comment</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
