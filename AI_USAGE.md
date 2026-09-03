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

---

## 3. Key Architecture Decisions Reviewed by User
1. **Vertical Slice Execution Order**: Phase 1 Foundation $\rightarrow$ Phase 2 Authentication $\rightarrow$ Phase 3 Profiles $\rightarrow$ Phase 4 Ranked Feed $\rightarrow$ Phase 5 Threaded Comments $\rightarrow$ Phase 6 Reactions $\rightarrow$ Phase 7 Docs & Polish.
2. **Standardized Response Envelope**: Enforced uniform JSON payload structure across all endpoints to eliminate ad-hoc response parsing on the client.
3. **Resilient Local Database Strategy**: Integrated `mongodb-memory-server` as a development fallback so that the backend starts immediately even if the developer's local MongoDB service is offline, while honoring `MONGODB_URI` when provided.
4. **Session Persistence**: Stored auth tokens securely in client-side storage, with transparent verification against `GET /api/auth/me` on application boot.
5. **Database Isolation**: Set explicit `dbName: "devsphere"` to isolate application collections from colliding with other tables on shared Atlas clusters.

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
