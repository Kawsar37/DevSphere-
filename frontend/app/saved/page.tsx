"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postsApi } from "@/services/posts.api";
import { Post } from "@/types/api";
import { useAuth } from "@/features/auth/AuthContext";
import { PostCard } from "@/features/posts/PostCard";
import { Bookmark, ArrowLeft, Loader2, MessageSquare } from "lucide-react";

export default function SavedPostsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    async function loadSaved() {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const res = await postsApi.getSavedPosts();
        if (res.success && res.data) {
          setPosts(res.data.posts);
        } else {
          setError(res.message || "Failed to load saved posts.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load saved posts.");
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, [isAuthenticated, authLoading, router]);

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary font-mono transition-colors w-fit mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Saved Bookmarks</h1>
            <p className="text-xs sm:text-sm text-secondary">
              Posts and discussions you saved for reference, benchmarking, and study.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-secondary font-mono text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading saved posts...</span>
        </div>
      ) : error ? (
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 text-center text-xs text-error">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-xl border border-outline-variant/40 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-1">
            <Bookmark className="w-6 h-6 text-outline" />
          </div>
          <h3 className="text-base font-semibold text-on-surface">No saved bookmarks yet</h3>
          <p className="text-xs text-secondary max-w-sm">
            Click the <strong className="text-primary font-mono">Save</strong> button on any post in your feed or detail page to bookmark it here for later reading.
          </p>
          <Link
            href="/"
            className="mt-2 px-4 py-2 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            Browse Community Posts
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
