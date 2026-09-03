"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { postsApi } from "@/services/posts.api";
import { Post } from "@/types/api";
import { ThreadTree } from "@/features/comments/ThreadTree";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { reactionsApi } from "@/services/reactions.api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Bookmark,
  Share2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        const res = await postsApi.getPostById(id);
        if (res.success && res.data) {
          setPost(res.data);
        } else {
          setError(res.message || "Post not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load post.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id]);

  const handleReaction = async (reactionType: "like" | "dislike") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!post || isReacting) return;
    setIsReacting(true);

    const prevLikes = post.likesCount;
    const prevDislikes = post.dislikesCount;
    const prevReaction = post.userReaction;

    let newLikes = prevLikes;
    let newDislikes = prevDislikes;
    let newReaction: "like" | "dislike" | null = null;

    if (prevReaction === reactionType) {
      // Toggle OFF
      newReaction = null;
      if (reactionType === "like") newLikes = Math.max(0, prevLikes - 1);
      else newDislikes = Math.max(0, prevDislikes - 1);
    } else if (prevReaction) {
      // Flip
      newReaction = reactionType;
      if (reactionType === "like") {
        newLikes = prevLikes + 1;
        newDislikes = Math.max(0, prevDislikes - 1);
      } else {
        newLikes = Math.max(0, prevLikes - 1);
        newDislikes = prevDislikes + 1;
      }
    } else {
      // New
      newReaction = reactionType;
      if (reactionType === "like") newLikes = prevLikes + 1;
      else newDislikes = prevDislikes + 1;
    }

    setPost((prev) =>
      prev
        ? {
            ...prev,
            likesCount: newLikes,
            dislikesCount: newDislikes,
            userReaction: newReaction,
          }
        : null
    );

    try {
      const res = await reactionsApi.reactToPost(post._id, reactionType);
      if (res.success && res.data) {
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likesCount: res.data!.likesCount,
                dislikesCount: res.data!.dislikesCount,
                userReaction: res.data!.userReaction,
              }
            : null
        );
      } else {
        // Rollback
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likesCount: prevLikes,
                dislikesCount: prevDislikes,
                userReaction: prevReaction,
              }
            : null
        );
      }
    } catch {
      // Rollback
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: prevLikes,
              dislikesCount: prevDislikes,
              userReaction: prevReaction,
            }
          : null
      );
    } finally {
      setIsReacting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-6 w-32 bg-surface-container rounded" />
        <div className="h-64 bg-surface-container-lowest rounded-xl border border-outline-variant/30" />
        <div className="h-48 bg-surface-container-lowest rounded-xl border border-outline-variant/30" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 max-w-md mx-auto flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-red-50 text-error rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-on-surface">Couldn&apos;t load post</h2>
        <p className="text-sm text-secondary">{error || "Post does not exist."}</p>
        <Link
          href="/"
          className="mt-2 px-4 py-2 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const publishDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const authorName = post.author?.name || "Developer";
  const authorEmail = post.author?.email || "dev@devsphere.io";
  const handle = authorEmail.split("@")[0];
  const role = post.author?.bio ? post.author.bio.slice(0, 35) : "Software Engineer";

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* 1. Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Feed</span>
        </Link>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-secondary">
          <Link href="/" className="hover:text-on-surface transition-colors">Home</Link>
          <span>/</span>
          <Link href="/" className="hover:text-on-surface transition-colors">Posts</Link>
          <span>/</span>
          <span className="text-primary font-medium truncate max-w-[200px]">
            {post.tags?.[0] || "Discussion"}
          </span>
        </nav>
      </div>

      {/* 2. Main Post Card */}
      <article className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-6">
        {/* Author Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3.5">
            <Link href={`/developers/${post.authorId}`}>
              {post.author?.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={authorName}
                  className="w-11 h-11 rounded-full object-cover border border-outline-variant/40"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-semibold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/developers/${post.authorId}`}
                  className="font-semibold text-sm text-on-surface hover:text-primary transition-colors"
                >
                  {authorName}
                </Link>
                <span className="font-mono text-xs text-secondary">@{handle}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-[11px]">
                  {role}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-outline font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{publishDate}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>5 min read</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Save post"
              className="h-8 px-3 bg-surface-container-low hover:bg-surface-container text-primary font-mono text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              aria-label="Share post"
              className="h-8 w-8 flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/30"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Technical Post Body */}
        <div className="text-on-surface text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
          {post.body}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="font-mono text-xs px-3 py-1 bg-surface-container text-on-surface-variant rounded-md font-medium border border-outline-variant/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Interaction Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReaction("like")}
              disabled={isReacting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                post.userReaction === "like"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-primary hover:bg-surface-container-high"
              }`}
            >
              <ArrowUp className={`w-4 h-4 ${post.userReaction === "like" ? "stroke-[2.5]" : ""}`} />
              <span>{post.likesCount} Upvotes</span>
            </button>
            <button
              onClick={() => handleReaction("dislike")}
              disabled={isReacting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                post.userReaction === "dislike"
                  ? "bg-rose-100 text-rose-800 font-semibold shadow-sm"
                  : "hover:bg-surface-container-low text-secondary hover:text-on-surface"
              }`}
            >
              <ArrowDown className={`w-4 h-4 ${post.userReaction === "dislike" ? "stroke-[2.5]" : ""}`} />
              <span>{post.dislikesCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-secondary font-mono">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>{post.commentCount} Comments</span>
          </div>
        </div>
      </article>

      {/* 3. Threaded Discussion Section */}
      <ThreadTree
        postId={post._id}
        postAuthorId={post.authorId}
        onCommentCountChange={(count) => {
          setPost((prev) => (prev ? { ...prev, commentCount: count } : null));
        }}
      />
    </div>
  );
}
