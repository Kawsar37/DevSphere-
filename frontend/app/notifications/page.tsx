"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { notificationsApi } from "@/services/notifications.api";
import { NotificationItem } from "@/types/api";
import {
  Bell,
  CheckCheck,
  ArrowLeft,
  MessageSquare,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications(1, 50);
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationsApi.markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue
      }
    }
    router.push(`/posts/${item.postId}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

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

  const filtered = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  return (
    <div className="py-8 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-0.5 font-sans">
              Stay updated on discussions, replies, and community interactions.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-mono text-xs font-medium transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-primary-container text-on-primary font-semibold"
              : "bg-surface-container text-secondary hover:text-on-surface"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "unread"
              ? "bg-primary-container text-on-primary font-semibold"
              : "bg-surface-container text-secondary hover:text-on-surface"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant/20">
        {loading ? (
          <div className="p-12 text-center text-xs text-secondary flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 animate-spin text-primary" />
            <span>Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-on-surface">No notifications</h3>
            <p className="text-xs text-secondary max-w-sm">
              {filter === "unread"
                ? "You have read all of your notifications. Nice work!"
                : "When other developers comment on your posts or reply to your threads, they will appear here."}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => handleMarkAsRead(item)}
              className={`p-5 flex items-start gap-4 hover:bg-surface-container-low cursor-pointer transition-colors relative ${
                !item.isRead ? "bg-primary/[0.03]" : ""
              }`}
            >
              {/* Sender Avatar */}
              <Link
                href={`/developers/${item.senderId}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 group"
              >
                {item.sender?.avatarUrl ? (
                  <img
                    src={item.sender.avatarUrl}
                    alt={item.sender.name}
                    className="w-10 h-10 rounded-full object-cover border border-outline-variant/40 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-sm font-semibold group-hover:bg-primary transition-colors">
                    {item.sender?.name?.charAt(0).toUpperCase() || "D"}
                  </div>
                )}
              </Link>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-xs text-on-surface">
                      {item.sender?.name || "Developer"}
                    </span>
                    <span className="text-xs text-secondary">
                      {item.type === "reply_to_comment"
                        ? "replied to your comment"
                        : "commented on your post"}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-outline shrink-0">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-secondary mt-1 line-clamp-2 bg-surface p-2.5 rounded-lg border border-outline-variant/30 font-sans">
                  "{item.body}"
                </p>

                {item.post?.title && (
                  <p className="text-xs text-primary font-medium truncate mt-2">
                    ↳ On post: <span className="underline">{item.post.title}</span>
                  </p>
                )}
              </div>

              {/* Unread indicator */}
              {!item.isRead && (
                <div className="flex flex-col items-center justify-center self-center shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
