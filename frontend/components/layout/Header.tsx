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
  Home,
  Compass,
  X,
  LogIn,
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
      setMobileSearchOpen(false);
    } else {
      router.push("/");
    }
  };

  const isHome = pathname === "/" || pathname.startsWith("/posts/");
  const isExplore = pathname === "/explore";
  const isSaved = pathname === "/saved";
  const isNotifications = pathname === "/notifications";

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
      // Ignore background errors
    } finally {
      setLoadingNotifs(false);
    }
  }, [isAuthenticated]);

  // Initial fetch and 30s polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.isRead) {
        await notificationsApi.markAsRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setNotifOpen(false);
      if (notif.postId) {
        router.push(`/posts/${notif.postId}`);
      }
    } catch {
      if (notif.postId) {
        router.push(`/posts/${notif.postId}`);
      }
    }
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
  };

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
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
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
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
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
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label="Toggle mobile search"
              className="sm:hidden w-[34px] h-[34px] flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
            >
              {mobileSearchOpen ? <X className="w-5 h-5 text-primary" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Create Post Button (Desktop / Tablet) */}
            <Link
              href="/posts/new"
              className="hidden sm:flex h-[34px] px-3.5 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-lg items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
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
                <div className="absolute right-[-40px] sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl z-50 overflow-hidden">
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

                  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
                    {loadingNotifs ? (
                      <div className="p-6 text-center text-xs text-secondary font-mono">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center gap-2">
                        <Bell className="w-6 h-6 text-outline" />
                        <p className="text-xs text-secondary">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer flex items-start gap-3 ${
                            !notif.isRead ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {notif.sender?.avatarUrl ? (
                              <img
                                src={notif.sender.avatarUrl}
                                alt={notif.sender.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary text-xs font-semibold">
                                {notif.sender?.name?.charAt(0).toUpperCase() || "D"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-on-surface leading-snug">
                              <strong className="font-semibold text-on-surface">
                                {notif.sender?.name || "Someone"}
                              </strong>{" "}
                              {notif.type === "reply_to_comment"
                                ? "replied to your comment:"
                                : notif.type === "comment_on_post"
                                ? "commented on your post:"
                                : notif.type === "reaction_on_post"
                                ? "upvoted your post:"
                                : "reacted to your discussion:"}
                            </p>
                            {notif.body && (
                              <p className="text-xs text-secondary mt-1 line-clamp-1 italic">
                                &ldquo;{notif.body}&rdquo;
                              </p>
                            )}
                            <span className="text-[10px] font-mono text-outline mt-1 block">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-outline-variant/30 text-center bg-surface-container-low">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open full notification inbox</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Session or Login Button */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="User profile menu"
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-outline-variant/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-medium text-on-surface max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-secondary" />
                </button>

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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="h-[34px] px-3 text-xs font-medium text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="h-[34px] px-3 bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center"
                >
                  <span>Join</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 pb-3 pt-1 border-t border-outline-variant/30 bg-surface-container-lowest animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, skills, posts..."
                autoFocus
                className="w-full h-10 pl-9 pr-16 bg-surface border border-outline-variant/60 text-sm text-on-surface placeholder:text-outline rounded-lg outline-none focus:border-primary focus:bg-surface-container-lowest"
              />
              <button
                type="submit"
                className="absolute right-2 px-2.5 py-1 bg-primary text-on-primary text-xs font-medium rounded-md"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Modern Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/40 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] px-2 py-1.5 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            isHome
              ? "text-primary"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? "stroke-[2.5]" : ""}`} />
          <span>Home</span>
        </Link>

        <Link
          href="/explore"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            isExplore
              ? "text-primary"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <Compass className={`w-5 h-5 ${isExplore ? "stroke-[2.5]" : ""}`} />
          <span>Explore</span>
        </Link>

        {/* Center Prominent Create Post Button */}
        <Link
          href="/posts/new"
          className="flex flex-col items-center -mt-4 group"
        >
          <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md group-hover:bg-primary-hover group-hover:scale-105 transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-medium text-secondary mt-0.5">Post</span>
        </Link>

        <Link
          href="/saved"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            isSaved
              ? "text-primary"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-primary" : ""}`} />
          <span>Saved</span>
        </Link>

        <Link
          href={isAuthenticated && user ? `/developers/${user._id}` : "/login"}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            pathname.startsWith("/developers/") || pathname === "/login"
              ? "text-primary"
              : "text-secondary hover:text-on-surface"
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>{isAuthenticated ? "Profile" : "Sign In"}</span>
        </Link>
      </nav>
    </>
  );
}
