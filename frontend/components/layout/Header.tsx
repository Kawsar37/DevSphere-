"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Search, Plus, Bell, ChevronDown } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname.startsWith("/posts");
  const isExplore = pathname === "/explore";

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
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts, skills, developers..."
              className="w-full h-[34px] pl-9 pr-14 bg-surface border border-outline-variant/60 text-sm text-on-surface placeholder:text-outline rounded-lg outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
            <div className="absolute right-2 flex items-center pointer-events-none">
              <kbd className="font-mono text-[11px] text-secondary bg-surface-container-low border border-outline-variant/50 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
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

          <button
            aria-label="Notifications"
            className="relative w-[34px] h-[34px] flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-surface-container-lowest" />
          </button>

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
        </div>
      </div>
    </header>
  );
}
