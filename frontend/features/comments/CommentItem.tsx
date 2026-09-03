"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CommentNode } from "@/types/api";
import { ReplyComposer } from "./ReplyComposer";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  CornerDownRight,
  MoreHorizontal,
} from "lucide-react";

interface CommentItemProps {
  comment: CommentNode;
  postAuthorId?: string;
  onAddReply: (parentCommentId: string, body: string) => Promise<void>;
  depth?: number;
}

export function CommentItem({
  comment,
  postAuthorId,
  onAddReply,
  depth = 0,
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);

  // Format relative time
  const formatTimeAgo = (dateStr: string | Date) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const authorName = comment.author?.name || "Developer";
  const authorEmail = comment.author?.email || "dev@devsphere.io";
  const handle = authorEmail.split("@")[0];
  const isPostAuthor = postAuthorId && comment.authorId === postAuthorId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleReplySubmit = async (body: string) => {
    await onAddReply(comment._id, body);
    setShowReply(false);
  };

  return (
    <div className="relative flex flex-col gap-2">
      {/* Visual Vertical Thread Guide Line for Comments with Replies */}
      {hasReplies && (
        <div className="absolute left-3.5 sm:left-4 top-10 bottom-0 w-0.5 bg-primary/20 rounded-full" />
      )}

      {/* Main Comment Bubble / Body */}
      <div className="bg-surface p-4 rounded-xl border border-outline-variant/40 flex flex-col gap-2 relative z-10 hover:border-outline-variant/70 transition-colors">
        {/* Author Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Link href={`/developers/${comment.authorId}`} className="shrink-0">
              {comment.author?.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt={authorName}
                  className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-semibold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/developers/${comment.authorId}`}
                className="font-semibold text-xs text-on-surface hover:text-primary transition-colors"
              >
                {authorName}
              </Link>
              <span className="font-mono text-[11px] text-secondary">@{handle}</span>
              {isPostAuthor && (
                <span className="px-1.5 py-0.2 bg-primary-container text-on-primary rounded text-[10px] font-bold">
                  Author
                </span>
              )}
              <span className="text-outline text-[11px]">•</span>
              <span className="font-mono text-[11px] text-outline">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          <button
            aria-label="Comment options"
            className="text-secondary hover:text-on-surface p-1 rounded transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Comment Body Text */}
        <p className="text-xs sm:text-sm text-on-surface leading-relaxed pl-9 whitespace-pre-line font-sans">
          {comment.body}
        </p>

        {/* Action Row */}
        <div className="flex items-center gap-3 pl-9 pt-1 text-xs font-mono text-secondary">
          <div className="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded text-[11px]">
            <button
              aria-label="Upvote comment"
              className="hover:text-primary transition-colors flex items-center gap-0.5"
            >
              <ArrowUp className="w-3 h-3" />
              <span>{comment.likesCount}</span>
            </button>
            <span className="text-outline">/</span>
            <button
              aria-label="Downvote comment"
              className="hover:text-error transition-colors flex items-center gap-0.5"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => setShowReply(!showReply)}
            className="flex items-center gap-1 hover:text-primary transition-colors text-[11px] font-medium"
          >
            <CornerDownRight className="w-3 h-3" />
            <span>Reply</span>
          </button>
        </div>

        {/* Inline Reply Composer */}
        {showReply && (
          <div className="pl-9">
            <ReplyComposer
              parentAuthorName={authorName}
              onReply={handleReplySubmit}
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}
      </div>

      {/* Recursive Nested Replies Container */}
      {hasReplies && (
        <div className="pl-4 sm:pl-7 md:pl-8 flex flex-col gap-3 mt-1 relative">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postAuthorId={postAuthorId}
              onAddReply={onAddReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
