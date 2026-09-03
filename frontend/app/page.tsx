"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import { SystemHealth } from "@/types/api";
import { CheckCircle2, Server, Database, Layers, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await apiClient.get<SystemHealth>("/health");
        if (res.success && res.data) {
          setHealth(res.data);
        } else {
          setError(res.message || "Failed to reach backend");
        }
      } catch (err: any) {
        setError(err.message || "Error checking system health");
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  return (
    <div className="py-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Hero Header */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-surface-container text-primary font-medium tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 text-primary" /> Phase 1 Foundation Active
          </span>
          <span className="text-outline text-xs">•</span>
          <span className="text-secondary text-xs">Precision Slate Minimal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
          DevSphere Developer Community Platform
        </h1>
        <p className="text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
          Production-minded platform for software engineers. Engineered with Next.js, Express,
          TypeScript, and MongoDB with strict validation and consistent response envelopes.
        </p>
      </div>

      {/* Full-Stack Health & Verification Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next.js Frontend Status */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-secondary font-medium tracking-wider">
              Frontend Client
            </span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Next.js 15 App Router</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              Tailwind CSS, Geist & JetBrains Mono typography active.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono text-outline">
            <span>Status</span>
            <span className="text-emerald-600 font-semibold">ONLINE</span>
          </div>
        </div>

        {/* Express Backend Status */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-secondary font-medium tracking-wider">
              Backend Service
            </span>
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold text-on-surface flex items-center gap-2">
              {loading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : health ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              )}
              <span>Express + TypeScript</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              {loading
                ? "Pinging /api/health..."
                : health
                ? `Uptime: ${Math.round(health.uptime)}s | Centralized error handler active`
                : error || "Offline"}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono text-outline">
            <span>Swagger Docs</span>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              /api-docs ↗
            </a>
          </div>
        </div>

        {/* MongoDB Database Status */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-secondary font-medium tracking-wider">
              Data Store
            </span>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold text-on-surface flex items-center gap-2">
              {loading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : health?.database === "connected" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              )}
              <span>MongoDB & Mongoose</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              {loading
                ? "Connecting..."
                : health?.database === "connected"
                ? "State: Connected with fallback resilience"
                : `State: ${health?.database || "Connecting..."}`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono text-outline">
            <span>Database</span>
            <span
              className={
                health?.database === "connected"
                  ? "text-emerald-600 font-semibold uppercase"
                  : "text-amber-600 font-semibold uppercase"
              }
            >
              {health?.database || "CONNECTING"}
            </span>
          </div>
        </div>
      </div>

      {/* Next Up: Phase 2 Banner */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-surface-container-lowest text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">
              Foundation verified. Next up: Phase 2 Authentication
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Secure registration, login, JWT token auth middleware, and user profiles.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
