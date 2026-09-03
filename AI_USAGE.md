# DevSphere: AI Agentic Workflow Log (`AI_USAGE.md`)

This document provides a transparent, chronological record of the agentic AI workflow used during the development of DevSphere, in adherence to the internship assignment guidelines.

---

## 1. Agent Setup & Tooling
* **AI Model**: Gemini 3.8 Flash (Agentic IDE / Antigravity runtime)
* **Agent Capabilities Used**:
  * `StitchMCP` (`list_screens`, `get_screen`): Inspected the original Stitch project (`3547287210038239860`), extracting design system parameters, color tokens, layout hierarchy, and CSS rules directly from the Figma-to-code design pipeline.
  * `run_command`: Automated environment inspection (Node, npm, PowerShell, Git), background process execution, package installation, and typechecking.
  * `read_url_content` / `view_file`: Analyzed raw screen markup from the Stitch asset pipeline to faithfully reproduce component spacing, typography, and interactive controls.
  * `write_to_file`: Incremental code generation and maintenance of architecture artifacts.

---

## 2. Chronological Log & Milestones

### Step 1: Inspection & Planning
* **User Prompt**: "can you list my stitch projects ?" followed by the full internship specification prompt.
* **Actions Taken**:
  * Listed Stitch projects and identified `DevSphere Developer Platform UI` (`3547287210038239860`).
  * Inspected screens: `DevSphere - Main Ranked Feed`, `DevSphere - Post Detail & Discussion`, `DevSphere - Developer Profile`, and `DevSphere Wordmark Logo`.
  * Verified local environment: Node `v24.15.0`, npm `12.0.2`, empty workspace directory, uninitialized Git.
  * Discovered local MongoDB was not listening on port 27017 and Docker daemon was inactive.
  * Created `implementation_plan.md` artifact detailing phased vertical slices and requested user feedback.
  * Obtained user approval for the implementation plan and received the GitHub repository remote URL (`https://github.com/Kawsar37/DevSphere-.git`).

### Step 2: Phase 1 (Foundation Setup)
* **Tasks Executed**:
  * Initialized local Git repository on `main` branch and linked remote `origin`.
  * Created root `.gitignore`, `.env.example`, and backend/frontend directory structures.
  * Configured Express backend with TypeScript, Mongoose connection with resilient automatic fallback to `mongodb-memory-server` in development mode, Zod error handling, standardized response envelope (`{ success, data, message }` / `{ success, statusCode, message, errors }`), and OpenAPI / Swagger documentation at `/api-docs`.
  * Configured Next.js 15 frontend with App Router, Tailwind CSS (configured with exact Stitch Precision Slate Minimal theme tokens), Geist Sans and JetBrains Mono typography, centralized `apiClient`, and responsive layout shell with sticky navigation header.
  * Verified end-to-end connectivity: Frontend `HomePage` pinging `GET /api/health` returning `{ success: true, data: { status: "ok", database: "connected" } }`.
  * Committed and pushed to GitHub remote `origin/main`.

### Step 3: Phase 2 (Authentication & Session)
* **Tasks Executed**:
  * Built `User` Mongoose model with subdocuments for experience, password comparison method with bcrypt, and sanitized JSON serialization (excluding `passwordHash`).
  * Created Zod validation schemas for registration (`registerSchema`) and login (`loginSchema`).
  * Built `AuthService` handling duplicate email conflicts (409), password hashing (cost factor 10), JWT token issuance, credential verification, and user profile retrieval.
  * Implemented JWT middleware (`authenticate` & `optionalAuth`) attaching decoded claims to `req.user`.
  * Built `AuthController` and registered endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
  * Documented all auth endpoints in Swagger/OpenAPI.
  * Tested registration, duplicate email rejection (409), invalid credentials (401), and token-authorized `/me` endpoint with PowerShell integration tests.
  * Built frontend auth services (`auth.api.ts`), persistent session provider (`AuthContext`), Stitch-themed `/login` and `/register` pages, and responsive `Header` user profile dropdown with sign-out.
  * Verified frontend typecheck and production build with Next.js 15.

### Step 4: Phase 3 (Developer Profiles)
* **Tasks Executed**:
  * Created Zod validation schemas for developer updates (`updateProfileSchema`) and experience entries (`experienceSchema`).
  * Built `DeveloperService` with `getDeveloperById`, `updateOwnProfile`, and `listDevelopers` methods.
  * Built `DeveloperController` and routes: `GET /api/developers/:id`, `PATCH /api/developers/me`, `GET /api/developers`.
  * Updated Swagger documentation with complete OpenAPI schemas for developer profiles.
  * Discovered and resolved MongoDB Atlas index conflict on shared `test` database by enforcing dedicated `dbName: "devsphere"` in connection config.
  * Verified profile update and retrieval against live MongoDB Atlas instance.
  * Built frontend `developers.api.ts` client.
  * Implemented `/developers/[id]` profile page matching Stitch design with avatar, bio, skills badge matrix, and vertical experience timeline.
  * Implemented `/profile/edit` page with live skill tag addition/removal, experience entry creation/deletion, and `AuthContext` state synchronization.
  * Verified complete frontend production build.

