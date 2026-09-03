"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { developersApi } from "@/services/developers.api";
import { Experience } from "@/types/api";
import {
  User,
  Layers,
  Briefcase,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Experience creation form state
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expFrom, setExpFrom] = useState("");
  const [expTo, setExpTo] = useState("");
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [showAddExp, setShowAddExp] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form fields from user session
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setSkills(user.skills || []);
      setExperiences(user.experiences || []);
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim() || !expFrom.trim()) {
      setError("Please provide title, company, and start date for the experience.");
      return;
    }

    const newExp: Experience = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      from: expFrom.trim(),
      to: expCurrent ? undefined : expTo.trim() || undefined,
      currentlyWorking: expCurrent,
      description: expDesc.trim() || undefined,
    };

    setExperiences([newExp, ...experiences]);

    // Reset experience form
    setExpTitle("");
    setExpCompany("");
    setExpFrom("");
    setExpTo("");
    setExpCurrent(false);
    setExpDesc("");
    setShowAddExp(false);
    setError(null);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await developersApi.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        skills,
        experiences,
      });

      if (res.success && res.data) {
        updateUser(res.data);
        setSuccessMessage("Profile updated successfully!");
      } else {
        setError(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="py-12 max-w-3xl mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/developers/${user._id}`}
          className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>View Public Profile</span>
        </Link>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-on-surface">Basic Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 px-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface" htmlFor="avatarUrl">
              Avatar Image URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="h-9 px-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-on-surface" htmlFor="bio">
            Headline / Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="e.g. Staff Engineer @ Prisma. Obsessed with distributed databases..."
            className="p-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest resize-none"
          />
          <span className="text-[11px] font-mono text-outline self-end">
            {bio.length}/300 characters
          </span>
        </div>
      </div>

      {/* Section 2: Skills Management */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-on-surface">Skills & Technologies</h2>
        </div>

        {/* Add Skill Input */}
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add skill (e.g. Go, PostgreSQL, Docker)"
            className="flex-1 h-9 px-3 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
          <button
            type="submit"
            className="px-3.5 h-9 bg-surface-container-low hover:bg-surface-container text-primary text-xs font-medium rounded-lg flex items-center gap-1 border border-outline-variant/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Skill Badges List */}
        <div className="flex flex-wrap gap-2 pt-1">
          {skills.length > 0 ? (
            skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg bg-surface-container text-primary font-medium border border-outline-variant/30"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-error transition-colors"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-secondary italic">No skills added yet.</p>
          )}
        </div>
      </div>

      {/* Section 3: Experience Management */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-on-surface">Experience Timeline</h2>
          </div>
          {!showAddExp && (
            <button
              onClick={() => setShowAddExp(true)}
              className="px-3 py-1.5 bg-surface-container text-primary hover:bg-surface-container-high text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          )}
        </div>

        {/* Add Experience Drawer/Form */}
        {showAddExp && (
          <form
            onSubmit={handleAddExperience}
            className="p-4 bg-surface rounded-xl border border-outline-variant/50 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
              <span className="text-xs font-semibold text-on-surface">New Experience Entry</span>
              <button
                type="button"
                onClick={() => setShowAddExp(false)}
                className="text-secondary hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Senior Backend Engineer"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="Stripe"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">Start Date *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jan 2022"
                  value={expFrom}
                  onChange={(e) => setExpFrom(e.target.value)}
                  className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface">End Date</label>
                <input
                  type="text"
                  placeholder="e.g. Dec 2024"
                  disabled={expCurrent}
                  value={expTo}
                  onChange={(e) => setExpTo(e.target.value)}
                  className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-xs text-on-surface outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-secondary">
              <input
                type="checkbox"
                checked={expCurrent}
                onChange={(e) => setExpCurrent(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-0"
              />
              <span>I currently work in this role</span>
            </label>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface">Role Description</label>
              <textarea
                rows={2}
                placeholder="Architected ledger pipelines, improved response latency by 35%..."
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded text-xs text-on-surface outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddExp(false)}
                className="px-3 py-1 text-xs text-secondary hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 bg-primary text-on-primary text-xs font-medium rounded hover:bg-primary-hover transition-colors"
              >
                Add to List
              </button>
            </div>
          </form>
        )}

        {/* Existing Experiences List */}
        <div className="flex flex-col gap-3">
          {experiences.length > 0 ? (
            experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-surface rounded-lg border border-outline-variant/40 flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface">{exp.title}</span>
                    <span className="text-xs text-primary font-medium">@ {exp.company}</span>
                    {exp.currentlyWorking && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-outline">
                    {exp.from} — {exp.currentlyWorking ? "Present" : exp.to || "N/A"}
                  </span>
                  {exp.description && (
                    <p className="text-xs text-secondary mt-1">{exp.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveExperience(idx)}
                  className="p-1 text-secondary hover:text-error transition-colors"
                  title="Remove experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-secondary italic">No experiences added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
