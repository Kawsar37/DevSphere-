"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { developersApi } from "@/services/developers.api";
import { useAuth } from "@/features/auth/AuthContext";
import { User } from "@/types/api";
import {
  Calendar,
  Briefcase,
  Code,
  Edit3,
  ArrowLeft,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function DeveloperProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user: currentUser } = useAuth();

  const [developer, setDeveloper] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeveloper() {
      setLoading(true);
      setError(null);
      try {
        const res = await developersApi.getDeveloperById(id);
        if (res.success && res.data) {
          setDeveloper(res.data);
        } else {
          setError(res.message || "Developer profile not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load developer profile");
      } finally {
        setLoading(false);
      }
    }

    loadDeveloper();
  }, [id]);

  const isOwnProfile = currentUser?._id === developer?._id;

  if (loading) {
    return (
      <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-6 w-28 bg-surface-container rounded" />
        <div className="h-56 bg-surface-container-lowest rounded-xl border border-outline-variant/30" />
        <div className="h-36 bg-surface-container-lowest rounded-xl border border-outline-variant/30" />
        <div className="h-48 bg-surface-container-lowest rounded-xl border border-outline-variant/30" />
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="py-12 max-w-lg mx-auto flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-red-50 text-error rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-on-surface">Couldn&apos;t load profile</h2>
        <p className="text-sm text-secondary">{error || "Developer not found."}</p>
        <Link
          href="/"
          className="mt-2 px-4 py-2 bg-primary text-on-primary text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const joinDate = new Date(developer.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="py-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {developer.avatarUrl ? (
              <img
                src={developer.avatarUrl}
                alt={developer.name}
                className="w-20 h-20 rounded-2xl object-cover border border-outline-variant/50 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center text-2xl font-semibold shadow-sm">
                {developer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  {developer.name}
                </h1>
                <span className="font-mono text-xs text-secondary bg-surface-container px-2 py-0.5 rounded">
                  @{developer.email.split("@")[0]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-outline font-mono mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {joinDate}</span>
                </span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-primary font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-outline-variant/40 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>

        {/* Bio */}
        {developer.bio ? (
          <div className="pt-4 border-t border-outline-variant/30">
            <p className="text-sm text-on-surface leading-relaxed">{developer.bio}</p>
          </div>
        ) : (
          <div className="pt-4 border-t border-outline-variant/30 text-xs text-secondary italic">
            No bio provided yet.
          </div>
        )}

        {/* Quick Stats Pill Row */}
        <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/30 text-xs font-mono text-secondary">
          <span className="flex items-center gap-1.5">
            <Code className="w-4 h-4 text-primary" />
            <strong className="text-on-surface">{developer.skills?.length || 0}</strong> Skills
          </span>
          <span className="text-outline">•</span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" />
            <strong className="text-on-surface">{developer.experiences?.length || 0}</strong> Roles
          </span>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Skills & Technologies</h2>
          </div>
          <span className="font-mono text-xs text-secondary bg-surface-container px-2 py-0.5 rounded-full">
            {developer.skills?.length || 0}
          </span>
        </div>

        {developer.skills && developer.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {developer.skills.map((skill, idx) => (
              <span
                key={idx}
                className="font-mono text-xs px-3 py-1.5 rounded-lg bg-surface-container text-primary font-medium border border-outline-variant/30 transition-all hover:bg-surface-container-high"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-secondary bg-surface rounded-lg border border-dashed border-outline-variant/60">
            No skills added yet.
          </div>
        )}
      </div>

      {/* Engineering Experience Timeline */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Experience & Roles</h2>
          </div>
          <span className="font-mono text-xs text-secondary bg-surface-container px-2 py-0.5 rounded-full">
            {developer.experiences?.length || 0}
          </span>
        </div>

        {developer.experiences && developer.experiences.length > 0 ? (
          <div className="relative pl-6 flex flex-col gap-6 pt-2">
            {/* Continuous Vertical Timeline Line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-primary/20 rounded-full" />

            {developer.experiences.map((exp, idx) => (
              <div key={idx} className="relative flex flex-col gap-1.5">
                {/* Timeline Bullet Node */}
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest" />

                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">{exp.title}</h3>
                    <p className="text-xs text-primary font-medium">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-outline" />
                    <span>
                      {exp.from} — {exp.currentlyWorking ? "Present" : exp.to || "N/A"}
                    </span>
                    {exp.currentlyWorking && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                </div>

                {exp.description && (
                  <p className="text-xs text-secondary leading-relaxed mt-1 bg-surface p-3 rounded-lg border border-outline-variant/30">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-secondary bg-surface rounded-lg border border-dashed border-outline-variant/60">
            No experience added yet.
          </div>
        )}
      </div>
    </div>
  );
}
