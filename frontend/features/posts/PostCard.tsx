"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post } from "@/types/api";
import { useAuth } from "@/features/auth/AuthContext";
import { reactionsApi } from "@/services/reactions.api";
import {
  Flame,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Eye,
} from "lucide-react";

interface PostCardProps {
  post: Post;
  rankIndex?: number;
}

export function PostCard({ post, rankIndex }: PostCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    post.userReaction || null
  );
  const [isReacting, setIsReacting] = useState(false);

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

  const handleReaction = async (reactionType: "like" | "dislike") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isReacting) return;
    setIsReacting(true);

    // Optimistic calculation
    const prevLikes = likesCount;
    const prevDislikes = dislikesCount;
    const prevReaction = userReaction;

    if (prevReaction === reactionType) {
      // Toggle OFF
      setUserReaction(null);
      if (reactionType === "like") setLikesCount(Math.max(0, prevLikes - 1));
      else setDislikesCount(Math.max(0, prevDislikes - 1));
    } else if (prevReaction) {
      // Flip
      setUserReaction(reactionType);
      if (reactionType === "like") {
        setLikesCount(prevLikes + 1);
        setDislikesCount(Math.max(0, prevDislikes - 1));
      } else {
        setLikesCount(Math.max(0, prevLikes - 1));
        setDislikesCount(prevDislikes + 1);
      }
    } else {
      // New
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
        // Rollback
        setLikesCount(prevLikes);
        setDislikesCount(prevDislikes);
        setUserReaction(prevReaction);
      }
    } catch {
      // Rollback
      setLikesCount(prevLikes);
      setDislikesCount(prevDislikes);
      setUserReaction(prevReaction);
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <article className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm hover:shadow-md transition-shadow relative flex flex-col gap-4">
      {/* Top Author & Rank Metadata */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/developers/${post.authorId}`} className="shrink-0 group">
            {post.author?.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/40 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-semibold group-hover:bg-primary transition-colors">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/developers/${post.authorId}`}
                className="font-semibold text-sm text-on-surface hover:text-primary transition-colors"
              >
                {authorName}
              </Link>
              <span className="font-mono text-xs text-secondary">@{handle}</span>
              <span className="text-outline text-xs">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-primary font-mono text-[11px] font-medium">
                {role}
              </span>
            </div>
            <span className="font-mono text-[11px] text-outline mt-0.5">
              {formatTimeAgo(post.createdAt)} • Community Post
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rankIndex !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-primary font-mono text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span>
                Rank #{rankIndex + 1} • Score {post.rankScore}
              </span>
            </span>
          )}
          <button
            aria-label="Post actions"
            className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container-low transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post Content Preview */}
      <div>
        <Link href={`/posts/${post._id}`}>
          <h2 className="text-lg font-semibold text-on-surface hover:text-primary transition-colors leading-snug tracking-tight">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {post.body.replace(/[#*`_]/g, "")}
        </p>
      </div>

      {/* Technical Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="font-mono text-xs px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-md hover:bg-surface-container cursor-pointer transition-colors font-medium border border-outline-variant/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs">
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <button
            onClick={() => handleReaction("like")}
            disabled={isReacting}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-xs transition-all ${
              userReaction === "dislike"
                ? "bg-rose-100 text-rose-800 font-semibold shadow-sm"
                : "hover:bg-surface-container-low text-secondary hover:text-on-surface"
            }`}
          >
            <ArrowDown className={`w-3.5 h-3.5 ${userReaction === "dislike" ? "stroke-[2.5]" : ""}`} />
            <span>{dislikesCount}</span>
          </button>

          <div className="h-3.5 w-px bg-outline-variant/40 mx-1" />

          {/* Comments Count */}
          <Link
            href={`/posts/${post._id}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-surface-container-low text-secondary hover:text-on-surface transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.commentCount} comments</span>
          </Link>

          <button
            aria-label="Save post"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-surface-container-low text-secondary hover:text-on-surface transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-outline font-mono text-[11px]">
          <Eye className="w-3.5 h-3.5" />
          <span>Active</span>
        </div>
      </div>
    </article>
  );
}
