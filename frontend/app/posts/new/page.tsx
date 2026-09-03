"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { postsApi } from "@/services/posts.api";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Tag,
  Plus,
  X,
  Code,
  HelpCircle,
  FileText,
} from "lucide-react";

const SUGGESTED_TAGS = [
  "Go",
  "TypeScript",
  "Architecture",
  "PostgreSQL",
  "Distributed Systems",
  "Kubernetes",
  "Kafka",
  "React",
  "Next.js",
  "Database",
];

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>(["Architecture"]);
  const [customTag, setCustomTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Require authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
      setTags([...tags, trimmed]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters long.");
      return;
    }

    if (body.trim().length < 10) {
      setError("Post content must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await postsApi.createPost({
        title: title.trim(),
        body: body.trim(),
        tags,
      });

      if (res.success && res.data) {
        router.push(`/posts/${res.data._id}`);
      } else {
        setError(res.message || "Failed to publish post.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="py-12 max-w-3xl mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Main Composer Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Create Engineering Discussion
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Share architecture decisions, debugging breakthroughs, or technical RFCs.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Post Title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface" htmlFor="title">
                Post Title *
              </label>
              <span className="text-[11px] font-mono text-outline">
                {title.length}/200
              </span>
            </div>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Why we migrated from distributed transactions to a Saga pattern in Go"
              className="h-11 px-3.5 bg-surface border border-outline-variant/60 rounded-lg text-sm font-medium text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Tags Manager */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>Technical Tags</span>
            </label>

            {/* Selected Tags Chips */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md bg-surface-container text-primary font-medium border border-outline-variant/30"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested & Custom Tag Input */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-secondary">Quick add:</span>
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                .slice(0, 5)
                .map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-secondary hover:text-primary transition-colors border border-outline-variant/20"
                  >
                    +{t}
                  </button>
                ))}
            </div>

            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Custom tag name..."
                className="h-8 px-2.5 bg-surface border border-outline-variant/50 rounded text-xs text-on-surface outline-none focus:border-primary max-w-xs"
              />
              <button
                type="button"
                onClick={() => handleAddTag(customTag)}
                className="px-3 h-8 bg-surface-container hover:bg-surface-container-high text-primary text-xs font-medium rounded flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tag</span>
              </button>
            </div>
          </div>

          {/* Post Body (Markdown) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface" htmlFor="body">
                Post Content (Markdown supported) *
              </label>
              <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                <Code className="w-3.5 h-3.5 text-outline" />
                <span>Code blocks supported</span>
              </div>
            </div>
            <textarea
              id="body"
              required
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Explain the technical context, benchmarks, architectural tradeoffs, or code snippets..."
              className="p-3.5 bg-surface border border-outline-variant/60 rounded-lg text-sm font-sans text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all leading-relaxed resize-y font-mono"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
            <span className="text-xs text-secondary">
              Posts are public and ranked according to developer engagement.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish Post</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