### Step 5: Untracking Secrets from Git
* **Tasks Executed**:
  * Executed `git rm --cached` on `.gitignore` and `.env.example` templates per user instruction.
  * Added ignore rules to `.git/info/exclude` to protect local environment files.
  * Committed and pushed immediate cleanup commit to GitHub remote `origin/main`.

### Step 6: Phase 4 (Posts & Ranked Feed)
* **Tasks Executed**:
  * Built `Post` Mongoose model with engagement counters, author virtual populate, and authoritative backend ranking formula: `score = (likes - dislikes) + (commentCount * 2)`.
  * Implemented Zod validation schemas for post publishing (`createPostSchema`) and query sorting (`getPostsQuerySchema`).
  * Built `PostService` handling post creation, pagination, and sorting strategies: `sort=ranked` (rankScore desc, createdAt desc) and `sort=latest` (createdAt desc).
  * Built `PostController` and endpoints: `POST /api/posts`, `GET /api/posts`, `GET /api/posts/:id`.
  * Documented post routes in OpenAPI / Swagger specification.
  * Verified post creation, feed ranking, and single post retrieval against live database.
  * Built frontend `posts.api.ts` client.
  * Built `PostCard` component replicating Stitch design with author tags, rank fire badge (`Rank #X • Score Y`), preview excerpt, tag chips, and interaction buttons.
  * Built `/posts/new` post creation page with tag chip selector, markdown body editor, and validation.
  * Built `/posts/[id]` post detail page with breadcrumbs, author metadata, and formatted technical body.
  * Updated `HomePage` (`/`) with segmented Ranked vs Latest filter tabs, Quick Composer card, loading skeletons, and real backend feed integration.
  * Validated full Next.js production build across all 8 routes.

### Step 7: Phase 5 (Professional Threaded Comment System)
* **Tasks Executed**:
  * Built `Comment` Mongoose model with `postId`, `authorId`, nullable `parentCommentId`, `likesCount`, `dislikesCount`, and `replyCount`.
  * Implemented Zod validation (`createCommentSchema`).
  * Built `CommentService` with recursive tree hierarchy builder (`buildTree` converting flat MongoDB documents into recursive `replies` branches).
  * Implemented atomic `post.commentCount` incrementing and dynamic post `rankScore` recalculation on comment creation.
  * Built `CommentController` and endpoints: `GET /api/posts/:postId/comments`, `POST /api/posts/:postId/comments`, and `POST /api/comments/:commentId/replies`.
  * Documented comment and reply endpoints in OpenAPI / Swagger.
  * Built frontend `comments.api.ts` service and updated API types with `CommentNode`.
  * Built `CommentComposer` with user avatar, multi-line editor, and code block formatting hints.
  * Built `ReplyComposer` supporting inline comment responses directly beneath target comments without page reloading.
  * Built recursive `CommentItem` component featuring author tags (special `Author` badge for post creator), relative timestamps, vertical thread guide lines (`left-4 top-10 bottom-0 w-0.5 bg-primary/20`), and responsive nested indentation.
  * Built `ThreadTree` and integrated it into the `/posts/[id]` page with live count synchronization.
  * Verified complete Next.js production build with 0 errors.

### Step 8: Phase 6 (Post & Comment Reactions & Dynamic Ranking)
* **Tasks Executed**:
  * Built `Reaction` Mongoose model with compound unique index on `{ userId: 1, targetType: 1, targetId: 1 }`.
  * Built `ReactionService` handling full reaction lifecycle:
    * Click same reaction $\rightarrow$ removes reaction (decrement counter).
    * Click opposite reaction $\rightarrow$ flips reaction (decrement old, increment new).
    * Click new reaction $\rightarrow$ adds reaction (increment counter).
    * Automatically recalculates post `rankScore` dynamically whenever reactions change.
    * Batch user reaction lookup to attach `userReaction: "like" | "dislike" | null` to feed posts and comments.
  * Built `ReactionController` and mounted routes: `POST /api/posts/:id/reactions` and `POST /api/comments/:id/reactions`.
  * Updated `GET /api/posts`, `GET /api/posts/:id`, and `GET /api/posts/:postId/comments` with `optionalAuth` to hydrate active user reaction state.
  * Built frontend `reactions.api.ts` service.
  * Added interactive upvote/downvote buttons with optimistic updates and active styles across `PostCard`, `PostDetailPage`, and `CommentItem`.
  * Validated full Next.js production build across all 8 routes.

