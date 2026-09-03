"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post } from "@/types/api";
import { useAuth } from "@/features/auth/AuthContext";
import { reactionsApi } from "@/services/reactions.api";
import { postsApi } from "@/services/posts.api";
import {
  Flame,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Bookmark,
  Share2,
  Check,
  MoreHorizontal,
  Eye,
  Copy,
  Flag,
  Trash2,
} from "lucide-react";

interface PostCardProps {
  post: Post;
  rankIndex?: number;
  onPostDeleted?: (postId: string) => void;
}

export function PostCard({ post, rankIndex, onPostDeleted }: PostCardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    post.userReaction || null
  );
  const [isReacting, setIsReacting] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(post.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close options menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOptionsMenuOpen(false);
      }
    };
    if (optionsMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [optionsMenuOpen]);

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const authorName = post.author?.name || "Developer";
  const authorEmail = post.author?.email || "dev@devsphere.io";
  const handle = authorEmail.split("@")[0];
  const role = post.author?.bio ? post.author.bio.slice(0, 30) : "Software Engineer";

  // Check if the current authenticated user is the post author
  const isAuthor = Boolean(
    user && (user._id === post.authorId || (user as any).id === post.authorId)
  );

  const handleReaction = async (reactionType: "like" | "dislike") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isReacting) return;
    setIsReacting(true);

    const prevLikes = likesCount;
    const prevDislikes = dislikesCount;
    const prevReaction = userReaction;

    if (prevReaction === reactionType) {
      setUserReaction(null);
      if (reactionType === "like") setLikesCount(Math.max(0, prevLikes - 1));
      else setDislikesCount(Math.max(0, prevDislikes - 1));
    } else if (prevReaction) {
      setUserReaction(reactionType);
      if (reactionType === "like") {
        setLikesCount(prevLikes + 1);
        setDislikesCount(Math.max(0, prevDislikes - 1));
      } else {
        setLikesCount(Math.max(0, prevLikes - 1));
        setDislikesCount(prevDislikes + 1);
      }
    } else {
      setUserReaction(reactionType);
      if (reactionType === "like") setLikesCount(prevLikes + 1);
      else setDislikesCount(prevDislikes + 1);
    }

    try {
      const res = await reactionsApi.reactToPost(post._id, reactionType);
      if (res.success && res.data) {
        setLikesCount(res.data.likesCount);
        setDislikesCount(res.data.dislikesCount);
        setUserReaction(res.data.userReaction);
      } else {
        setLikesCount(prevLikes);
        setDislikesCount(prevDislikes);
        setUserReaction(prevReaction);
      }
    } catch {
      setLikesCount(prevLikes);
      setDislikesCount(prevDislikes);
      setUserReaction(prevReaction);
    } finally {
      setIsReacting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const res = await postsApi.toggleSavePost(post._id);
      if (res.success && res.data) {
        setIsSaved(res.data.saved);
      } else {
        setIsSaved(!nextSaved);
      }
    } catch {
      setIsSaved(!nextSaved);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/posts/${post._id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Actions inside 3-dots menu
  const handleMenuCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleShare();
    setTimeout(() => setOptionsMenuOpen(false), 1200);
  };

  const handleMenuSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleSave();
    setOptionsMenuOpen(false);
  };

  const handleMenuReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReported(true);
    setTimeout(() => {
      setOptionsMenuOpen(false);
      setReported(false);
    }, 1500);
  };

  const handleMenuDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await postsApi.deletePost(post._id);
      if (res.success) {
        setIsDeleted(true);
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
      } else {
        alert(res.message || "Failed to delete post.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the post.");
    } finally {
      setIsDeleting(false);
      setOptionsMenuOpen(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    // Don't trigger full card navigation if the click originated from an interactive element (button, link, input, menu)
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("[role='menu']")) {
      return;
    }
    router.push(`/posts/${post._id}`);
  };

  if (isDeleted) {
    return (
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-xs font-mono text-secondary text-center">
        Post has been deleted.
      </div>
    );
  }

  return (
    <article
      onClick={handleCardClick}
      className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl border border-outline-variant/40 shadow-sm hover:shadow-md hover:border-primary/40 transition-all relative flex flex-col gap-3.5 sm:gap-4 cursor-pointer group/card"
    >
      {/* Top Author & Rank Metadata */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link href={`/developers/${post.authorId}`} className="shrink-0 group">
            {post.author?.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={authorName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-outline-variant/40 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs sm:text-sm font-semibold group-hover:bg-primary transition-colors">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/developers/${post.authorId}`}
                className="font-semibold text-xs sm:text-sm text-on-surface hover:text-primary transition-colors truncate"
              >
                {authorName}
              </Link>
              <span className="font-mono text-[11px] sm:text-xs text-secondary truncate">@{handle}</span>
              <span className="hidden sm:inline text-outline text-xs">•</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-primary font-mono text-[11px] font-medium">
                {role}
              </span>
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-outline mt-0.5">
              {formatTimeAgo(post.createdAt)} • Community Post
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {rankIndex !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-surface-container text-primary font-mono text-[11px] sm:text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="hidden md:inline">Rank #{rankIndex + 1} • </span>
              <span>Score {post.rankScore}</span>
            </span>
          )}

          {/* Functional 3-Dots More Options Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOptionsMenuOpen((prev) => !prev);
              }}
              aria-label="More post options"
              className="text-secondary hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {optionsMenuOpen && (
              <div
                role="menu"
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-48 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Copy Link */}
                <button
                  onClick={handleMenuCopy}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-tertiary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-secondary" />
                  )}
                  <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                </button>

                {/* Bookmark / Save */}
                <button
                  onClick={handleMenuSave}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${isSaved ? "fill-primary text-primary" : "text-secondary"}`}
                  />
                  <span>{isSaved ? "Remove Bookmark" : "Save Bookmark"}</span>
                </button>

                {/* Report Post */}
                <button
                  onClick={handleMenuReport}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <Flag className="w-3.5 h-3.5 text-secondary" />
                  <span>{reported ? "Reported to Mods" : "Report Post"}</span>
                </button>

                {/* Delete Post (Only for the Author) */}
                {isAuthor && (
                  <>
                    <div className="my-1 border-t border-outline-variant/30" />
                    <button
                      onClick={handleMenuDelete}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? "Deleting..." : "Delete Post"}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content Preview */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-on-surface group-hover/card:text-primary transition-colors leading-snug tracking-tight">
          {post.title}
        </h2>
        <p className="text-xs sm:text-sm text-secondary mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
          {post.body.replace(/[#*`_]/g, "")}
        </p>
      </div>

      {/* Technical Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.tags.map((tag, idx) => (
            <Link
              key={idx}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-surface-container-low text-on-surface-variant rounded-md hover:bg-surface-container hover:text-primary cursor-pointer transition-colors font-medium border border-outline-variant/30"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-outline-variant/30 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Upvote Button */}
          <button
            onClick={() => handleReaction("like")}
            disabled={isReacting}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
              userReaction === "like"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-primary hover:bg-surface-container-high"
            }`}
          >
            <ArrowUp className={`w-3.5 h-3.5 ${userReaction === "like" ? "stroke-[2.5]" : ""}`} />
            <span>{likesCount}</span>
          </button>

          {/* Downvote Button */}
          <button
            onClick={() => handleReaction("dislike")}
            disabled={isReacting}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg font-mono text-xs transition-all ${
              userReaction === "dislike"
                ? "bg-rose-100 text-rose-800 font-semibold shadow-sm"
                : "hover:bg-surface-container-low text-secondary hover:text-on-surface"
            }`}
          >
            <ArrowDown className={`w-3.5 h-3.5 ${userReaction === "dislike" ? "stroke-[2.5]" : ""}`} />
            <span>{dislikesCount}</span>
          </button>

          <div className="h-3.5 w-px bg-outline-variant/40 mx-0.5 sm:mx-1" />

          {/* Comments Count */}
          <Link
            href={`/posts/${post._id}`}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg hover:bg-surface-container-low text-secondary hover:text-on-surface transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {post.commentCount}
              <span className="hidden sm:inline"> comments</span>
            </span>
          </Link>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label={isSaved ? "Remove from bookmarks" : "Save post"}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-colors ${
              isSaved
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-surface-container-low text-secondary hover:text-on-surface"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Share Link Button */}
          <button
            onClick={handleShare}
            aria-label="Share post link"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg hover:bg-surface-container-low text-secondary hover:text-on-surface transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-tertiary" />
                <span className="text-tertiary font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-outline font-mono text-[11px]">
          <Eye className="w-3.5 h-3.5" />
          <span>Active</span>
        </div>
      </div>
    </article>
  );
}
