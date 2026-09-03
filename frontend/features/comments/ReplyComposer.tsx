"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { Send, Loader2, X } from "lucide-react";

interface ReplyComposerProps {
  onReply: (body: string) => Promise<void>;
  onCancel: () => void;
  parentAuthorName?: string;
}

export function ReplyComposer({
  onReply,
  onCancel,
  parentAuthorName,
}: ReplyComposerProps) {
  const { user, isAuthenticated } = useAuth();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="p-3 bg-surface rounded-lg border border-outline-variant/50 text-xs flex items-center justify-between">
        <span className="text-secondary">Sign in to reply to this comment.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary hover:text-on-surface"
          >
            Cancel
          </button>
          <Link
            href="/login"
            className="px-2.5 py-1 bg-primary text-on-primary font-medium rounded text-[11px]"
          >
            Sign in
          </Link>
        </div>
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
      await onReply(trimmed);
      setBody("");
      onCancel();
    } catch (err: any) {
      setError(err.message || "Failed to submit reply.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2.5 p-3 bg-surface rounded-xl border border-outline-variant/60 flex flex-col gap-2.5"
    >
      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex items-center justify-between text-[11px] text-secondary font-mono">
        <span>Replying to @{parentAuthorName || "developer"}</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-secondary hover:text-on-surface flex items-center gap-0.5"
        >
          <X className="w-3 h-3" />
          <span>Cancel</span>
        </button>
      </div>

      <textarea
        rows={2}
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write an inline reply..."
        className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs text-on-surface outline-none focus:border-primary transition-all resize-y font-sans leading-relaxed"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs text-secondary hover:text-on-surface rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="px-3.5 py-1 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Replying...</span>
            </>
          ) : (
            <>
              <span>Reply</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