### Step 9: Phase 7 (Testing Suite, Polish & Documentation)
* **Tasks Executed**:
  * Configured Node.js native test runner in backend (`node --import tsx --test`).
  * Built automated test suites:
    * `backend/tests/ranking.test.ts`: Formula accuracy, discussion weighting, and tie-breaking determinism.
    * `backend/tests/threading.test.ts`: Recursive multi-level comment tree assembly and orphan preservation.
    * `backend/tests/reactions.test.ts`: Add, flip, and remove reaction lifecycle with dynamic post ranking updates.
    * `backend/tests/auth.test.ts`: Bcrypt password hashing and JWT token claims signing/verification.
  * Executed test runner: 13 tests across 4 suites passed in 2.5s with 0 failures.
  * Verified Swagger/OpenAPI documentation at `http://localhost:5000/api-docs` returning HTTP 200.
  * Built comprehensive database seeder script (`backend/src/scripts/seed.ts`, `npm run seed`) populating realistic developer personas, technical posts, multi-level threaded comments, and reaction scores.
  * Authored comprehensive production `README.md` with system architecture mermaid diagrams, quickstart guide, API reference table, and ranking formula breakdown.
  * Finalized `AI_USAGE.md` audit log for the internship evaluation.

### Step 10: Notification System
* **Tasks Executed**:
  * Built `Notification` Mongoose model with recipient, sender, post, comment references, and compound index `{ recipientId: 1, isRead: 1, createdAt: -1 }`.
  * Built `NotificationService` with self-action suppression (`recipientId !== senderId`), paginated retrieval, unread count tracking, and bulk/single mark-as-read.
  * Integrated event-driven notification dispatch in `CommentService` (triggering notifications to post authors on root comments and parent comment authors on nested replies).
  * Built `NotificationController` and endpoints: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, and `PATCH /api/notifications/read-all`.
  * Documented notification endpoints in OpenAPI / Swagger.
  * Tested notification dispatch and mark-as-read flow in PowerShell with live multi-user simulation (Marcus commenting on Elena's post).
  * Built frontend `notifications.api.ts` client.
  * Updated `Header` component with real-time unread badge, popover dropdown with mark-all-read action, sender avatars, post shortcuts, and unread indicator dots.
  * Built dedicated `/notifications` page with "All" vs "Unread" filter tabs, loading skeletons, and empty state cards matching Stitch design.
  * Validated full Next.js production build with 9 routes compiled cleanly.

---

## 3. Key Architecture Decisions Reviewed by User
1. **Vertical Slice Execution Order**: Phase 1 Foundation $\rightarrow$ Phase 2 Authentication $\rightarrow$ Phase 3 Profiles $\rightarrow$ Phase 4 Ranked Feed $\rightarrow$ Phase 5 Threaded Comments $\rightarrow$ Phase 6 Reactions $\rightarrow$ Phase 7 Docs & Polish.
2. **Standardized Response Envelope**: Enforced uniform JSON payload structure across all endpoints to eliminate ad-hoc response parsing on the client.
3. **Resilient Local Database Strategy**: Integrated `mongodb-memory-server` as a development fallback so that the backend starts immediately even if the developer's local MongoDB service is offline, while honoring `MONGODB_URI` when provided.
4. **Session Persistence**: Stored auth tokens securely in client-side storage, with transparent verification against `GET /api/auth/me` on application boot.
5. **Database Isolation**: Set explicit `dbName: "devsphere"` to isolate application collections from colliding with other tables on shared Atlas clusters.
6. **Authoritative Post Ranking**: Exclusively calculated on the backend (`(likes - dislikes) + (commentCount * 2)`) with tie-break on `createdAt` descending, ensuring zero client-side ranking drift.
7. **Threaded Discussion Architecture**: Stored normalized comments with `parentCommentId` in MongoDB, reconstructed into a recursive tree structure on query, and maintained atomic counter updates on the parent post.
8. **Compound Unique Index for Reactions**: Enforced `{ userId: 1, targetType: 1, targetId: 1 }` in MongoDB to prevent race conditions or duplicate reactions, with deterministic toggle/flip/remove logic.

---

## 4. Discovered Bugs & Iterative Fixes
* **Issue**: Local MongoDB was not running on port 27017, causing Mongoose connection timeouts.
  * **Fix**: Implemented a graceful catch block in `backend/src/config/db.ts` that dynamically launches an in-memory MongoDB 7.0 daemon for zero-friction local development while logging clear diagnostic information.
* **Issue**: PowerShell `curl` command resolution on Windows.
  * **Fix**: Used explicit `curl.exe` with structured JSON parsing to test endpoints reliably across environments.
* **Issue**: Next.js detected parent directory lockfiles during production build.
  * **Fix**: Explicitly configured `outputFileTracingRoot: path.join(__dirname, "./")` in `frontend/next.config.ts`.
* **Issue**: Pre-existing `user_email` index in shared Atlas cluster `test` database caused duplicate key error (E11000) on insertion of users with null `user_email`.
  * **Fix**: Configured explicit `dbName: "devsphere"` in `mongoose.connect()` options, ensuring DevSphere operates on its own clean, dedicated database.
