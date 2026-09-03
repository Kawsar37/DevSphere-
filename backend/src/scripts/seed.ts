import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ENV } from "../config/env.js";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { Reaction } from "../models/Reaction.js";

async function seed() {
  console.log("[Seeder] Connecting to MongoDB...");
  await mongoose.connect(ENV.MONGODB_URI, {
    dbName: "devsphere",
    serverSelectionTimeoutMS: 5000,
  });

  console.log("[Seeder] Connected to database:", mongoose.connection.name);

  // Clear existing collections to ensure a clean, reproducible state
  console.log("[Seeder] Cleaning existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Reaction.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("DevSphere2026!", 10);

  // 1. Create Developer Personas
  console.log("[Seeder] Creating developer personas...");
  const elena = await User.create({
    name: "Elena Rostova",
    email: "elena@prisma.io",
    passwordHash,
    bio: "Staff Engineer @ Prisma. Obsessed with distributed databases, transactional outbox patterns, and Go concurrency.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    skills: ["Go", "Distributed Systems", "PostgreSQL", "Kafka", "Docker", "Architecture"],
    experiences: [
      {
        title: "Staff Software Engineer",
        company: "Prisma",
        from: "2023",
        currentlyWorking: true,
        description: "Leading query engine architecture and high-throughput connection pooling subsystems.",
      },
      {
        title: "Senior Backend Engineer",
        company: "Stripe",
        from: "2020",
        to: "2023",
        currentlyWorking: false,
        description: "Architected idempotent payment ledger pipelines handling $10B+ in annual transaction volume.",
      },
    ],
  });

  const marcus = await User.create({
    name: "Marcus Vance",
    email: "marcus@netflix.com",
    passwordHash,
    bio: "Principal Systems Architect @ Netflix. Focus on Linux kernel tuning, eBPF tracing, and ultra low-latency networking.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    skills: ["Rust", "C++", "eBPF", "Linux", "Kubernetes", "Low Latency"],
    experiences: [
      {
        title: "Principal Systems Architect",
        company: "Netflix",
        from: "2022",
        currentlyWorking: true,
        description: "Optimizing edge proxy data planes and kernel packet filters for global video delivery.",
      },
      {
        title: "Senior Staff Infrastructure Engineer",
        company: "AWS",
        from: "2018",
        to: "2022",
        currentlyWorking: false,
        description: "Engineered multi-tenant virtualization drivers and hypervisor telemetry.",
      },
    ],
  });

  const sarah = await User.create({
    name: "Sarah Chen",
    email: "sarah@datadog.com",
    passwordHash,
    bio: "Staff Frontend Architect @ Datadog. Deep into React 19 internals, Next.js streaming SSR, and WebAssembly tooling.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
    skills: ["TypeScript", "Next.js", "React", "WebAssembly", "Web Performance"],
    experiences: [
      {
        title: "Staff Frontend Architect",
        company: "Datadog",
        from: "2023",
        currentlyWorking: true,
        description: "Re-architecting observability dashboard render pipelines to eliminate long frames on large timeseries charts.",
      },
      {
        title: "Senior UI Engineer",
        company: "Figma",
        from: "2020",
        to: "2023",
        currentlyWorking: false,
        description: "Built canvas rendering utilities and optimized vector manipulation memory footprints.",
      },
    ],
  });

  // 2. Create Engineering Discussion Posts
  console.log("[Seeder] Creating engineering posts...");
  const post1 = await Post.create({
    authorId: elena._id,
    title: "Why we migrated from distributed transactions to an event-driven Saga pattern in Go",
    body: `Distributed two-phase commits (2PC) brought cascading latencies under peak traffic. Under distributed 2PC, coordinating microservices held database row locks until all network participants acknowledged the prepare and commit phases. A single slow query or packet drop caused systemic queue exhaustion.\n\n### The Redesign Architecture\nWe redesigned our payment & provisioning pipeline with idempotency keys, transactional outbox tables, and asynchronous compensation steps across 14 microservices.\n\n\`\`\`go\ntype SagaStep interface {\n    Execute(ctx context.Context, tx *sql.Tx) error\n    Compensate(ctx context.Context, tx *sql.Tx) error\n}\n\`\`\`\n\nBy leveraging the Transactional Outbox pattern combined with Kafka event log partitioning, we reduced P99 latency by 64% and eliminated database deadlock cascades.`,
    tags: ["Go", "Architecture", "PostgreSQL", "Distributed Systems"],
    likesCount: 14,
    dislikesCount: 1,
    commentCount: 4,
    rankScore: 21, // (14 - 1) + (4 * 2) = 21
  });

  const post2 = await Post.create({
    authorId: marcus._id,
    title: "Zero-overhead socket tracing in production Kubernetes clusters using eBPF",
    body: `Injecting sidecar proxies into thousands of microservice pods adds CPU overhead and increases latency jitter. By compiling lightweight eBPF bytecode programs directly into the Linux kernel socket layer, we achieved deep packet telemetry with under 0.8% CPU utilization.\n\n### The Kernel Hook\nUsing the \`sockops\` program type, we track socket state transitions and TCP round-trip measurements without modifying user-space application binaries.\n\n\`\`\`c\nSEC("sockops")\nint bpf_sockops_monitor(struct bpf_sock_ops *skops) {\n    if (skops->op == BPF_SOCK_OPS_ACTIVE_ESTABLISHED_CB) {\n        // Record socket connection timestamp\n    }\n    return 0;\n}\n\`\`\`\n\nThis approach gives us real-time service dependency graphs across 40,000+ container instances.`,
    tags: ["Rust", "eBPF", "Linux", "Kubernetes"],
    likesCount: 22,
    dislikesCount: 0,
    commentCount: 2,
    rankScore: 26, // (22 - 0) + (2 * 2) = 26
  });

  const post3 = await Post.create({
    authorId: sarah._id,
    title: "Reducing streaming SSR long-tasks in high-density Next.js dashboards",
    body: `When rendering dense dashboards with hundreds of metrics tiles, synchronous hydration can block the browser main thread for over 200ms. In this technical deep dive, we walk through how we combined Next.js 15 Partial Prerendering (PPR) with selective hydration and WebAssembly data crunching.\n\n### Results\n* First Contentful Paint (FCP) improved from 1.4s to 0.45s.\n* Interaction to Next Paint (INP) reduced to 35ms under continuous websocket updates.`,
    tags: ["TypeScript", "Next.js", "React", "Web Performance"],
    likesCount: 9,
    dislikesCount: 1,
    commentCount: 2,
    rankScore: 12, // (9 - 1) + (2 * 2) = 12
  });

  const post4 = await Post.create({
    authorId: elena._id,
    title: "Zero-downtime database migrations with shadow writing in multi-terabyte PostgreSQL",
    body: `Adding large indexes or altering table schemas in multi-terabyte production databases cannot risk exclusive table locks. We detail our 4-phase rollout strategy: 1) Add nullable shadow column, 2) Dual write in application layer, 3) Backfill historical rows in batches, 4) Flip reads and drop legacy column.`,
    tags: ["PostgreSQL", "Database", "DevOps"],
    likesCount: 11,
    dislikesCount: 0,
    commentCount: 1,
    rankScore: 13, // (11 - 0) + (1 * 2) = 13
  });

  // 3. Create Threaded Comments & Nested Replies on Post 1
  console.log("[Seeder] Creating threaded comments...");
  const comment1 = await Comment.create({
    postId: post1._id,
    authorId: marcus._id,
    parentCommentId: null,
    body: "How do you handle compensating transactions when a downstream payment gateway times out without returning a definitive failure code?",
    likesCount: 6,
    dislikesCount: 0,
    replyCount: 2,
  });

  const reply1_1 = await Comment.create({
    postId: post1._id,
    authorId: elena._id,
    parentCommentId: comment1._id,
    body: "Great question, Marcus. We issue a reconciliation polling worker with exponential jitter. If the gateway remains indeterminate after 5 minutes, we dispatch an explicit reversal probe and log the transaction for human review.",
    likesCount: 8,
    dislikesCount: 0,
    replyCount: 1,
  });

  const reply1_1_1 = await Comment.create({
    postId: post1._id,
    authorId: sarah._id,
    parentCommentId: reply1_1._id,
    body: "Do you persist the reversal probe attempts into the transactional outbox table as well, or emit directly to Kafka?",
    likesCount: 3,
    dislikesCount: 0,
    replyCount: 0,
  });

  const reply1_2 = await Comment.create({
    postId: post1._id,
    authorId: marcus._id,
    parentCommentId: comment1._id,
    body: "That makes sense. We had a similar challenge with edge proxies and solved it by using an external idempotency coordinator.",
    likesCount: 2,
    dislikesCount: 0,
    replyCount: 0,
  });

  // Comments on Post 2
  const post2_comment = await Comment.create({
    postId: post2._id,
    authorId: elena._id,
    parentCommentId: null,
    body: "Are you compiling the eBPF programs on the fly on each node, or distributing pre-compiled CO-RE (Compile Once – Run Everywhere) binaries?",
    likesCount: 4,
    dislikesCount: 0,
    replyCount: 1,
  });

  await Comment.create({
    postId: post2._id,
    authorId: marcus._id,
    parentCommentId: post2_comment._id,
    body: "We use CO-RE with BTF (BPF Type Format) enabled in our custom kernel image. The binaries are distributed via an OCI artifact registry alongside the daemonset.",
    likesCount: 5,
    dislikesCount: 0,
    replyCount: 0,
  });

  // 4. Create Reactions
  console.log("[Seeder] Creating sample reactions...");
  await Reaction.create([
    { userId: marcus._id, targetType: "post", targetId: post1._id, reactionType: "like" },
    { userId: sarah._id, targetType: "post", targetId: post1._id, reactionType: "like" },
    { userId: elena._id, targetType: "post", targetId: post2._id, reactionType: "like" },
    { userId: sarah._id, targetType: "post", targetId: post2._id, reactionType: "like" },
    { userId: elena._id, targetType: "post", targetId: post3._id, reactionType: "like" },
    { userId: elena._id, targetType: "comment", targetId: comment1._id, reactionType: "like" },
    { userId: sarah._id, targetType: "comment", targetId: reply1_1._id, reactionType: "like" },
  ]);

  console.log("[Seeder] Database seeding completed successfully!");
  console.log(`[Seeder] Created 3 Developer accounts (password for all: DevSphere2026!):`);
  console.log(`  - elena@prisma.io (Staff Software Engineer @ Prisma)`);
  console.log(`  - marcus@netflix.com (Principal Systems Architect @ Netflix)`);
  console.log(`  - sarah@datadog.com (Staff Frontend Architect @ Datadog)`);
  console.log(`[Seeder] Created 4 Engineering Posts with ranked scores.`);
  console.log(`[Seeder] Created multi-level threaded discussion trees.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seeder] Error during seeding:", err);
  process.exit(1);
});
