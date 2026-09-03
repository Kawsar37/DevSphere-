"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { developersApi } from "@/services/developers.api";
import { postsApi } from "@/services/posts.api";
import { User, Post } from "@/types/api";
import { PostCard } from "@/features/posts/PostCard";
import {
  Compass,
  Sparkles,
  Search,
  Server,
  Database,
  Cpu,
  Shield,
  Layers,
  Flame,
  ArrowUpRight,
  UserCheck,
  Code2,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";

// Curated technical domains with metadata
const TOPIC_HUBS = [
  {
    name: "Distributed Systems",
    tag: "Distributed Systems",
    category: "systems",
    icon: Server,
    desc: "Consensus protocols, Raft, event streaming, replication & fault tolerance.",
    count: "12 discussions",
  },
  {
    name: "eBPF & Kernel Tracing",
    tag: "eBPF",
    category: "systems",
    icon: Cpu,
    desc: "Socket observability, kprobes, Linux tracepoints, and zero-overhead telemetry.",
    count: "8 discussions",
  },
  {
    name: "Database Internals",
    tag: "PostgreSQL",
    category: "databases",
    icon: Database,
    desc: "LSM trees, WAL write amplification, B-Trees, ClickHouse & query planners.",
    count: "15 discussions",
  },
  {
    name: "Rust & Systems",
    tag: "Rust",
    category: "languages",
    icon: Code2,
    desc: "Zero-copy memory safety, async runtimes, Tokio, and high-performance services.",
    count: "19 discussions",
  },
  {
    name: "Kubernetes & Infra",
    tag: "Kubernetes",
    category: "cloud",
    icon: Layers,
    desc: "Service meshes, ingress controllers, multi-tenant cluster scheduling.",
    count: "11 discussions",
  },
  {
    name: "System Security & IAM",
    tag: "Security",
    category: "cloud",
    icon: Shield,
    desc: "Zero-trust network architecture, cryptographic attestations, JWTs & mutual TLS.",
    count: "6 discussions",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [developers, setDevelopers] = useState<User[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadExploreData() {
      setLoading(true);
      try {
        const [devRes, postsRes] = await Promise.all([
          developersApi.listDevelopers(),
          postsApi.getPosts({ sort: "ranked", limit: 3 }),
        ]);

        if (devRes.success && devRes.data) {
          setDevelopers(devRes.data);
        }

        if (postsRes.success && postsRes.data) {
          setTopPosts(postsRes.data.posts);
        }
      } catch (err) {
        console.error("Failed to load explore data", err);
      } finally {
        setLoading(false);
      }
    }

    loadExploreData();
  }, []);

  // Filter topics
  const filteredTopics = TOPIC_HUBS.filter((topic) => {
    const matchesCategory =
      selectedCategory === "all" || topic.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter developers by search
  const filteredDevelopers = developers.filter((dev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      dev.name.toLowerCase().includes(q) ||
      dev.email.toLowerCase().includes(q) ||
      (dev.bio && dev.bio.toLowerCase().includes(q)) ||
      (dev.skills && dev.skills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="py-8 max-w-5xl mx-auto flex flex-col gap-10">
      {/* 1. Hero Exploration Header */}
      <section className="bg-surface-container-lowest p-6 sm:p-10 rounded-2xl border border-outline-variant/40 shadow-sm relative overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col gap-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-surface-container text-primary font-medium w-fit border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>DEVSPHERE RADAR • SYSTEM HUBS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
            Explore Production Insights & Engineering Guilds
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed mt-1">
            Discover peer-reviewed system architectures, deep dive into technical topics, and connect with lead engineers building mission-critical platforms.
          </p>
        </div>

        {/* Live Search & Discovery Filter Bar */}
        <div className="relative flex items-center max-w-lg mt-1">
          <Search className="absolute left-3.5 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, skills, or senior engineers..."
            className="w-full h-11 pl-10 pr-4 bg-surface border border-outline-variant/60 rounded-xl text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:bg-surface-container-lowest transition-all shadow-sm"
          />
        </div>
      </section>

      {/* 2. Technical Topic Hubs */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span>Technical Domains & Guilds</span>
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Explore discussions cataloged by low-level and high-scale architecture domains.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Hubs" },
              { id: "systems", label: "Systems & Kernel" },
              { id: "databases", label: "Storage & DBs" },
              { id: "languages", label: "Languages" },
              { id: "cloud", label: "Infra & Cloud" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <Link
                key={topic.tag}
                href={`/?tag=${encodeURIComponent(topic.tag)}`}
                className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-[11px] text-secondary bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/30">
                      {topic.count}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
                      <span>{topic.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h3>
                    <p className="text-xs text-secondary mt-1 leading-relaxed line-clamp-2">
                      {topic.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-mono text-primary font-medium">
                  <span>Browse #{topic.tag} feed</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Senior Engineers & Architects */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Senior Engineers & Architects</span>
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Follow principal engineers, system designers, and open-source core contributors.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-secondary font-mono text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading engineers network...</span>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 text-center text-xs text-secondary">
            No engineers matched your search filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDevelopers.slice(0, 6).map((dev) => {
              const handle = dev.email.split("@")[0];
              const role = dev.bio || "Senior Software Engineer";
              return (
                <div
                  key={dev._id}
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 hover:border-primary/40 shadow-sm flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <Link href={`/developers/${dev._id}`} className="shrink-0 group">
                      {dev.avatarUrl ? (
                        <img
                          src={dev.avatarUrl}
                          alt={dev.name}
                          className="w-12 h-12 rounded-full object-cover border border-outline-variant/40 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-base font-semibold">
                          {dev.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/developers/${dev._id}`}
                          className="font-semibold text-sm text-on-surface hover:text-primary truncate transition-colors"
                        >
                          {dev.name}
                        </Link>
                        <span className="font-mono text-[11px] text-secondary">@{handle}</span>
                      </div>
                      <p className="text-xs text-secondary mt-0.5 line-clamp-1">
                        {role}
                      </p>

                      {/* Skills Chips */}
                      {dev.skills && dev.skills.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                          {dev.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] px-2 py-0.5 bg-surface-container-low text-on-surface-variant rounded border border-outline-variant/30"
                            >
                              {skill}
                            </span>
                          ))}
                          {dev.skills.length > 4 && (
                            <span className="font-mono text-[10px] text-outline">
                              +{dev.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-outline flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      <span>Verified Engineer</span>
                    </span>
                    <Link
                      href={`/developers/${dev._id}`}
                      className="px-3 py-1 bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-mono text-xs font-semibold rounded-lg transition-colors border border-outline-variant/30"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Curated High-Impact Discussions */}
      {topPosts.length > 0 && (
        <section className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span>Highest-Ranked Architecture Analyses</span>
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Production retrospectives, performance benchmarks, and postmortems voted highest by the community.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {topPosts.map((post, idx) => (
              <PostCard key={post._id} post={post} rankIndex={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
