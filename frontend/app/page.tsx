"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { postsApi } from "@/services/posts.api";
import { Post } from "@/types/api";
import { useAuth } from "@/features/auth/AuthContext";
import { PostCard } from "@/features/posts/PostCard";
import {
  Flame,
  Clock,
  Plus,
  Code,
  HelpCircle,
  FileText,
  Send,
  MessageSquare,
  AlertCircle,
  Search,
  X,
} from "lucide-react";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const tagQuery = searchParams.get("tag") || "";

  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"ranked" | "latest">("ranked");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        const res = await postsApi.getPosts({
          sort,
          search: searchQuery || undefined,
          tag: tagQuery || undefined,
        });
        if (res.success && res.data) {
          setPosts(res.data.posts);
        } else {
          setError(res.message || "Failed to load feed.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [sort, searchQuery, tagQuery]);

  const clearSearchFilter = () => {
    router.push("/");
  };

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Active Search / Tag Filter Banner */}
      {(searchQuery || tagQuery) && (
        <div className="bg-surface-container-low p-4 rounded-xl border border-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-on-surface">
            <Search className="w-4 h-4 text-primary shrink-0" />
            <span>
              {searchQuery && (
                <>
                  Search results for: <strong className="text-primary font-mono">&ldquo;{searchQuery}&rdquo;</strong>
                </>
              )}
              {tagQuery && (
                <>
                  Filtered by topic: <strong className="text-primary font-mono">#{tagQuery}</strong>
                </>
              )}
            </span>
          </div>
          <button
            onClick={clearSearchFilter}
            className="flex items-center gap-1 text-xs font-mono text-secondary hover:text-on-surface bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-lg transition-colors border border-outline-variant/30"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-surface-container text-primary font-medium tracking-wide uppercase">
              Engineering Feed
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="text-secondary text-xs">Live updates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Developer Community
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Discover ideas, ask questions, and learn from engineers building production systems.
          </p>
        </div>

        {/* Segmented Filter Tabs */}
        <div className="inline-flex p-1 bg-surface-container-low rounded-lg self-start sm:self-auto border border-outline-variant/30">
          <button
            onClick={() => setSort("ranked")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-all ${
              sort === "ranked"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Ranked</span>
          </button>
          <button
            onClick={() => setSort("latest")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-all ${
              sort === "latest"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Composer Card */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {isAuthenticated && user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-outline-variant/40 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-semibold shrink-0">
              {user ? user.name.charAt(0).toUpperCase() : "D"}
            </div>
          )}

          <Link
            href="/posts/new"
            className="flex-1 bg-surface hover:bg-surface-container-low rounded-lg px-3.5 py-2 border border-outline-variant/40 flex items-center justify-between text-secondary hover:text-on-surface transition-colors group cursor-pointer"
          >
            <span className="text-xs sm:text-sm text-secondary group-hover:text-on-surface">
              Share what you&apos;re building, debugging, or learning...
            </span>
            <kbd className="hidden md:inline-block font-mono text-[11px] bg-surface-container-lowest text-outline px-1.5 py-0.5 rounded border border-outline-variant/40 shadow-sm">
              Press C
            </kbd>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface font-mono text-xs transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-primary" />
              <span>Code snippet</span>
            </Link>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface font-mono text-xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-tertiary" />
              <span>Ask Question</span>
            </Link>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface font-mono text-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-secondary" />
              <span>Write Article</span>
            </Link>
          </div>

          <Link
            href="/posts/new"
            className="h-7 px-3 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-md flex items-center gap-1 transition-colors shadow-sm"
          >
            <span>Post</span>
            <Send className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Feed Cards List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm animate-pulse flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-32 bg-surface-container rounded" />
                  <div className="h-2.5 w-24 bg-surface-container rounded" />
                </div>
              </div>
              <div className="h-5 w-3/4 bg-surface-container rounded mt-2" />
              <div className="h-4 w-full bg-surface-container rounded" />
              <div className="h-4 w-2/3 bg-surface-container rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 text-center flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 text-error" />
          <h3 className="text-sm font-semibold text-on-surface">Couldn&apos;t load posts</h3>
          <p className="text-xs text-secondary">{error}</p>
          <button
            onClick={() => setSort(sort)}
            className="px-3.5 py-1.5 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-xl border border-outline-variant/40 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-1">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface">
            {searchQuery || tagQuery ? "No matching posts found" : "No posts yet"}
          </h3>
          <p className="text-xs text-secondary max-w-sm">
            {searchQuery || tagQuery
              ? `No discussions matched "${searchQuery || tagQuery}". Try another keyword or clear the filter.`
              : "Be the first to share an architecture decision, technical query, or engineering article!"}
          </p>
          {searchQuery || tagQuery ? (
            <button
              onClick={clearSearchFilter}
              className="mt-2 px-4 py-2 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
            >
              Clear Filter
            </button>
          ) : (
            <Link
              href="/posts/new"
              className="mt-2 px-4 py-2 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Post</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post, idx) => (
            <PostCard
              key={post._id}
              post={post}
              rankIndex={sort === "ranked" && !searchQuery && !tagQuery ? idx : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-secondary font-mono text-xs">Loading feed...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
