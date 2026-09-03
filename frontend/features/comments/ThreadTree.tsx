"use client";

import React, { useState, useEffect } from "react";
import { commentsApi } from "@/services/comments.api";
import { CommentNode } from "@/types/api";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";

interface ThreadTreeProps {
  postId: string;
  postAuthorId?: string;
  onCommentCountChange?: (count: number) => void;
}

export function ThreadTree({
  postId,
  postAuthorId,
  onCommentCountChange,
}: ThreadTreeProps) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await commentsApi.getComments(postId);
      if (res.success && res.data) {
        setComments(res.data.tree);
        setTotalCount(res.data.total);
        if (onCommentCountChange) {
          onCommentCountChange(res.data.total);
        }
      } else {
        setError(res.message || "Failed to load discussion.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleCreateRootComment = async (body: string) => {
    const res = await commentsApi.createRootComment(postId, body);
    if (res.success) {
      await loadComments();
    } else {
      throw new Error(res.message || "Failed to post comment.");
    }
  };

  const handleAddReply = async (parentCommentId: string, body: string) => {
    const res = await commentsApi.createReply(parentCommentId, body);
    if (res.success) {
      await loadComments();
    } else {
      throw new Error(res.message || "Failed to post reply.");
    }
  };

  return (
    <section className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-on-surface">Discussion</h2>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-medium">
            {totalCount}
          </span>
        </div>
        <span className="text-xs font-mono text-secondary">
          Threaded conversation active
        </span>
      </div>

      {/* Top-Level Root Comment Composer */}
      <CommentComposer onSubmit={handleCreateRootComment} />

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 text-error rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={loadComments}
            className="ml-auto underline font-medium hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Thread list */}
      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 bg-surface rounded-xl border border-outline-variant/30 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-container" />
                <div className="h-3 w-28 bg-surface-container rounded" />
              </div>
              <div className="h-3 w-full bg-surface-container rounded pl-9" />
              <div className="h-3 w-2/3 bg-surface-container rounded pl-9" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center gap-2.5 bg-surface rounded-xl border border-dashed border-outline-variant/60">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-on-surface">No comments yet</h3>
          <p className="text-xs text-secondary max-w-sm">
            Be the first to share your perspective, review technical decisions, or ask clarifying questions.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postAuthorId={postAuthorId}
              onAddReply={handleAddReply}
            />
          ))}
        </div>
      )}
    </section>
  );
}
