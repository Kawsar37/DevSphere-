"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Code2,
  Search,
  Plus,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Bookmark,
  CheckCheck,
  MessageSquare,
  Flame,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { notificationsApi } from "@/services/notifications.api";
import { NotificationItem } from "@/types/api";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  const isHome = pathname === "/" || pathname.startsWith("/posts");
  const isExplore = pathname === "/explore";

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingNotifs(true);
      const res = await notificationsApi.getNotifications(1, 10);
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Ignore network errors in header polling
    } finally {
      setLoadingNotifs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/login");
  };

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationsApi.markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue navigation
      }
    }
    setNotifOpen(false);
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:bg-primary transition-colors">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg text-on-surface tracking-tight">
              DevSphere
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isHome
                  ? "bg-surface-container-high text-primary"
                  : "text-secondary hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isExplore
                  ? "bg-surface-container-high text-primary"
                  : "text-secondary hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              Explore
            </Link>
          </nav>
        </div>

        {/* Middle: Search Bar (Desktop) */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, skills, developers..."
              className="w-full h-[34px] pl-9 pr-14 bg-surface border border-outline-variant/60 text-sm text-on-surface placeholder:text-outline rounded-lg outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 flex items-center text-[11px] text-secondary hover:text-primary bg-surface-container-low border border-outline-variant/50 px-1.5 py-0.5 rounded font-mono transition-colors"
            >
              Enter ↵
            </button>
          </form>
        </div>

        {/* Right: Actions & User Session */}
        <div className="flex items-center gap-3">
          <Link
            href="/posts/new"
            className="h-[34px] px-3.5 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Post</span>
          </Link>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push("/login");
                  return;
                }
                setNotifOpen((prev) => !prev);
              }}
              aria-label="Notifications"
              className="relative w-[34px] h-[34px] flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-on-surface">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[11px] font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
                  {loadingNotifs && notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-secondary">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 text-outline/50 stroke-1" />
                      <p className="text-xs font-medium text-on-surface">All caught up!</p>
                      <p className="text-[11px] text-secondary">
                        No unread notifications right now.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleMarkAsRead(item)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-surface-container-low cursor-pointer transition-colors ${
                          !item.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        {item.sender?.avatarUrl ? (
                          <img
                            src={item.sender.avatarUrl}
                            alt={item.sender.name}
                            className="w-8 h-8 rounded-full object-cover border border-outline-variant/40 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                            {item.sender?.name?.charAt(0).toUpperCase() || "D"}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-on-surface truncate">
                              {item.sender?.name || "Developer"}
                            </p>
                            <span className="text-[10px] font-mono text-outline shrink-0">
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-secondary mt-0.5 line-clamp-2">
                            {item.body}
                          </p>
                          {item.post?.title && (
                            <p className="text-[11px] text-primary/90 font-medium truncate mt-1">
                              ↳ {item.post.title}
                            </p>
                          )}
                        </div>

                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-outline-variant/40 bg-surface text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-primary font-medium hover:underline block py-1"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Session Menu */}
          {isAuthenticated && user ? (
            <div className="relative pl-1 border-l border-outline-variant/40" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-outline-variant/50 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-medium text-on-surface max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-secondary" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-outline-variant/40">
                    <p className="text-xs font-semibold text-on-surface truncate">{user.name}</p>
                    <p className="text-[11px] text-secondary font-mono truncate">{user.email}</p>
                  </div>
                  <Link
                    href={`/developers/${user._id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-secondary" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-secondary" />
                    <span>Edit Profile & Skills</span>
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-secondary" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    href="/saved"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-secondary" />
                    <span>Saved Bookmarks</span>
                  </Link>
                  <div className="my-1 border-t border-outline-variant/30" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1 border-l border-outline-variant/40">
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-primary hover:bg-surface-container-low transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
