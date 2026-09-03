# DevSphere 🌐

> A production-minded developer community platform engineered for the Agentic Software Engineer internship assignment.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📖 Overview

**DevSphere** is a high-density, technical community platform engineered for software engineers, systems architects, and technical leaders. DevSphere blends the precision of modern developer tooling (IDE aesthetics, JetBrains Mono code rendering, keyboard shortcuts) with collaborative speed.

The platform is designed around strict engineering principles:
* **Visual Identity**: Strictly based on the **Precision Slate Minimal** Stitch design (`#2563eb`, Geist and JetBrains Mono typography, 3-column / 2-column App Shell).
* **Incremental Architecture**: Clean separation between Next.js (App Router) and an Express.js TypeScript API.
* **Predictable API Envelope**: Standardized `{ success, data, message }` and `{ success, statusCode, message, errors }` shapes for all responses.
* **Deterministic Post Ranking**: Authoritative backend ranking formula factoring user engagement and upvote velocity.
* **Professional Threaded Discussion**: Multi-level hierarchical comment tree with vertical connector guides, inline reply composer, and reaction counters.

---

## 🏛️ System Architecture

```text
DevSphere/
├── frontend/                     # Next.js 15 (App Router), React 19, Tailwind CSS
│   ├── app/                      # Route segments (Feed, Posts, Developers, Profile, Auth)
│   ├── components/               # Reusable UI & layout elements
│   ├── features/                 # Modular domain slices (auth, posts, comments, reactions, profiles)
│   ├── services/                 # Centralized API client layer
│   ├── types/                    # Shared API contract and domain models
│   └── tailwind.config.ts        # Stitch Precision Slate Minimal tokens
│
├── backend/                      # Node.js, Express.js, TypeScript, Mongoose
│   ├── src/
│   │   ├── config/               # Database connection (with memory-server fallback) & env
│   │   ├── controllers/          # Thin HTTP controllers
│   │   ├── middleware/           # JWT auth, Zod validation, centralized error handling
│   │   ├── models/               # Mongoose schemas (User, Post, Comment, Reaction)
│   │   ├── routes/               # RESTful API route definitions
│   │   ├── services/             # Core business logic & ranking calculations
│   │   ├── utils/                # Standardized response envelopes & custom errors
│   │   ├── docs/                 # Swagger / OpenAPI documentation
│   │   └── app.ts                # Express application definition
│   └── server.ts                 # Server bootstrap & lifecycle management
│
├── README.md                     # Complete project documentation
├── AI_USAGE.md                   # Real agentic engineering transcript & decision log
└── .env.example                  # Environment configuration template
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
* **Node.js**: `v20+` (tested on `v24.15.0`)
* **npm**: `v10+`
* **MongoDB**: Local MongoDB instance, MongoDB Atlas URI, or fallback in-memory MongoDB (auto-started in development).

### 1. Clone the Repository
```bash
git clone https://github.com/Kawsar37/DevSphere-.git
cd DevSphere-
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

Key environment variables:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/devsphere` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `devsphere_jwt_super_secret_key_...` |
| `CORS_ORIGIN` | Allowed client origin | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend API target | `http://localhost:5000/api` |

*(Note: If no external MongoDB is reachable in development mode, the backend automatically initializes an in-memory MongoDB 7.0 instance for seamless local testing).*

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
```
The backend will be available at `http://localhost:5000`.
* **Swagger API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
* **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will run at [http://localhost:3000](http://localhost:3000).

---

## 🧮 Post Ranking Algorithm

Post ranking is calculated **authoritatively on the backend**:

$$\text{Score} = (\text{Likes} - \text{Dislikes}) + (\text{CommentCount} \times 2)$$

* **Sorting**: Primary sort by `rankScore` descending; tie-breaking sort by `createdAt` descending.
* **Integrity**: Clients never calculate ranking; the API delivers posts pre-ordered.

---

## 🛡️ Security & Integrity
* **Password Hashing**: Passwords stored exclusively as `bcrypt` hashes (cost factor 10).
* **Token Authentication**: Signed JSON Web Tokens (JWT) verified by Express middleware.
* **Compound Unique Reactions**: MongoDB index on `(userId, targetType, targetId)` guarantees a user cannot submit conflicting or duplicate reactions.
* **Input Validation**: Request bodies, route parameters, and query parameters validated with `Zod`.
* **Centralized Error Handling**: Safe error envelopes prevent leakage of internal stack traces in production.

---

## 📜 API Documentation & Specification

Interactive OpenAPI 3.0 documentation is served locally via Swagger UI:
* **URL**: `http://localhost:5000/api-docs`
* **JSON Schema**: `http://localhost:5000/api-docs.json`
