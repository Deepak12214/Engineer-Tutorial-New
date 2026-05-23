# EngineerTutorial Platform — System Design & Functional Requirements

> **Stack:** Next.js 14 App Router · MongoDB Atlas · NextAuth.js · Razorpay · Monaco Editor · Judge0 · Tailwind CSS
> **Author:** Deepak Kumar · **Version:** 1.0 · **Date:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Functional Requirements](#2-functional-requirements)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Data Architecture — MongoDB Schemas](#4-data-architecture--mongodb-schemas)
5. [API Architecture](#5-api-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Content System & Gating](#7-content-system--gating)
8. [Payment System — Razorpay](#8-payment-system--razorpay)
9. [Code Execution System](#9-code-execution-system)
10. [AI Chatbot Integration](#10-ai-chatbot-integration)
11. [Admin Panel Architecture](#11-admin-panel-architecture)
12. [SEO Architecture](#12-seo-architecture)
13. [Frontend Architecture](#13-frontend-architecture)
14. [Security Architecture](#14-security-architecture)
15. [Deployment Architecture](#15-deployment-architecture)

---

## 1. Project Overview

### 1.1 What We Are Building

A production-grade CS learning platform similar to **GeeksforGeeks** and **HelloInterview**, focused on:
- System Design, Apache Kafka, LLD, HLD, AWS, GenAI, DSA
- Built-in Monaco code editor with Judge0 execution
- AI chatbot sidebar (proxied to a separate AI service)
- Free + Pro subscription model (Razorpay)
- Fully CMS-driven admin panel (no code deploy to change content)

### 1.2 Key Differentiators

| Differentiator | Description |
|---|---|
| Block-based CMS | All content is `blocks[]` JSON — admin edits without touching code |
| Server-side content gating | API slices `blocks[]` for free users — security is NOT on the client |
| Context-aware AI | AI chatbot auto-injects the current topic into its system prompt |
| DB-driven navigation | Header, footer, announcement bar all in MongoDB — live changes, zero deploy |
| Dual image upload | Admin can upload to Cloudinary (CDN URL) OR static `/public` folder (self-hosted path) |
| All blogs free | `isPremium` flag exists ONLY on Topics — every blog is publicly readable |

### 1.3 User Roles & Access Matrix

| Role | Free Topics | Premium Topics | Blogs | Dashboard | Admin Panel |
|---|---|---|---|---|---|
| `guest` | ✅ Full | 🔒 Preview only | ✅ Full | ❌ | ❌ |
| `free_user` | ✅ Full | 🔒 Preview + upgrade modal | ✅ Full | ✅ | ❌ |
| `premium_user` | ✅ Full | ✅ Full | ✅ Full | ✅ | ❌ |
| `author` | ✅ Full | ✅ Full | ✅ Full | ✅ | ✅ Content only |
| `admin` | ✅ Full | ✅ Full | ✅ Full | ✅ | ✅ Full |
| `super_admin` | ✅ Full | ✅ Full | ✅ Full | ✅ | ✅ Full + promote others |

---

## 2. Functional Requirements

### 2.1 User Management

#### 2.1.1 Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | Register with email + password (bcrypt hashed) | P0 |
| FR-1.2 | Login with Google OAuth (NextAuth GoogleProvider) | P0 |
| FR-1.3 | Login with GitHub OAuth (NextAuth GithubProvider) | P0 |
| FR-1.4 | JWT-based session — role + subscriptionStatus in token payload | P0 |
| FR-1.5 | Email verification required after email/password registration | P1 |
| FR-1.6 | Password reset via OTP email link | P1 |
| FR-1.7 | "Remember me" — 30-day token expiry vs default 24h | P2 |
| FR-1.8 | Account deletion — full data wipe (User, Progress, Bookmarks) | P2 |

#### 2.1.2 User Profile

| ID | Requirement |
|---|---|
| FR-2.1 | Display name, bio, avatar image URL |
| FR-2.2 | Link GitHub and LinkedIn profile URLs |
| FR-2.3 | Preferred theme (light / dark / system) — persisted in DB and synced across devices |
| FR-2.4 | Toggle email notification preferences per type |
| FR-2.5 | Subscription status badge shown on profile |

#### 2.1.3 Progress Tracking

| ID | Requirement |
|---|---|
| FR-3.1 | "Mark as Complete" button on every topic |
| FR-3.2 | Per-course completion percentage (0–100%) |
| FR-3.3 | Course sidebar shows green checkmark on completed topics |
| FR-3.4 | "Resume Learning" button — links to last visited topic per course |
| FR-3.5 | User dashboard shows all in-progress courses with progress bars |
| FR-3.6 | Daily login streak counter (consecutive active days) |

#### 2.1.4 Bookmarks

| ID | Requirement |
|---|---|
| FR-4.1 | Bookmark any topic or blog post with one click |
| FR-4.2 | Bookmarks tab in dashboard lists all saved items (topic or blog) |
| FR-4.3 | Remove bookmarks |

---

### 2.2 Content Management

#### 2.2.1 Content Hierarchy

```
Platform
├── Course           (e.g., "System Design")
│   ├── Section      (e.g., "Fundamentals")
│   │   ├── Topic    (e.g., "What is Load Balancing?")   ← can be isPremium
│   │   └── Topic    (e.g., "CAP Theorem")
│   └── Section      (e.g., "Advanced Topics")
│       └── Topic    ...
└── Blog             (e.g., "Why Netflix Never Crashes")   ← ALWAYS FREE
```

#### 2.2.2 Block-Based Content Format

Every Topic and Blog stores content as an **ordered array of blocks**. Each block: `{ type: string, content: any }`.

| Block Type | `content` Shape | Rendered As |
|---|---|---|
| `heading` | `{ text }` | `<h1>` — main section title |
| `smallHeading` | `{ text }` | `<h2>` — subsection |
| `mediumHeading` | `{ text }` | `<h3>` — sub-subsection |
| `text` | `{ text }` | `<p>` — supports `**bold**`, `_italic_`, `[[label\|url]]` links |
| `list` | `{ items: string[] }` | `<ul>` bullet list |
| `orderedList` | `{ items: string[] }` | `<ol>` numbered list |
| `code` | `{ language, code, filename? }` | Syntax-highlighted code block + Copy + Run button |
| `table` | `{ headers: string[], rows: string[][] }` | `<table>` |
| `image` | `{ src, alt, caption? }` | `<figure>` with lazy loading |
| `callout` | `{ type: 'info'\|'warning'\|'tip', text }` | Colored highlighted box |
| `video` | `{ url, type: 'youtube'\|'hosted' }` | Embedded player |
| `quiz` | `{ question, options: string[], answer: number }` | MCQ with reveal |
| `badge` | `{ items: {label, color}[] }` | Tag chips row |
| `line` | `{}` | `<hr>` divider |
| `gap` | `{ size: 'sm'\|'md'\|'lg' }` | Vertical spacer |

#### 2.2.3 Topic Requirements

| ID | Requirement |
|---|---|
| FR-5.1 | Topics have: slug, title, heading, blocks[], isPremium, previewBlockCount, order, estimatedReadTime, tags[], status |
| FR-5.2 | `isPremium: true` enables content gating. Default: false |
| FR-5.3 | `previewBlockCount` — number of blocks shown to free users. Default: 3 |
| FR-5.4 | Status: `draft` → `published` → `archived`. Only `published` served to end users |
| FR-5.5 | Topics have full SEO fields: metaTitle, metaDescription, ogImage, canonical |
| FR-5.6 | "Scheduled publish" — admin sets future datetime; cron or revalidation triggers on that time |

#### 2.2.4 Blog Requirements

| ID | Requirement |
|---|---|
| FR-6.1 | Blogs use identical block format to Topics |
| FR-6.2 | **NO `isPremium` field on Blogs** — all blogs are always publicly readable |
| FR-6.3 | Blogs have: slug, title, subtitle, coverImage, tags[], author, publishedAt, rating |
| FR-6.4 | Related articles suggested at bottom (matched by tags) |
| FR-6.5 | Blog listing shows cover image, tags, estimated read time, rating |

#### 2.2.5 Code Block Features

| ID | Requirement |
|---|---|
| FR-7.1 | Syntax highlighting on all code blocks (read-only in content view) |
| FR-7.2 | "Copy Code" button on every code block |
| FR-7.3 | "Open in Playground" button — loads code + language into `/playground` |
| FR-7.4 | "Ask AI about this code" button — injects code into AI chat window |
| FR-7.5 | Multiple language tabs per code block (e.g., Python / Java / Go) |

---

### 2.3 Content Gating

| Scenario | API Returns | Client Shows |
|---|---|---|
| Guest → free topic | All blocks | Full content |
| Guest → premium topic | `blocks[0..previewBlockCount]` + `isGated: true` | Preview + "Login to Continue" modal |
| Free user → premium topic | `blocks[0..previewBlockCount]` + `isGated: true` | Preview + "Subscribe to Unlock" modal |
| Pro user → any topic | All blocks + `isGated: false` | Full content |
| Any user → any blog | All blocks | Full content (no gating) |

> **Security Note:** The API enforces gating. The client blur overlay is UX-only. A user who removes the overlay via DevTools still only has the preview blocks — there are no additional blocks in the DOM.

---

### 2.4 Code Editor & Execution

| ID | Requirement |
|---|---|
| FR-8.1 | Monaco Editor (`@monaco-editor/react`) — VS Code engine |
| FR-8.2 | 8 languages: JavaScript, Python, Java, C++, Go, SQL, Rust, Bash |
| FR-8.3 | Theme auto-syncs with site light/dark toggle |
| FR-8.4 | Font size +/- controls |
| FR-8.5 | "Reset to starter code" restores original block content |
| FR-8.6 | Code execution via Judge0 API (sandboxed — never on own servers) |
| FR-8.7 | Execution: 5s timeout, 256MB memory limit |
| FR-8.8 | Output panel: stdout, stderr, execution time (ms), memory (KB), exit code |
| FR-8.9 | stdin input field for programs requiring user input |
| FR-8.10 | Rate limiting: 10 runs/minute per IP (Node.js in-memory Map — resets on restart) |
| FR-8.11 | Standalone `/playground` page with full-screen layout |
| FR-8.12 | `?lang=python` query param pre-selects language in playground |

---

### 2.5 AI Chatbot

| ID | Requirement |
|---|---|
| FR-9.1 | Floating panel anchored to bottom-right of every page |
| FR-9.2 | States: closed (button only) → open (full 400px wide panel) |
| FR-9.3 | **Free and unlimited for ALL users** — no message caps, no login required |
| FR-9.4 | Keyboard shortcut: Ctrl+/ (Cmd+/) toggles panel |
| FR-9.5 | When on a topic page: topic title + course name injected into system prompt |
| FR-9.6 | "Explain this topic" button → pre-fills chat with current topic title |
| FR-9.7 | "Ask AI about this code" → injects code into chat input |
| FR-9.8 | Suggested prompt chips shown when chat is empty |
| FR-9.9 | All requests proxied via `/api/ai/chat` — client never calls AI service directly |
| FR-9.10 | Responses streamed token-by-token (ReadableStream / SSE) |
| FR-9.11 | Fallback: "AI assistant is temporarily unavailable" if service is down |
| FR-9.12 | Chat history persists in client state for the session (NOT stored in DB in MVP) |

---

### 2.6 Admin Panel

| Module | Key Capabilities |
|---|---|
| **Dashboard** | Stats cards (users, MRR, DAU, content), revenue bar chart, recent activity feed |
| **Content — Block Editor** | Create/edit Topics & Blogs. 14 block types. Drag-and-drop reorder. Live preview. Auto-save draft every 30s. |
| **Content — Metadata** | Slug (auto + editable), course/section assign, isPremium toggle, estimatedReadTime, tags, SEO fields |
| **Content — Image Upload** | Option A: Cloudinary upload → URL. Option B: Static upload → `/public/uploads/` → path. Both in same dialog. |
| **Navigation Builder** | Header links (add/remove/reorder), dropdown menus, CTA button, announcement bar. Saves to `SiteConfig` DB doc. |
| **SEO Manager** | Per-content meta title/description/OG image. Global SEO defaults. Completeness score. Sitemap regenerate. |
| **User Management** | Search/filter/paginate users. Grant/revoke Pro. Change role. Ban. Export CSV. |
| **Subscription Management** | View active/cancelled subs. Razorpay refund API. Webhook event log. |

---

### 2.7 Subscription & Payments

| Plan | Access | Price |
|---|---|---|
| Free | All free topics + all blogs | Free forever |
| Pro Monthly | All topics + all blogs | ₹299/month |
| Pro Annual | All topics + all blogs | ₹2,499/year (~₹208/mo) |

**No trial period.** Free content is always accessible. Premium requires payment.

---

### 2.8 Search

| ID | Requirement |
|---|---|
| FR-10.1 | Global Ctrl+K search modal — available on all pages |
| FR-10.2 | MongoDB text index on: topic title, blog title, course title, tags |
| FR-10.3 | Results grouped by type: Topics / Blogs / Courses |
| FR-10.4 | Lock icon on gated topic results |
| FR-10.5 | Recent searches stored in `localStorage` — shown as default suggestions |
| FR-10.6 | Blog listing page has tag-based filter + text search |

---

### 2.9 Navigation Architecture

| Element | Behaviour |
|---|---|
| Header | Sticky. Logo + nav links + search icon + theme toggle + auth CTA |
| Announcement bar | Above header, configurable from admin (text, link, color, enable/disable) |
| "Learn" dropdown | Hover → shows all courses with icons, DB-driven |
| User avatar dropdown | Dashboard, Billing, Logout |
| Mobile | Hamburger menu drawer |
| Course sidebar | Course title + progress bar + collapsible sections + topic list |
| Completed topic | Green checkmark in sidebar |
| Premium topic | Lock icon + amber "PRO" badge for non-premium users |
| Table of Contents | Auto-generated from `heading` blocks. Highlights current section on scroll. |
| Prev/Next buttons | Bottom of each topic — navigates to adjacent topic in section order |
| Breadcrumbs | Home > Learn > [Course] > [Section] > [Topic] |
| Reading progress bar | Thin accent line at very top of page — fills as user scrolls |

---

## 3. High-Level Architecture

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Public Pages │  │  Dashboard   │  │  Admin Panel │  │  AI Chat     │    │
│  │  /learn      │  │  /dashboard  │  │  /admin      │  │  (floating)  │    │
│  │  /blogs      │  │  /billing    │  │  /admin/cms  │  └──────┬───────┘    │
│  │  /pricing    │  └──────────────┘  │  /admin/seo  │         │            │
│  └──────┬───────┘                    └──────────────┘         │            │
│         │  HTTPS Requests                                      │            │
└─────────┼────────────────────────────────────────────────────┼─────────────┘
          │                                                      │
          ▼                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS 14 APP ROUTER (Vercel)                      │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     SERVER COMPONENTS (SSR/ISR)                      │    │
│  │  generateMetadata()   │  getSiteConfig()   │  Topic/Blog pages       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          API ROUTES (/api/*)                         │    │
│  │                                                                       │    │
│  │  /auth/[...nextauth]  /topics/[id]   /ai/chat    /code/execute      │    │
│  │  /razorpay/*          /admin/*        /upload/*   /search            │    │
│  └──────┬────────────────────────┬──────────────┬────────────┬─────────┘    │
│         │                        │              │            │               │
│    middleware.ts (route protection via JWT)      │            │               │
└─────────┼────────────────────────┼──────────────┼────────────┼──────────────┘
          │                        │              │            │
          ▼                        ▼              ▼            ▼
   ┌─────────────┐     ┌──────────────────┐  ┌──────────┐  ┌──────────────┐
   │  MongoDB    │     │  External APIs   │  │ Judge0   │  │  Cloudinary  │
   │  Atlas      │     │                  │  │ API      │  │  (images)    │
   │             │     │  ┌────────────┐  │  │          │  └──────────────┘
   │  7 collections     │  │ AI Service │  │  │ Sandboxed│
   │  Users      │     │  │ (yours)    │  │  │ execution│
   │  Courses    │     │  └────────────┘  │  └──────────┘
   │  Sections   │     │  ┌────────────┐  │
   │  Topics     │     │  │ Razorpay   │  │
   │  Blogs      │     │  │ (payments) │  │
   │  SiteConfig │     │  └────────────┘  │
   │  Progress   │     └──────────────────┘
   └─────────────┘
```

### 3.2 Request Lifecycle

```
Browser                   Next.js Server              MongoDB / External APIs
   │                           │                               │
   │──── GET /learn/system-design/fundamentals/load-balancing ▶│
   │                           │                               │
   │                    [middleware.ts]                        │
   │                    Check JWT in cookie                    │
   │                    ✓ Public route — pass through          │
   │                           │                               │
   │                    [Server Component]                     │
   │                    generateMetadata()─────────────────────▶ Topic.findOne()
   │                           │◀──────────────────────────────  { metaTitle, ogImage }
   │                           │                               │
   │                    getSiteConfig('navigation')────────────▶ SiteConfig.findOne()
   │                           │◀──────────────────────────────  { header, announcement }
   │                           │                               │
   │                    GET /api/topics/[id]                   │
   │                           │─────── auth() ────────────────▶ Verify JWT
   │                           │◀──────────────────────────────  { user: { role, subscriptionStatus } }
   │                           │                               │
   │                           │── Topic.findById() ───────────▶
   │                           │◀─────────────────────────────  { blocks[], isPremium, previewBlockCount }
   │                           │                               │
   │                    [Content Gating Logic]                 │
   │                    if (isPremium && !isPro) {             │
   │                      return blocks.slice(0, previewBlockCount)  │
   │                      + isGated: true                      │
   │                    }                                      │
   │                           │                               │
   │◀──── HTML + hydration data (React Server Components) ─────│
   │                           │                               │
   │ [Client renders]          │                               │
   │ If isGated: show blur overlay + upgrade modal             │
   │ Floating AI chat button visible                           │
   │ Mark as Complete button visible (if logged in)            │
```

---

## 4. Data Architecture — MongoDB Schemas

### 4.1 Entity Relationship Overview

```
Users ──────────────────────────────────────────────────────┐
  │ (1:many via Progress)                                     │
  ▼                                                           │
Progress ──── references ──── Course                         │
                                │                             │
                           (1:many)                          │
                                ▼                             │
                            Section                           │
                                │                             │
                           (1:many)                          │
                                ▼                             │
                            Topic ◀── isPremium flag          │
                                      blocks[] array          │
                                      SEO fields              │
                                                              │
Blog (standalone) ◀─────────────────────────────────────────┘
  No course/section. No isPremium.
  blocks[] same format as Topic.

SiteConfig (key-value store)
  key: 'navigation'  → header, footer, announcement config
  key: 'global-seo'  → title template, default OG image
```

### 4.2 Users Collection

```typescript
{
  _id:                ObjectId,
  email:              String,        // unique, indexed
  name:               String,
  image:              String,        // avatar URL
  hashedPassword:     String,        // null for OAuth users
  provider:           'email' | 'google' | 'github',

  // Role & Subscription
  role:               'free_user' | 'premium_user' | 'author' | 'admin' | 'super_admin',
  subscriptionStatus: 'free' | 'pro' | 'cancelled',
  razorpayPaymentId:  String,        // last successful payment ID
  currentPeriodEnd:   Date,          // when Pro access expires

  // Profile
  bio:                String,
  github:             String,        // github.com/username
  linkedin:           String,        // linkedin.com/in/username

  // Activity
  streak:             Number,        // consecutive login days
  lastActiveDate:     Date,
  theme:              'light' | 'dark' | 'system',
  emailNotifications: Boolean,

  createdAt:          Date,
  updatedAt:          Date,
}

Indexes:
  email: unique
```

### 4.3 Courses Collection

```typescript
{
  _id:            ObjectId,
  slug:           String,    // unique, indexed — URL identifier
  title:          String,
  description:    String,
  icon:           String,    // emoji or image URL
  thumbnail:      String,    // cover image
  category:       'system-design' | 'lld' | 'hld' | 'kafka' | 'aws' | 'genai' | 'spark' | 'interview' | 'dsa',
  difficulty:     'beginner' | 'intermediate' | 'advanced',
  tags:           [String],
  authorId:       ObjectId,  // ref: Users
  totalTopics:    Number,    // denormalized count (updated on topic create/delete)
  estimatedHours: Number,
  status:         'draft' | 'published' | 'archived',

  // SEO
  metaTitle:       String,
  metaDescription: String,
  ogImage:         String,

  publishedAt:    Date,
  createdAt:      Date,
  updatedAt:      Date,
}
```

### 4.4 Sections Collection

```typescript
{
  _id:         ObjectId,
  courseId:    ObjectId,    // ref: Courses, indexed
  slug:        String,
  title:       String,
  description: String,
  order:       Number,      // display order within course
  createdAt:   Date,
}
```

### 4.5 Topics Collection ← Core Content Document

```typescript
{
  _id:               ObjectId,
  sectionId:         ObjectId,    // ref: Sections, indexed
  courseId:          ObjectId,    // ref: Courses, indexed (for queries without joining sections)
  slug:              String,      // indexed
  title:             String,      // nav label
  heading:           String,      // display H1 (can differ from nav title)
  order:             Number,      // position within section

  // THE CONTENT
  blocks: [
    {
      type:    String,            // see block types table in §2.2.2
      content: Mixed,            // structure varies by type
    }
  ],

  // Gating
  isPremium:         Boolean,    // default: false
  previewBlockCount: Number,     // default: 3 — blocks shown to free users

  // Metadata
  estimatedReadTime: Number,     // minutes
  tags:              [String],
  status:            'draft' | 'published' | 'archived',
  scheduledAt:       Date,       // future publish time (optional)

  // SEO
  metaTitle:         String,
  metaDescription:   String,
  ogImage:           String,

  publishedAt:       Date,
  createdAt:         Date,
  updatedAt:         Date,
}

Indexes:
  { courseId: 1, sectionId: 1, order: 1 }
  { slug: 1 }
  Text index: { title: 'text', tags: 'text' }
```

### 4.6 Blogs Collection

```typescript
{
  _id:         ObjectId,
  slug:        String,    // unique, indexed
  title:       String,
  subtitle:    String,
  blocks:      [BlockSchema],    // IDENTICAL format to Topics
  // NO isPremium field — all blogs are always free
  tags:        [String],
  coverImage:  String,
  authorId:    ObjectId,    // ref: Users
  rating:      Number,       // 0–5
  status:      'draft' | 'published' | 'archived',

  // SEO
  metaTitle:         String,
  metaDescription:   String,
  ogImage:           String,

  publishedAt: Date,
  createdAt:   Date,
  updatedAt:   Date,
}

Text Index: { title: 'text', subtitle: 'text', tags: 'text' }
```

### 4.7 SiteConfig Collection (Key-Value Store)

```typescript
{
  _id:       ObjectId,
  key:       String,        // unique: 'navigation' | 'global-seo'
  data:      Mixed,         // flexible JSON payload (see example below)
  updatedAt: Date,
  updatedBy: ObjectId,      // ref: Users (which admin changed this)
}
```

**`navigation` document data shape:**

```json
{
  "header": {
    "links": [
      { "label": "Learn", "type": "dropdown", "href": "/learn", "visible": true,
        "children": [
          { "label": "System Design", "href": "/learn/system-design", "icon": "🏗️" },
          { "label": "Apache Kafka",  "href": "/learn/kafka",         "icon": "⚡" }
        ]
      },
      { "label": "Blogs",    "type": "link", "href": "/blogs",    "visible": true },
      { "label": "Pricing",  "type": "link", "href": "/pricing",  "visible": true },
      { "label": "Roadmaps", "type": "link", "href": "/roadmaps", "visible": false }
    ],
    "ctaLabel": "Get Started",
    "ctaHref": "/register"
  },
  "announcement": {
    "enabled": true,
    "text":    "🚀 New: AWS for Engineers — Use code LAUNCH50 for 50% off",
    "link":    "/learn/aws",
    "bgColor": "#2563eb"
  },
  "footer": {
    "description": "Learn system design, Kafka, and more — built by engineers.",
    "links": [{ "label": "About", "href": "/about" }],
    "socials": [{ "platform": "github", "url": "https://github.com/..." }]
  }
}
```

### 4.8 Progress Collection

```typescript
{
  _id:                  ObjectId,
  userId:               ObjectId,    // ref: Users
  courseId:             ObjectId,    // ref: Courses
  completedTopics:      [ObjectId],  // array of completed Topic IDs
  lastVisitedTopicId:   ObjectId,    // for "Resume Learning" button
  completionPercentage: Number,      // 0–100

  updatedAt: Date,
}

Index: { userId: 1, courseId: 1 } — unique compound index
```

---

## 5. API Architecture

### 5.1 Complete API Route Map

```
app/api/
├── auth/
│   └── [...nextauth]/route.ts           POST — NextAuth handlers
│
├── courses/
│   ├── route.ts                         GET  — list published courses
│   └── [courseId]/
│       ├── route.ts                     GET  — course metadata
│       └── sections/route.ts            GET  — sections + topics list (no block content)
│
├── topics/
│   └── [topicId]/route.ts               GET  — full topic (premium-gated server-side)
│
├── blogs/
│   ├── route.ts                         GET  — blog list  ?page=&category=&search=
│   └── [slug]/route.ts                  GET  — full blog (always public)
│
├── search/route.ts                      GET  — ?q=&type=all|topics|blogs|courses
│
├── user/
│   ├── me/route.ts                      GET, PUT  — profile (auth required)
│   ├── progress/route.ts                GET, POST — mark topic complete (auth required)
│   └── bookmarks/
│       ├── route.ts                     GET, POST — list, add bookmark
│       └── [id]/route.ts                DELETE    — remove bookmark
│
├── ai/
│   └── chat/route.ts                    POST — streaming proxy to AI service (open to all)
│
├── code/
│   └── execute/route.ts                 POST — Judge0 proxy (rate limited 10/min/IP)
│
├── razorpay/
│   ├── create-order/route.ts            POST — create Razorpay order (auth required)
│   ├── verify-payment/route.ts          POST — HMAC verify + update subscription
│   └── webhook/route.ts                 POST — async Razorpay events
│
├── upload/
│   ├── cloudinary/route.ts              POST — multipart → Cloudinary → returns { url }
│   └── static/route.ts                  POST — multipart → /public/uploads/ → { path }
│
└── admin/                               (admin/author role required on all routes)
    ├── stats/route.ts                   GET  — dashboard stats
    ├── content/
    │   ├── topics/
    │   │   ├── route.ts                 GET, POST   — list all, create new
    │   │   └── [id]/route.ts            GET, PUT, DELETE — read, update, archive
    │   └── blogs/
    │       ├── route.ts                 GET, POST
    │       └── [id]/route.ts            GET, PUT, DELETE
    ├── courses/route.ts                 GET, POST, PUT — manage courses & sections
    ├── navigation/route.ts              GET, PUT — SiteConfig 'navigation' document
    ├── seo/
    │   └── [type]/[id]/route.ts         GET, PUT — SEO fields for topic|blog|course
    ├── users/
    │   ├── route.ts                     GET  — paginated user list
    │   └── [id]/route.ts                PUT  — update role/subscription/ban
    └── subscriptions/
        ├── route.ts                     GET  — all subscriptions
        └── refund/[id]/route.ts         POST — issue Razorpay refund
```

### 5.2 Response Shape Conventions

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string } }

// Gated topic (partial content)
{
  ...topicFields,
  blocks: Block[],          // sliced to previewBlockCount
  isGated: true,
  totalBlocks: number,      // so client knows how much is hidden
}

// Full topic
{
  ...topicFields,
  blocks: Block[],          // all blocks
  isGated: false,
}
```

---

## 6. Authentication & Authorization

### 6.1 Auth Flow Diagram

```
User clicks "Login"
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ Login Page (/login)                                    │
│                                                        │
│  ┌─────────────────┐  ┌───────────────┐               │
│  │ Email + Password │  │ Google / GitHub│              │
│  └────────┬────────┘  └───────┬───────┘               │
└───────────┼───────────────────┼───────────────────────┘
            │                   │
            ▼                   ▼
    CredentialsProvider    OAuth Provider
            │                   │
            ▼                   ▼
    ┌───────────────────────────────────┐
    │  NextAuth authorize() callback    │
    │                                   │
    │  Email:   User.findOne({email})   │
    │           bcrypt.compare(password)│
    │                                   │
    │  OAuth:   User.findOneAndUpdate() │
    │           upsert: true            │
    │           (create if first login) │
    └───────────────┬───────────────────┘
                    │ User object returned
                    ▼
    ┌───────────────────────────────────┐
    │  jwt() callback                   │
    │                                   │
    │  token.role = user.role           │
    │  token.subscriptionStatus = ...   │
    │  token.currentPeriodEnd = ...     │
    └───────────────┬───────────────────┘
                    │ JWT written to httpOnly cookie
                    ▼
    ┌───────────────────────────────────┐
    │  session() callback               │
    │  session.user.role = token.role   │
    │  session.user.subscriptionStatus  │
    └───────────────┬───────────────────┘
                    │
                    ▼
            Redirect based on role:
            admin/author → /admin
            others       → /dashboard
```

### 6.2 Route Protection — middleware.ts

```
Every request to /dashboard/* or /admin/*:
        │
        ▼
   Read JWT from cookie
        │
   ┌────┴────────────────────────────────┐
   │                                      │
   ▼ No JWT                               ▼ JWT exists
Redirect to /login              Check role
                                          │
                          ┌───────────────┼──────────────────┐
                          │               │                  │
                     /dashboard      /admin/*          /admin/*
                          │           role = admin     role != admin
                          ▼           author           ▼
                    Any logged-in     super_admin  Redirect to /
                    user passes       ▼
                                  Pass through
```

### 6.3 Permission Levels in API Routes

```typescript
// Three levels of protection:

// 1. Public — no auth check
export async function GET(req: Request) {
  // anyone can call this
}

// 2. Session required (dashboard routes)
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// 3. Admin/Author only
export async function GET(req: Request) {
  const session = await auth();
  const adminRoles = ['admin', 'super_admin', 'author'];
  if (!session || !adminRoles.includes(session.user.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

---

## 7. Content System & Gating

### 7.1 Content Publishing Workflow

```
Admin opens Block Editor
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│  BlockEditor Component                                        │
│                                                              │
│  Left: Block Palette          Center: Blocks           Right │
│  [+ Heading    ]             ┌──────────────────┐     Meta  │
│  [+ Text       ]             │ ≡ Heading Block   │     ────  │
│  [+ Code       ]             │   "What is LB?"  │     Slug  │
│  [+ Callout    ]             ├──────────────────┤     isPro │
│  [+ Image      ]             │ ≡ Text Block     │     Tags  │
│  [+ Table      ]             │   "Load balan..." │     SEO   │
│  [+ Quiz       ]             ├──────────────────┤           │
│  [+ Video      ]             │ ≡ Code Block     │   Status  │
│                              │   ```python...   │   [Draft] │
│                              └──────────────────┘   [Publish]│
└──────────────────────────────────────────────────────────────┘
        │ Auto-save every 30s to DB with status: 'draft'
        │
        ▼ Admin clicks "Publish"
┌──────────────────────────────────┐
│  PUT /api/admin/content/topics/[id]  │
│  { blocks, status: 'published' } │
└────────────────┬─────────────────┘
                 │
                 ▼
         MongoDB update
         topic.status = 'published'
         topic.publishedAt = new Date()
                 │
                 ▼
         revalidatePath(`/learn/${courseSlug}/${sectionSlug}/${topicSlug}`)
         revalidatePath('/sitemap.xml')
                 │
                 ▼
         Next.js ISR cache invalidated
         Next request to topic URL → fresh SSR
         Subsequent requests → served from cache
```

### 7.2 Content Gating — Server-Side Enforcement

```
GET /api/topics/[topicId]
        │
        ▼
Topic.findById(topicId)
        │
   topic.isPremium?
        │
   ┌────┴──────────────┐
   │ NO                │ YES
   ▼                   ▼
Return all          Check session JWT
blocks[]                │
isGated: false    ┌─────┴──────────────────┐
                  │                         │
             subscriptionStatus          role is
                 === 'pro'           admin/author?
              AND currentPeriodEnd          │
                > new Date()               YES
                  │                         │
               ┌──┴──┐                     ▼
              YES     NO               Return all blocks[]
               │       │               isGated: false
               ▼       ▼
         Return all   Return
         blocks[]     blocks.slice(0, previewBlockCount)
         isGated:     isGated: true
           false      totalBlocks: topic.blocks.length
```

### 7.3 Client-Side Gating UX (UX only — NOT security)

```
ContentRenderer component receives { blocks, isGated, totalBlocks }
        │
   isGated === true?
        │
   ┌────┴────────────────────────────────┐
   │ YES                                  │ NO
   ▼                                      ▼
Render preview blocks              Render all blocks
        +                          (full content visible)
Blur gradient overlay (CSS)
        +
Lock icon + "Unlock Premium" CTA
        │
User clicks "Unlock"
        │
   user logged in?
        │
   ┌────┴────────────────┐
   │ NO                   │ YES
   ▼                      ▼
Show "Login to        subscriptionStatus?
Continue" modal            │
        │             ┌────┴──────┐
   Redirect to login  │ free      │ pro (shouldn't happen)
   with callbackUrl   ▼           ▼
                 Show "Subscribe   Full access
                 to Unlock" modal  (reload page)
                      │
                 Razorpay flow (see §8)
```

---

## 8. Payment System — Razorpay

### 8.1 Complete Payment Flow

```
User on /pricing or upgrade modal
        │
User clicks "Upgrade to Pro"
        │
        ▼
Step 1: Create Order
────────────────────
POST /api/razorpay/create-order
{ planType: 'monthly' | 'annual' }
        │
Server: razorpay.orders.create({
  amount: 29900 | 249900,   // paise
  currency: 'INR',
  receipt: `r_${Date.now()}`
})
        │
Returns: { orderId, amount, currency, key: RAZORPAY_KEY_ID }
        │
        ▼
Step 2: Razorpay Checkout Modal (client-side)
─────────────────────────────────────────────
const rzp = new Razorpay({
  key,
  amount,
  currency,
  order_id: orderId,
  name: 'EngineerTutorial Pro',
  prefill: { email: user.email, name: user.name },
  handler: async (response) => { ... }   // called on success
})
rzp.open()   // Razorpay UI modal opens in browser
        │
User completes payment (UPI / card / netbanking)
        │
Razorpay calls handler({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
        │
        ▼
Step 3: Verify Payment (server-side) — CRITICAL SECURITY STEP
──────────────────────────────────────────────────────────────
POST /api/razorpay/verify-payment
{ razorpay_order_id, razorpay_payment_id, razorpay_signature }
        │
Server computes:
  body = orderId + '|' + paymentId
  expected = HMAC-SHA256(body, RAZORPAY_KEY_SECRET)
        │
expected === signature?
        │
   ┌────┴─────────────────┐
   │ NO (tampered)        │ YES (valid)
   ▼                      ▼
Return 400             Update MongoDB:
"Invalid signature"    User.subscriptionStatus = 'pro'
(do NOT grant access)  User.currentPeriodEnd = now + 30 days
                       User.razorpayPaymentId = paymentId
                            │
                       Return { success: true }
                            │
                       Client: window.location.reload()
                       User now has premium access
        │
        ▼
Step 4: Webhook (async confirmation — belt-and-suspenders)
──────────────────────────────────────────────────────────
POST /api/razorpay/webhook
(called by Razorpay servers, not the client)
        │
Verify X-Razorpay-Signature header
        │
Handle event:
  payment.captured → ensure subscription is active
  payment.failed   → log, notify user
  subscription.charged → renew currentPeriodEnd
```

---

## 9. Code Execution System

### 9.1 Architecture

```
┌──────────────────────────────────────────────────────┐
│              Client — Monaco Editor                   │
│                                                       │
│  Language: [Python ▼]  [▶ Run]  [Reset]  [Copy]     │
│  ┌────────────────────────────────────────────────┐  │
│  │  def fibonacci(n):                             │  │
│  │      if n <= 1: return n                       │  │
│  │      return fibonacci(n-1) + fibonacci(n-2)   │  │
│  └────────────────────────────────────────────────┘  │
│  stdin: [                                          ]  │
│                                                       │
│  Output:                                             │
│  ┌────────────────────────────────────────────────┐  │
│  │  55                                            │  │
│  │  Time: 0.12s   Memory: 14.2 MB   Exit: 0      │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────┘
                           │  POST /api/code/execute
                           │  { sourceCode, language, stdin }
                           ▼
┌──────────────────────────────────────────────────────┐
│              /api/code/execute (Next.js API)           │
│                                                       │
│  1. Extract IP from x-forwarded-for header           │
│  2. checkRateLimit(`code:${ip}`, 10, 60_000)         │
│     → if blocked: return 429 Too Many Requests       │
│                                                       │
│  3. Map language to Judge0 language ID:              │
│     javascript → 63, python → 71, java → 62         │
│     cpp → 54, go → 60, rust → 73, sql → 82, bash → 46│
│                                                       │
│  4. POST to Judge0 API:                              │
│     https://judge0-ce.p.rapidapi.com/submissions     │
│     ?wait=true                                        │
│     { source_code, language_id, stdin,               │
│       cpu_time_limit: 5, memory_limit: 262144 }      │
│                                                       │
│  5. Return Judge0 response to client                 │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Judge0 API  │
                    │  (RapidAPI)  │
                    │  Sandboxed   │
                    │  execution   │
                    └─────────────┘
```

### 9.2 Rate Limiter Implementation

```typescript
// Node.js in-memory Map — simple, sufficient for MVP
// Resets on server restart (Vercel functions spin down after inactivity)

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;  // allowed — first request in window
  }

  if (entry.count >= limit) return false;  // blocked
  entry.count++;
  return true;  // allowed
}

// Key pattern: `code:${ip}` → 10 runs per minute per IP
// For authenticated users: could use `code:user:${userId}` instead
```

---

## 10. AI Chatbot Integration

### 10.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  AIChatWindow Component (client component, app-wide)         │
│                                                              │
│  State (Context API / useState):                            │
│    isOpen: boolean                                          │
│    messages: { role: 'user'|'assistant', content: string }[]│
│    isLoading: boolean                                        │
│    contextTopic: string | null   (injected from URL params) │
│                                                              │
│  Props:                                                      │
│    contextTopic?: string   (topic page passes current title) │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  When closed:                                        │   │
│  │  ┌──────┐                                           │   │
│  │  │  🤖  │ ← floating button, bottom-right, z-50    │   │
│  │  │ pulse│                                           │   │
│  │  └──────┘                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  When open:                                          │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │ 🤖 AI Assistant          [─] [×]              │ │   │
│  │  ├────────────────────────────────────────────────┤ │   │
│  │  │ [Explain topic] [Give example] [Common errors] │ │   │
│  │  ├────────────────────────────────────────────────┤ │   │
│  │  │                                                │ │   │
│  │  │  You: What is load balancing?                 │ │   │
│  │  │  AI: Load balancing is the process of...      │ │   │
│  │  │      ▌ (streaming cursor)                     │ │   │
│  │  │                                                │ │   │
│  │  ├────────────────────────────────────────────────┤ │   │
│  │  │ [Message input...          ] [Send]           │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 AI Request & Streaming Flow

```
User types message + hits Enter/Send
        │
        ▼
POST /api/ai/chat
{
  messages: [{ role: 'user', content: "What is load balancing?" }],
  contextTopic: "Load Balancing Deep Dive",
  contextCode?: "def my_func(): ..."   // if "Ask AI" button was used
}
        │
        ▼
/api/ai/chat route:
  Build system prompt:
    "You are a CS tutor on EngineerTutorial.
     The user is reading: 'Load Balancing Deep Dive'.
     Answer concisely and clearly."
        │
  Prepend system message to messages array
  If contextCode: append code as user message
        │
  Forward to AI service:
  POST process.env.AI_SERVICE_URL
  Authorization: Bearer AI_SERVICE_API_KEY
  { messages: [...], stream: true }
        │
  Return streaming response directly to client:
  return new Response(aiResponse.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
        │
        ▼
Client reads stream:
  const reader = res.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    aiContent += decoder.decode(value)
    // Update last message in chat state in real-time
    updateLastMessage(aiContent)
  }
```

---

## 11. Admin Panel Architecture

### 11.1 Admin Panel Component Tree

```
AdminLayout
├── Sidebar
│   ├── Logo
│   ├── NavItem: Dashboard     → /admin
│   ├── NavItem: Content       → /admin/content
│   ├── NavItem: Navigation    → /admin/navigation
│   ├── NavItem: SEO           → /admin/seo
│   ├── NavItem: Users         → /admin/users
│   └── UserInfo + Logout
├── TopBar
│   ├── Page title (h1)
│   ├── Search input
│   ├── Notifications bell
│   └── "View Site" link
└── Page Content (children)
    ├── /admin                 → DashboardPage
    ├── /admin/content         → ContentListPage
    ├── /admin/content/new     → BlockEditorPage (create)
    ├── /admin/content/[id]    → BlockEditorPage (edit)
    ├── /admin/navigation      → NavigationBuilderPage
    ├── /admin/seo             → SEOManagerPage
    └── /admin/users           → UserManagementPage
```

### 11.2 Block Editor Architecture

```
BlockEditorPage
│
├── State:
│   blocks: Block[]           (the content being edited)
│   metadata: TopicMetadata   (slug, isPremium, course, etc.)
│   status: 'draft'|'published'
│   isPreviewMode: boolean
│   lastSavedAt: Date
│
├── Auto-save: every 30s → PUT /api/admin/content/topics/[id]
│
├── Layout: 3-column
│   │
│   ├── Column 1: Block Palette (left, 200px)
│   │   Clickable buttons for each block type:
│   │   [+ Heading] [+ Text] [+ Code] [+ Image]
│   │   [+ Callout] [+ Table] [+ Quiz] [+ Video]
│   │   [+ List] [+ Ordered List] [+ Badge] [+ Line]
│   │   → addBlock(type) appends new block to blocks[]
│   │
│   ├── Column 2: Block List (center, flex-1)
│   │   DndContext (@dnd-kit/core)
│   │     SortableContext (blocks.map(b => b.id))
│   │       SortableBlock (for each block)
│   │         ├── DragHandle (GripVertical icon)
│   │         ├── BlockEditor (inline editing, varies by type)
│   │         │   ├── HeadingEditor   → <input>
│   │         │   ├── TextEditor      → <textarea>
│   │         │   ├── CodeEditor      → <MonacoEditor>
│   │         │   ├── ImageEditor     → URL input + upload dialog
│   │         │   ├── CalloutEditor   → type selector + textarea
│   │         │   ├── TableEditor     → dynamic rows/cols editor
│   │         │   └── QuizEditor      → question + options + answer
│   │         └── DeleteButton
│   │
│   └── Column 3: Metadata + Live Preview (right, 320px)
│       isPreviewMode = false → MetadataSidebar:
│         Slug (auto + editable)
│         Course assignment dropdown
│         Section assignment dropdown
│         Order number
│         isPremium toggle
│         Estimated read time
│         Tags (comma-separated or chips)
│         SEO: metaTitle, metaDescription, ogImage URL
│         Status: [Draft ▼] → [Published] → [Archived]
│         [Save Draft]   [Publish Now]
│
│       isPreviewMode = true → LivePreview:
│         <ContentRenderer blocks={blocks} />
│         (exact same component end users see)
│
└── Image Upload Dialog (modal):
    Tab 1: Cloudinary Upload
      [Choose file] → POST /api/upload/cloudinary → returns { url }
      → insert url into image block content.src
    Tab 2: Static Upload
      [Choose file] → POST /api/upload/static → returns { path }
      → insert path into image block content.src
    Tab 3: URL
      [Enter image URL] → insert directly
```

### 11.3 Navigation Builder Data Flow

```
NavigationBuilderPage
        │
        ▼
On page load: GET /api/admin/navigation
→ SiteConfig.findOne({ key: 'navigation' })
→ Populate form with current config
        │
Admin edits:
  - Toggle announcement bar on/off
  - Change announcement text / link / color
  - Add/remove/reorder header links
  - Edit CTA button label and href
  - Edit footer description
        │
Live Preview Panel updates in real-time
(React state drives the preview, not the DB)
        │
Admin clicks "Save Navigation"
        │
        ▼
PUT /api/admin/navigation
{ header, announcement, footer }
        │
SiteConfig.findOneAndUpdate({ key: 'navigation' }, { data: payload }, { upsert: true })
        │
revalidatePath('/', 'layout')   ← ALL pages using layout get fresh nav
        │
Return { success: true }
        │
Show "✓ Changes saved!" toast
        │
Next user request to any page → sees updated navigation
```

---

## 12. SEO Architecture

### 12.1 Metadata per Route

```typescript
// Per-route generateMetadata() — Next.js fetches metadata at build/request time

// Dynamic topic page
export async function generateMetadata({ params }): Promise<Metadata> {
  const topic = await Topic.findOne({ slug: params.topicId }).lean();
  return {
    title:       topic?.metaTitle || `${topic?.title} | EngineerTutorial`,
    description: topic?.metaDescription,
    openGraph: {
      title:       topic?.metaTitle || topic?.title,
      description: topic?.metaDescription,
      images: [{
        url: topic?.ogImage || `/og?title=${encodeURIComponent(topic?.title)}`,
        width: 1200,
        height: 630,
      }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: `/learn/${params.courseId}/${params.sectionId}/${params.topicId}`,
    },
  };
}
```

### 12.2 SEO Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  SEO LAYERS                                                  │
│                                                              │
│  Layer 1: Per-page <head> metadata                          │
│  ──────────────────────────────────────────────────────     │
│  generateMetadata() in each page.tsx                        │
│  → <title>, <meta description>, <link canonical>            │
│  → og:title, og:description, og:image, og:type              │
│  → twitter:card, twitter:site                               │
│                                                              │
│  Layer 2: Dynamic OG Images                                 │
│  ──────────────────────────────────────────────────────     │
│  app/og/route.tsx                                           │
│  GET /og?title=Load+Balancing                               │
│  → ImageResponse (1200×630 PNG)                             │
│  → Topic title + EngineerTutorial branding                  │
│  → Cached by Vercel CDN                                      │
│                                                              │
│  Layer 3: Structured Data (JSON-LD)                         │
│  ──────────────────────────────────────────────────────     │
│  Topic pages:   Article + BreadcrumbList schema             │
│  Course pages:  Course schema                               │
│  Blog pages:    Article schema                              │
│  FAQ sections:  FAQPage schema                              │
│  → <script type="application/ld+json"> in <head>           │
│                                                              │
│  Layer 4: Sitemap                                           │
│  ──────────────────────────────────────────────────────     │
│  app/sitemap.ts                                             │
│  → Query MongoDB for all published topics, blogs, courses   │
│  → Returns MetadataRoute.Sitemap[]                          │
│  → Served as /sitemap.xml                                   │
│  → Regenerated via revalidatePath on admin publish          │
│                                                              │
│  Layer 5: robots.txt                                        │
│  ──────────────────────────────────────────────────────     │
│  app/robots.ts                                              │
│  Allow: all public pages                                    │
│  Disallow: /admin/*, /api/*, /dashboard/*                   │
└─────────────────────────────────────────────────────────────┘
```

### 12.3 On-Demand ISR Flow

```
Admin publishes new Topic
        │
        ▼
PUT /api/admin/content/topics/[id]
{ status: 'published', blocks: [...] }
        │
MongoDB updated
        │
revalidatePath(`/learn/${courseSlug}/${sectionSlug}/${topicSlug}`)
revalidatePath('/sitemap.xml')
        │
Next.js ISR cache for those paths → INVALIDATED
        │
Next user request to that topic URL:
  → Full SSR (topic fetched from DB, fresh)
  → Response cached again for subsequent requests
        │
All other topic pages: still served from cache (fast)
Only the changed page gets fresh SSR
```

---

## 13. Frontend Architecture

### 13.1 Page Structure

```
app/
├── (public)/                          No auth required
│   ├── page.tsx                       Landing page
│   ├── blogs/
│   │   ├── page.tsx                   Blog listing — tag filters, search, pagination
│   │   └── [slug]/page.tsx            Blog detail — full content, related posts, AI chat
│   ├── learn/
│   │   ├── page.tsx                   All courses list
│   │   └── [courseId]/
│   │       ├── page.tsx               Course overview — sections preview, start button
│   │       └── [sectionId]/[topicId]/
│   │           └── page.tsx           Topic reader — 3-panel layout
│   ├── playground/page.tsx            Full-screen code editor
│   └── pricing/page.tsx               Plan comparison, FAQ, Razorpay CTA
│
├── (auth)/
│   ├── login/page.tsx                 Split layout — social + email form
│   └── register/page.tsx             Split layout — name/email/password + strength meter
│
├── (dashboard)/
│   └── dashboard/
│       ├── page.tsx                   User home — stats, in-progress, explore
│       ├── bookmarks/page.tsx
│       └── billing/page.tsx
│
└── (admin)/
    └── admin/
        ├── page.tsx                   Admin dashboard
        ├── content/
        │   ├── page.tsx               Content table
        │   └── new/page.tsx           Block editor (create)
        ├── navigation/page.tsx
        ├── seo/page.tsx
        └── users/page.tsx
```

### 13.2 Topic Reader — 3-Panel Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Header (sticky)                                                    │
│  [Reading progress bar — thin accent line at very top]             │
├─────────────────┬──────────────────────────────┬───────────────────┤
│                 │                               │                   │
│  CourseSidebar  │   Content Area                │  Table of Contents│
│  (sticky, 260px)│   (flex-1)                    │  (sticky, 240px)  │
│                 │                               │                   │
│  Course Title   │  Breadcrumbs                  │  On This Page     │
│  ▓▓▓░░ 40%     │  Home > Learn > SysD > ...    │                   │
│                 │                               │  ▶ Introduction   │
│  ▼ Fundamentals │  # Load Balancing             │  ▶ How it Works   │
│   ✓ Intro       │                               │  ▶ Algorithms     │
│   ✓ CAP Theorem │  [content blocks render here] │  ▶ Use Cases      │
│   → Load Bal.   │                               │                   │
│   🔒 Kafka Adv. │  ...                          │  (active section  │
│                 │                               │   highlighted on  │
│  ▶ Advanced     │  [Blur overlay if isGated]    │   scroll)         │
│   🔒 Topic 1    │                               │                   │
│   🔒 Topic 2    │  ┌────────────────────┐       │                   │
│                 │  │ ◀ Previous Topic   │       │                   │
│                 │  │ Next Topic ▶       │       │                   │
│                 │  └────────────────────┘       │                   │
│                 │                               │                   │
│                 │  [Mark as Complete ✓]         │                   │
├─────────────────┴──────────────────────────────┴───────────────────┤
│  Footer                                                              │
└──────────────────────────────────────────────────────────────────────┘
                                        🤖  ← AI Chat floating button
```

### 13.3 State Management Architecture

```
Global State (Context API)
├── AuthContext  (lib/auth.tsx)
│   ├── user: User | null
│   ├── isLoaded: boolean    ← CRITICAL: prevents redirect before localStorage loads
│   ├── login(email, password, name?) → void
│   ├── logout() → void
│   ├── isAdmin: boolean
│   └── isPremium: boolean
│
├── ThemeContext  (context/ThemeContext.tsx)
│   ├── theme: 'light' | 'dark'
│   └── toggleTheme() → void
│   [persisted to localStorage + DB (user.theme)]
│
└── ChatContext  (context/ChatContext.tsx)
    ├── isOpen: boolean
    ├── messages: Message[]
    ├── isLoading: boolean
    ├── toggle() → void
    ├── addMessage(msg) → void
    └── clearHistory() → void

Server State (TanStack React Query)
├── useQuery(['courses']) → GET /api/courses
├── useQuery(['topic', id]) → GET /api/topics/[id]
├── useQuery(['progress']) → GET /api/user/progress
├── useMutation → POST /api/user/progress (mark complete)
└── useQuery(['bookmarks']) → GET /api/user/bookmarks
```

---

## 14. Security Architecture

### 14.1 Security Layers

```
Layer 1: Transport Security
  → HTTPS everywhere (Vercel enforces TLS)
  → HSTS headers

Layer 2: Authentication
  → NextAuth.js JWT stored in httpOnly cookie (XSS-safe)
  → JWT contains: userId, role, subscriptionStatus, currentPeriodEnd
  → 30-day expiry with sliding window

Layer 3: Authorization
  → middleware.ts blocks /admin/* and /dashboard/* at edge
  → API routes re-check session with auth() (defense in depth)
  → Role checked both in middleware AND in each API route

Layer 4: Content Gating (MOST CRITICAL)
  → Server returns ONLY preview blocks for non-premium users
  → Client NEVER receives full content unless authorized
  → Client-side blur is UX only — removing it via DevTools
    reveals no additional content

Layer 5: Payment Integrity
  → Razorpay signature verified server-side (HMAC-SHA256)
  → Client NEVER receives RAZORPAY_KEY_SECRET
  → Subscription update only happens after signature verification

Layer 6: Input Validation
  → All API inputs validated with Zod schemas
  → File uploads: MIME type check + size limit (5MB)
  → Admin-only routes check role on every request

Layer 7: Rate Limiting
  → Code execution: 10 runs/minute/IP (in-memory)
  → Can add API-level rate limiting per route later

Layer 8: Injection Prevention
  → MongoDB queries use Mongoose (parameterized, no string interpolation)
  → Content blocks rendered as React elements (not dangerouslySetInnerHTML)
  → Exception: only trusted admin-authored content may use HTML; sanitize with DOMPurify if added
```

### 14.2 Environment Variable Security

```
Server-only (never sent to client):
  MONGODB_URI            — DB connection string
  NEXTAUTH_SECRET        — JWT signing secret
  RAZORPAY_KEY_SECRET    — payment signature key
  GOOGLE_CLIENT_SECRET   — OAuth secret
  GITHUB_CLIENT_SECRET   — OAuth secret
  JUDGE0_API_KEY         — code execution API key
  AI_SERVICE_API_KEY     — AI service authentication
  CLOUDINARY_API_SECRET  — image upload secret

Client-safe (NEXT_PUBLIC_ prefix):
  NEXT_PUBLIC_APP_URL    — used for canonical URLs and OG images
  NEXT_PUBLIC_RAZORPAY_KEY_ID  — the public key (safe to expose)
```

---

## 15. Deployment Architecture

### 15.1 Infrastructure Overview

```
                    ┌─────────────────┐
                    │   Vercel CDN    │
                    │  (global edge)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     Static assets    Serverless       Edge middleware
     (CSS, JS, images) API routes     (middleware.ts)
     Cached at edge   /api/*           Route protection
                      Node.js 18+      at CDN level
                             │
                             │
              ┌──────────────┼────────────────────┐
              │              │                    │
              ▼              ▼                    ▼
       MongoDB Atlas    Razorpay API         Judge0 API
       (M0 free tier    (Indian payments)    (RapidAPI)
        → M10 at scale)
              │
              ▼
       ┌─────────────────────┐
       │  7 Collections      │
       │  Replica Set        │
       │  Auto-backups daily │
       │  Atlas Search ready │
       └─────────────────────┘
```

### 15.2 Environment Stages

| Stage | URL | Branch | DB |
|---|---|---|---|
| Development | http://localhost:3000 | any | Local MongoDB or Atlas Dev cluster |
| Preview | `*.vercel.app` | PR branches | Atlas Dev cluster |
| Production | `yourdomain.com` | `main` | Atlas Production cluster |

### 15.3 Deployment Checklist

```
Phase 1: MongoDB Atlas
  □ Create Atlas account → New Project → Build M0 Cluster (Free)
  □ Create DB user: username/password with readWrite on engineer-tutorial DB
  □ Network Access → Allow from Anywhere (0.0.0.0/0) — required for Vercel
  □ Get connection string → replace in MONGODB_URI env var
  □ Enable Atlas Search index on Topics (title, tags) for full-text search

Phase 2: OAuth Setup
  □ Google: console.cloud.google.com → Credentials → OAuth 2.0
    Authorized redirect URI: https://yourdomain.com/api/auth/callback/google
  □ GitHub: github.com/settings/apps → New OAuth App
    Callback URL: https://yourdomain.com/api/auth/callback/github
  □ Generate NEXTAUTH_SECRET: openssl rand -base64 32

Phase 3: Razorpay
  □ razorpay.com → Settings → API Keys → Generate Test Keys
  □ RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET → env vars
  □ Webhooks → Add webhook → URL: https://yourdomain.com/api/razorpay/webhook
  □ Enable events: payment.captured, payment.failed
  □ Before launch: switch to Live Keys

Phase 4: Judge0 (Code Execution)
  □ rapidapi.com → Judge0 CE → Subscribe (Free: 50 req/day)
  □ JUDGE0_API_KEY → env var

Phase 5: Cloudinary (Image Upload)
  □ cloudinary.com → Dashboard → API Keys
  □ CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET → env vars

Phase 6: Vercel Deploy
  □ vercel.com → Import GitHub repo
  □ Framework: Next.js (auto-detected)
  □ Add all env vars from .env.local
  □ Deploy → Production URL assigned
  □ Set NEXTAUTH_URL = https://yourdomain.com
  □ Set NEXT_PUBLIC_APP_URL = https://yourdomain.com

Phase 7: Content Migration
  □ Run: node scripts/migrate.mjs
  □ Seeds MongoDB from existing JSON files in reference repo
  □ Blocks[] copied directly — format is identical

Phase 8: Go Live
  □ Run Lighthouse audit on 3 pages (/, /blogs/[slug], /learn/[c]/[s]/[t])
  □ Target: Performance > 90, SEO = 100, Accessibility > 90
  □ Switch Razorpay to Live Keys
  □ Submit sitemap.xml to Google Search Console
  □ Submit sitemap.xml to Bing Webmaster Tools
```

### 15.4 NPM Packages — Complete Install Command

```bash
# Core
npm install next@14 react react-dom typescript

# Database & Auth
npm install mongoose next-auth@beta bcryptjs

# Payments
npm install razorpay

# Code Editor
npm install @monaco-editor/react

# Block Editor DnD
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Server State
npm install @tanstack/react-query

# Image Upload
npm install cloudinary

# Validation
npm install zod

# Image Optimization
npm install sharp

# Dev Dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node @types/react @types/react-dom @types/bcryptjs
npm install -D typescript eslint eslint-config-next
```

---

## Appendix A — Block Content Schema Examples

```json
// heading block
{ "type": "heading", "content": { "text": "What is Load Balancing?" } }

// text block
{ "type": "text", "content": { "text": "Load balancing **distributes** incoming traffic across multiple servers." } }

// code block
{
  "type": "code",
  "content": {
    "language": "python",
    "code": "def round_robin(servers, request):\n    return servers[request.id % len(servers)]",
    "filename": "load_balancer.py"
  }
}

// callout block
{ "type": "callout", "content": { "type": "tip", "text": "Round-robin is simple but doesn't account for server load." } }

// quiz block
{
  "type": "quiz",
  "content": {
    "question": "Which algorithm sends requests to the server with fewest active connections?",
    "options": ["Round Robin", "Least Connections", "IP Hash", "Random"],
    "answer": 1
  }
}

// table block
{
  "type": "table",
  "content": {
    "headers": ["Algorithm", "Best For", "Drawback"],
    "rows": [
      ["Round Robin", "Equal servers", "Ignores load"],
      ["Least Connections", "Long-lived requests", "More overhead"]
    ]
  }
}
```

---

## Appendix B — Key Files Reference

| File | Purpose |
|---|---|
| `app/api/topics/[topicId]/route.ts` | **Content gating** — most security-critical file |
| `lib/auth.tsx` | Auth context + fake-auth for prototype |
| `lib/auth.ts` | NextAuth configuration (production) |
| `middleware.ts` | Route protection at edge |
| `models/Topic.ts` | Core content schema with blocks[] |
| `models/SiteConfig.ts` | Navigation + SEO config store |
| `components/editor/BlockEditor.tsx` | Admin CMS — most complex component |
| `components/ai/AIChatWindow.tsx` | AI floating panel + streaming |
| `app/api/razorpay/verify-payment/route.ts` | HMAC signature verification |
| `app/api/code/execute/route.ts` | Judge0 proxy + rate limiter |
| `app/sitemap.ts` | Auto-generated sitemap from DB |
| `scripts/migrate.mjs` | One-time data migration from reference repo |

---

## 16. Future Features Roadmap

> These features are **NOT** part of the MVP. Build them after the platform is live and you have real user feedback. Each phase has a trigger condition — don't build it speculatively.

### 16.1 Phase Trigger Conditions

| Phase | Build When... |
|---|---|
| Phase 2 — Community | DAU > 200 and users ask for comments/notes in feedback |
| Phase 3 — Gamification | Week-2 retention < 40%. Gamification directly targets churn. |
| Phase 4 — Video | Monthly revenue > ₹2L AND users request video content |
| Phase 5 — AI Expansion | Your AI service handles complex multi-turn conversations reliably |
| Phase 6 — Monetization | First B2B inbound inquiry. Don't build corporate features speculatively. |
| Algolia Search | Search latency > 800ms or relevance complaints from real users |
| Mobile App | Mobile traffic > 50% AND PWA engagement scores are low |

---

### 16.2 Phase 2 — Community & Social Features (Months 4–6)

#### 2A. Per-Topic Comment Threads

**Why:** GFG and LeetCode see huge engagement through discussion sections. Users learn from each other's explanations and spot errors in content.

**Data Model:**
```typescript
// New collection: Comments
{
  _id:       ObjectId,
  topicId:   ObjectId,    // ref: Topics
  userId:    ObjectId,    // ref: Users
  content:   String,      // markdown text
  parentId:  ObjectId,    // null for top-level, ref: Comments for replies
  upvotes:   Number,
  isDeleted: Boolean,
  createdAt: Date,
}
```

**What to build:**
- Comment thread UI below every topic (collapsible)
- Upvote / downvote buttons (stored per-user to prevent double voting)
- One level of reply threading (`parentId` pattern)
- `[Author]` badge on replies by the topic's author
- Report / flag button → admin can delete from admin panel
- Comment count shown on topic card in sidebar

**API Routes:**
```
GET  /api/topics/[id]/comments       → paginated, nested
POST /api/topics/[id]/comments       → create (auth required)
PUT  /api/comments/[id]/upvote       → toggle upvote
DELETE /api/admin/comments/[id]      → admin delete
```

---

#### 2B. User Notes & Highlights

**Why:** Users want to annotate content while learning — dramatically increases time-on-site and return visits.

**Data Model:**
```typescript
// New collection: UserNotes
{
  userId:    ObjectId,
  topicId:   ObjectId,
  content:   String,      // markdown notes text
  highlights: [{ text: String, color: String, startOffset: Number }],
  updatedAt: Date,
}
```

**What to build:**
- Private sticky notes textarea per topic (auto-saved to DB)
- Text highlight: select content → color picker appears → saved with position offsets
- "My Notes" page in user dashboard — lists all notes across all topics
- Export notes as PDF (using `jsPDF` or Puppeteer server-side)

---

#### 2C. Public Profile Pages

**URL:** `/u/[username]`

**What to build:**
- Avatar, name, bio, GitHub/LinkedIn links
- Activity summary: courses completed, topics completed, current streak
- Badges earned (Phase 3 gamification unlocks this)
- Optional: "Follow" button + activity feed ("John completed System Design Fundamentals")
- Privacy toggle: user can make profile private

---

#### 2D. Notification System

**In-App Notifications:**
```typescript
// New collection: Notifications
{
  userId:    ObjectId,
  type:      'comment_reply' | 'new_content' | 'streak_reminder' | 'sub_expiry',
  message:   String,
  link:      String,       // navigate to on click
  isRead:    Boolean,
  createdAt: Date,
}
```

**Email Notifications** (use Resend or Nodemailer):
- Weekly digest: "3 new topics published in Apache Kafka this week"
- Streak reminder: "You haven't visited in 2 days — keep your streak alive!"
- Subscription expiry: "Your Pro plan expires in 7 days"

**User Controls:** Per-type toggle in profile settings. User can opt out of each type individually.

---

### 16.3 Phase 3 — Gamification & Certificates (Months 7–9)

#### 3A. XP System & Levels

**Why:** Gamification (Duolingo, LeetCode, Codecademy) increases DAU and reduces churn. Users return to maintain streaks and unlock badges.

**XP Events:**
| Action | XP Gained |
|---|---|
| Complete a topic | +10 XP |
| Daily login | +5 XP |
| Comment upvoted | +2 XP |
| 7-day streak | +50 XP bonus |
| First topic ever | +20 XP |

**Level System:**
| Level | XP Range | Title |
|---|---|---|
| 1 | 0–99 | Novice |
| 2 | 100–499 | Learner |
| 3 | 500–1499 | Practitioner |
| 4 | 1500–3999 | Expert |
| 5 | 4000+ | Master |

**DB Changes:** Add `totalXP: Number` to Users schema.

---

#### 3B. Badges

**Badge Definitions (awarded automatically on trigger):**

| Badge | Trigger |
|---|---|
| "First Step" | Complete first topic |
| "System Design Expert" | Complete all System Design topics |
| "Kafka Master" | Complete all Kafka topics |
| "7-Day Streak" | Login 7 consecutive days |
| "Blog Explorer" | Read 10 blog posts |
| "Pro Member" | Subscribe to Pro plan |
| "Helpful" | Receive 10 upvotes on comments |

**DB Changes:** Add `badges: [{ badgeId: String, earnedAt: Date }]` to Users schema.

---

#### 3C. Weekly Leaderboard

```typescript
// Query: top 10 users by XP earned in last 7 days
// Store weekly XP separately to enable weekly reset
// New collection: WeeklyXP
{
  userId:   ObjectId,
  weekOf:   Date,       // Monday of the week
  xpEarned: Number,
}
```

- Weekly top 10 by XP earned in last 7 days
- Filter by course category (e.g., top Kafka learners this week)
- Resets every Monday at 00:00 IST

---

#### 3D. Problem of the Day (POTD)

**Why:** Daily challenges create a habit loop that brings users back every single day.

```typescript
// New collection: DailyProblems
{
  date:         Date,       // unique per day
  title:        String,
  difficulty:   'easy' | 'medium' | 'hard',
  description:  String,
  starterCode:  { [language: string]: string },
  testCases:    [{ input: String, expectedOutput: String }],
  hints:        [String],
  solution:     String,
}
```

- POTD page shows today's problem; solved via code editor
- Solving awards +25 XP + streak update
- Past problems archived and accessible
- Badge: "30 POTDs Solved"
- Email reminder daily at 9 AM for opted-in users

---

#### 3E. Course Completion Certificates

**Why:** Certificates give learners something tangible to show employers — major motivation to finish courses.

**Certificate Flow:**
```
completionPercentage reaches 100%
        │
Trigger certificate generation
        │
Server-side: render HTML template → convert to PDF
(Puppeteer or jsPDF)
        │
Certificate stored in MongoDB:
{ _id, userId, courseId, issuedAt, certificateId (UUID) }
        │
Public URL: /certificates/[certificateId]
        │
"Share on LinkedIn" deep link (pre-fills certification form)
"Download PDF" button
```

---

### 16.4 Phase 4 — Video & Live Content (Months 10–14)

#### 4A. Video Courses

**Video block** (`type: 'video'`) already exists in the schema. Extend the implementation:

| Source | Implementation |
|---|---|
| YouTube URL | Auto-embed using `youtube-nocookie.com` iframe |
| Cloudinary Upload | Upload video → get URL → custom `<VideoPlayer>` |
| Mux (scale) | Mux for adaptive bitrate streaming at high traffic |

**Custom Video Player** (`components/content/VideoPlayer.tsx`):
- Built on HTML5 `<video>` or Plyr.io
- Chapters, playback speed (0.75×, 1×, 1.25×, 1.5×, 2×)
- Keyboard shortcuts (space = play/pause, arrow = seek 10s)
- Auto-saves watch position (resume from where you left off)

**Video Transcript:**
- Auto-generated via Cloudinary transcription or AssemblyAI
- Displayed as scrollable text below video — syncs with playback
- Transcript text indexed for search (SEO goldmine)

---

#### 4B. Live Coding Sessions

- Session calendar page — upcoming live events
- "RSVP" button — `.ics` download or Google Calendar link
- Live session via embedded **Daily.co** or **100ms.live** iframe
- In-session Q&A via platform chat
- Recordings auto-stored in Cloudinary → published as premium content post-session

---

#### 4C. Interactive Roadmaps

**Why:** Roadmaps are high-traffic content (roadmap.sh gets millions of visits). They rank well for "how to learn X" search queries.

**Tech:** `reactflow` library for node-graph rendering.

- Visual node-graph per learning track (System Design, Kafka, etc.)
- Each node links to the relevant topic
- Completed topics shown with filled/colored nodes (synced with user progress)
- "Share my progress" → static image with completed nodes highlighted
- Each roadmap page targets "[Topic] learning roadmap" keywords for SEO

---

### 16.5 Phase 5 — AI Expansion (Months 12–18)

> These features assume your separate AI service is mature and handles complex multi-turn conversations.

#### 5A. AI Mock Interviews

**Why:** HelloInterview's top differentiator. This is a massive moat once built well.

**Interview Types:**
| Type | AI Role | User Does |
|---|---|---|
| System Design | Presents design problem, asks follow-ups on scalability/trade-offs | Types/speaks approach |
| LLD | Presents class design problem | Writes code or UML in editor |
| Behavioral | Asks STAR-format questions | Answers in chat |

**Scoring Report** (generated after each session):
```typescript
// New collection: MockInterviews
{
  userId:      ObjectId,
  type:        'system-design' | 'lld' | 'behavioral',
  question:    String,
  transcript:  [{ role: String, content: String }],
  score: {
    architecture:  Number,    // 0-10
    scalability:   Number,    // 0-10
    tradeoffs:     Number,    // 0-10
    overall:       Number,
  },
  feedback: {
    strengths: [String],
    missed:    [String],
  },
  createdAt: Date,
}
```

**UX:** Dedicated `/practice/[type]` page — full-page chat interface.

---

#### 5B. AI Code Review

**Why:** Instant detailed code feedback at scale — impossible with human reviewers.

**Flow:**
```
User runs code in Playground
        │
"Get AI Review" button appears in output panel
        │
POST /api/ai/review
{ code, language, output, topic? }
        │
AI returns structured JSON:
{
  issues: [{ line: number, type: 'error'|'style'|'performance', message, suggestion }],
  complexity: { time: 'O(n²)', space: 'O(1)' },
  overall: "Good approach but nested loops can be optimized..."
}
        │
Monaco Editor shows inline decorations (red/yellow underlines)
Hover tooltip shows message + suggestion
Side panel: diff view "Your code" vs "Suggested improvement"
```

---

#### 5C. Personalized Learning Path

**Skills Assessment Quiz** (shown on first login):
- 10–15 MCQs covering DSA, System Design, Kafka basics
- Based on score → AI recommends personalized course order
- "Daily Recommendation" widget on dashboard: "Based on your progress, study [topic] next"
- "You're weak in [area]" suggestions based on quiz + incomplete topics
- Store in DB: `Users.assessmentScore: { category: string, score: number }[]`

---

#### 5D. AI Resume Review

**Target audience:** Engineers preparing for interviews — high need for resume feedback.

**Flow:**
- PDF upload in user dashboard
- AI extracts projects, skills, technologies, years of experience
- Feedback: quantified impact suggestions, keyword optimization, formatting tips
- "Suggested topics to study" based on gaps vs. target role requirements
- Separate API call with resume-specific system prompt

---

#### 5E. AI-Generated Practice Problems

- "Generate Practice Problem" button on each topic page
- AI generates a problem relevant to the current topic
- Problem types: System Design question, LLD class design, MCQ, short answer
- User answers evaluated by AI against a rubric
- Strong answers stored as community problems (after admin review)

---

### 16.6 Phase 6 — Monetization Expansion (Months 18–24)

#### 6A. Corporate / Team Accounts

**Why:** B2B revenue is 5–10× more valuable per user than B2C.

```typescript
// New collection: Teams
{
  _id:              ObjectId,
  name:             String,
  adminId:          ObjectId,      // ref: Users
  members:          [ObjectId],    // ref: Users
  assignedCourses:  [ObjectId],    // ref: Courses
  planType:         'team',
  seatCount:        Number,
  invoiceEmail:     String,
  createdAt:        Date,
}
```

**Features:**
- Team admin dashboard: member progress, assign courses, set completion deadlines
- Per-seat pricing: ₹299/seat/month (minimum 5 seats)
- Invoice-based billing (B2B companies need invoices, not card charges)
- Private courses visible only to specific teams
- Progress reports exportable as PDF for managers

---

#### 6B. 1:1 Mentorship Marketplace

**Why:** HelloInterview charges $90–$120 per coaching session. Platform audience of motivated learners = natural marketplace.

```typescript
// New collections: Mentors, Sessions, MentorReviews

// Mentors
{
  userId:         ObjectId,    // ref: Users (mentor's user account)
  linkedIn:       String,
  company:        String,
  yearsExp:       Number,
  specializations: [String],  // e.g., ['system-design', 'kafka']
  hourlyRate:     Number,      // INR
  rating:         Number,
  isVerified:     Boolean,     // admin-approved
}

// Sessions
{
  mentorId:    ObjectId,
  studentId:   ObjectId,
  scheduledAt: Date,
  durationMin: Number,
  status:      'upcoming' | 'completed' | 'cancelled',
  meetingUrl:  String,         // Daily.co or Zoom link
  razorpayOrderId: String,
}
```

**Revenue split:** Platform 20%, mentor 80% — handled via Razorpay Transfer API.

---

#### 6C. Job Board

**Why:** Target audience is actively job-seeking — creates another revenue stream and increases retention.

```typescript
// New collection: JobListings
{
  title:          String,
  company:        String,
  location:       String,
  type:           'full-time' | 'contract' | 'remote',
  description:    String,
  requiredSkills: [String],
  applyUrl:       String,
  postedBy:       ObjectId,    // company admin user
  expiresAt:      Date,
  status:         'active' | 'expired',
}
```

**Features:**
- "Apply with EngineerTutorial Profile" — sends completed courses + certificates
- "Verified Skills" badge on applications for users who completed relevant courses
- Job alerts: user sets preferences → email alerts for matching jobs
- Employer dashboard: post jobs, view applicants, filter by completed courses
- Pricing: ₹X per 30-day listing (revenue from job posts)

---

#### 6D. Company-Specific Interview Prep Packs

**Why:** HelloInterview monetizes this effectively. Users pay premium for targeted prep.

- Dedicated packs (one-time purchase, NOT subscription): "Crack Google SWE L4", "Amazon SDE2 Prep"
- Each pack: curated question bank with company tags, insider tips, past experiences (anonymized), AI mock interview with company-specific scoring rubric
- Priced as one-time purchase (₹X) or bundled with Pro subscription
- `Packs` collection — separate from courses, company-specific content

---

#### 6E. Content Licensing API

- REST API + LTI (Learning Tools Interoperability) for Canvas/Moodle integration
- Partner institutions embed content in their own LMS with an API key
- White-label option: `learn.university.edu` powered by EngineerTutorial, custom branding
- Pricing: monthly licensing fee per institution based on student count
- Analytics API: partners see which content their students engage with

---

### 16.7 Ongoing Technical Improvements

#### Search — Upgrade to Algolia or Meilisearch

**When:** MongoDB text search latency > 800ms or poor relevance from real users.

| Option | Hosted | Cost | Best For |
|---|---|---|---|
| Algolia | Yes | Free tier generous | Best relevance, typo tolerance, instant |
| Meilisearch | Self-hosted | Cheaper at scale | Open source, similar speed |

Both support: instant-as-you-type, highlighted matched terms, filter by `isPremium`/`category`/`difficulty`.

---

#### Analytics — PostHog

**When:** Immediately after launch.

- **Funnel tracking:** Landing → Signup → First Topic → Upgrade (find where users drop off)
- **Session recordings:** Watch real user sessions to spot UX issues
- **Feature flags:** A/B test pricing page CTA, topic layout, announcement bar text
- **Heatmaps:** Where users click, how far they scroll on topic pages

Install: `npm install posthog-js` — initialize in `app/layout.tsx`

---

#### A/B Testing — Pricing Page

**When:** 1,000+ monthly visitors to `/pricing`.

Tests to run:
| Test | Variant A | Variant B |
|---|---|---|
| Price point | ₹199/month | ₹299/month |
| CTA copy | "Unlock All Content" | "Start Learning Pro" |
| Page layout | Comparison table | Feature list |

Use PostHog feature flags or GrowthBook. Track conversion rate per variant.

---

#### Internationalization (i18n)

**When:** Significant traffic from Hindi-speaking users (highly likely given Indian market focus).

- Use `next-intl` package
- URL pattern: `/en/learn/...` vs `/hi/learn/...`
- Content translated into Hindi, Tamil, Telugu
- Admin panel allows adding translated content per topic
- Huge SEO opportunity for regional engineering keywords

---

#### Progressive Web App (PWA)

**When:** Mobile traffic exceeds 30%.

Add service worker:
- **Offline reading:** Previously visited topics cached and readable without internet
- **Home screen install:** Prompt users to add as app icon
- **Background sync:** Mark topics complete offline → syncs when reconnected

---

#### React Native Mobile App

**When:** PWA feels insufficient and mobile DAU is significant.

**Stack:** React Native + Expo
- Shares all API calls with the web platform
- Native push notifications for POTD reminders, streak alerts, new content
- Offline content caching
- Biometric login (Face ID / Fingerprint)
- Monaco or CodeMirror mobile for the code editor

---

### 16.8 Technology Upgrade Path

```
MVP (Now)                    Scale (Later)
─────────────────────────    ────────────────────────────────
MongoDB Atlas M0 (free)  →   M10+ cluster ($57/month) at 10K+ users
Node.js in-memory rate   →   Redis (Upstash serverless) for distributed rate limiting
limiter                      across multiple Vercel function instances
MongoDB text search      →   Algolia or Meilisearch for better relevance
localStorage auth        →   Full NextAuth.js with DB adapter (persistent sessions)
Static /public uploads   →   S3 + CloudFront or Cloudinary for all images at scale
Vercel Hobby             →   Vercel Pro ($20/month) for higher function limits
Manual sitemap trigger   →   Cron job (Vercel Cron) to auto-rebuild sitemap nightly
```

---

*End of System Design Document — EngineerTutorial Platform v1.0*
*Includes: Functional Requirements · Architecture · Schemas · API Design · Workflows · Future Roadmap*
