# Implementation Guide
# GFG-Style Engineering Tutorial Platform

> Version: 1.0 | Stack: Next.js 14+ (App Router) + MongoDB + Razorpay | Date: 2026-05-21

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Project Structure](#2-project-structure)
3. [MongoDB Schema Design](#3-mongodb-schema-design)
4. [API Route Design](#4-api-route-design)
5. [Authentication — NextAuth.js](#5-authentication--nextauthjs)
6. [Content Gating — Server-Side](#6-content-gating--server-side)
7. [Admin Block Editor (CMS)](#7-admin-block-editor-cms)
8. [Navigation Config System](#8-navigation-config-system)
9. [Payment Integration — Razorpay](#9-payment-integration--razorpay)
10. [Code Editor — Monaco + Judge0](#10-code-editor--monaco--judge0)
11. [AI Chatbot Integration](#11-ai-chatbot-integration)
12. [SEO Implementation](#12-seo-implementation)
13. [Image Upload — Dual Approach](#13-image-upload--dual-approach)
14. [Content Migration Script](#14-content-migration-script)
15. [Environment Variables](#15-environment-variables)
16. [Deployment Strategy](#16-deployment-strategy)

---

## 1. Tech Stack Overview

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SSR + SSG + API routes in one project; `generateMetadata` for SEO; on-demand ISR |
| Database | MongoDB Atlas + Mongoose | Flexible document schema fits block-based content; easy to evolve |
| Auth | NextAuth.js v5 (JWT strategy) | Supports email + Google + GitHub; built-in Next.js integration |
| Payments | Razorpay | Indian payment gateway; supports UPI, cards, netbanking |
| Code Editor | `@monaco-editor/react` | Same engine as VS Code; excellent DX |
| Code Execution | Judge0 API | Sandboxed execution; never run user code on own servers |
| State (client) | Context API or Redux Toolkit | Theme toggle, chat window state — keep it simple |
| Server State | TanStack React Query | Data fetching, caching, invalidation |
| Styling | Tailwind CSS + CSS Variables | Carry over existing design tokens from reference repo |
| Images | Cloudinary (URL) + `/public` (static) | Both options in admin panel |
| Rate Limiting | Node.js in-memory Map | Simple MVP solution; no Redis needed |
| Deployment | Vercel + MongoDB Atlas | Native Next.js hosting; serverless API routes |

---

## 2. Project Structure

```
/
├── app/                               # Next.js App Router root
│   ├── (public)/                      # Public route group (no auth required)
│   │   ├── page.tsx                   # Landing page — /
│   │   ├── blogs/
│   │   │   ├── page.tsx               # Blog listing — /blogs
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Blog detail — /blogs/[slug]
│   │   ├── learn/
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx           # Course overview — /learn/[courseId]
│   │   │       └── [sectionId]/
│   │   │           └── [topicId]/
│   │   │               └── page.tsx   # Topic reading page
│   │   ├── playground/
│   │   │   └── page.tsx               # Standalone code editor — /playground
│   │   ├── pricing/
│   │   │   └── page.tsx               # Pricing / upgrade page
│   │   ├── roadmaps/
│   │   │   └── page.tsx               # Learning roadmaps
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── (auth)/                        # Auth route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (dashboard)/                   # Requires login
│   │   └── dashboard/
│   │       ├── page.tsx               # User dashboard
│   │       ├── progress/page.tsx
│   │       ├── bookmarks/page.tsx
│   │       └── billing/page.tsx
│   │
│   ├── (admin)/                       # Requires admin role
│   │   └── admin/
│   │       ├── page.tsx               # Admin dashboard
│   │       ├── content/
│   │       │   ├── page.tsx           # Content list
│   │       │   ├── topics/
│   │       │   │   ├── new/page.tsx   # Create topic
│   │       │   │   └── [id]/
│   │       │   │       └── edit/page.tsx  # Edit topic
│   │       │   └── blogs/
│   │       │       ├── new/page.tsx
│   │       │       └── [id]/
│   │       │           └── edit/page.tsx
│   │       ├── courses/page.tsx       # Manage courses/sections
│   │       ├── navigation/page.tsx    # Header/sidebar/footer builder
│   │       ├── seo/page.tsx           # SEO manager
│   │       ├── users/page.tsx
│   │       └── subscriptions/page.tsx
│   │
│   ├── api/                           # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── courses/
│   │   │   ├── route.ts               # GET /api/courses
│   │   │   └── [courseId]/
│   │   │       ├── route.ts           # GET /api/courses/[courseId]
│   │   │       └── sections/route.ts  # GET /api/courses/[courseId]/sections
│   │   ├── topics/
│   │   │   └── [topicId]/route.ts     # GET /api/topics/[topicId] (gated)
│   │   ├── blogs/
│   │   │   ├── route.ts               # GET /api/blogs
│   │   │   └── [slug]/route.ts        # GET /api/blogs/[slug]
│   │   ├── search/route.ts            # GET /api/search?q=
│   │   ├── user/
│   │   │   ├── me/route.ts
│   │   │   ├── progress/route.ts
│   │   │   └── bookmarks/route.ts
│   │   ├── ai/
│   │   │   └── chat/route.ts          # POST — proxy to AI service
│   │   ├── code/
│   │   │   └── execute/route.ts       # POST — proxy to Judge0
│   │   ├── razorpay/
│   │   │   ├── create-order/route.ts
│   │   │   ├── verify-payment/route.ts
│   │   │   └── webhook/route.ts
│   │   ├── upload/
│   │   │   ├── cloudinary/route.ts    # POST — upload to Cloudinary
│   │   │   └── static/route.ts        # POST — upload to /public/uploads
│   │   └── admin/
│   │       ├── content/route.ts
│   │       ├── navigation/route.ts
│   │       ├── seo/route.ts
│   │       ├── users/route.ts
│   │       └── stats/route.ts
│   │
│   ├── og/route.tsx                   # Dynamic OG image generation
│   ├── sitemap.ts                     # Auto-generated sitemap.xml
│   ├── robots.ts                      # robots.txt
│   ├── layout.tsx                     # Root layout (providers, fonts)
│   └── globals.css                    # CSS variables (carry from existing repo)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CourseSidebar.tsx
│   │   ├── AnnouncementBar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── content/
│   │   ├── ContentRenderer.tsx        # Block renderer (carry over from existing repo)
│   │   ├── ContentGate.tsx            # Premium blur overlay
│   │   ├── TableOfContents.tsx
│   │   ├── TopicNav.tsx               # Prev / Next buttons
│   │   └── ReadingProgressBar.tsx
│   ├── editor/
│   │   ├── MonacoEditor.tsx           # Code editor wrapper
│   │   ├── CodeRunner.tsx             # Execute button + output panel
│   │   └── BlockEditor.tsx            # Admin CMS block editor
│   ├── ai/
│   │   └── AIChatWindow.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx            # Carry from existing repo
│   │   ├── AlternatingSection.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── WhatYouLearn.tsx
│   │   └── FAQSection.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   └── BlogFilters.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── subscription/
│   │   ├── PricingCard.tsx
│   │   ├── UpgradeModal.tsx
│   │   └── RazorpayButton.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Spinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ThemeToggle.tsx
│
├── lib/
│   ├── mongodb.ts                     # MongoDB connection singleton
│   ├── auth.ts                        # NextAuth configuration
│   ├── razorpay.ts                    # Razorpay client
│   ├── judge0.ts                      # Judge0 API wrapper
│   ├── ai.ts                          # AI service client
│   ├── cloudinary.ts                  # Cloudinary upload helper
│   ├── rateLimiter.ts                 # In-memory rate limiter
│   └── utils.ts
│
├── models/                            # Mongoose schemas
│   ├── User.ts
│   ├── Course.ts
│   ├── Section.ts
│   ├── Topic.ts
│   ├── Blog.ts
│   ├── SiteConfig.ts
│   └── Progress.ts
│
├── context/                           # React Context (or Redux store/)
│   ├── ThemeContext.tsx
│   └── ChatContext.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useProgress.ts
│   └── useDebounce.ts
│
├── types/
│   └── index.ts
│
├── middleware.ts                      # Route protection
└── next.config.ts
```

---

## 3. MongoDB Schema Design

### 3.1 Users Collection

```typescript
// models/User.ts
const UserSchema = new Schema({
  email:             { type: String, required: true, unique: true, index: true },
  name:              String,
  image:             String,                          // avatar URL
  hashedPassword:    String,                          // null for OAuth users
  provider:          { type: String, enum: ['email', 'google', 'github'] },
  role: {
    type: String,
    enum: ['free_user', 'premium_user', 'author', 'admin', 'super_admin'],
    default: 'free_user'
  },

  // Subscription
  subscriptionStatus: {
    type: String,
    enum: ['free', 'pro', 'cancelled'],
    default: 'free'
  },
  razorpayPaymentId:  String,
  currentPeriodEnd:   Date,             // when pro access expires

  // Profile
  bio:       String,
  github:    String,
  linkedin:  String,

  // Activity
  streak:         { type: Number, default: 0 },
  lastActiveDate: Date,
  theme:          { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  emailNotifications: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### 3.2 Courses Collection

```typescript
// models/Course.ts
const CourseSchema = new Schema({
  slug:        { type: String, required: true, unique: true, index: true },
  title:       { type: String, required: true },
  description: String,
  icon:        String,                    // emoji or image URL
  thumbnail:   String,
  category: {
    type: String,
    enum: ['system-design', 'lld', 'hld', 'kafka', 'aws', 'genai', 'spark', 'interview', 'dsa'],
  },
  tags:       [String],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  authorId:   { type: Schema.Types.ObjectId, ref: 'User' },
  totalSections: { type: Number, default: 0 },
  totalTopics:   { type: Number, default: 0 },
  estimatedHours: Number,
  status:     { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },

  // SEO
  metaTitle:       String,
  metaDescription: String,
  ogImage:         String,

  publishedAt: Date,
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});
```

### 3.3 Sections Collection

```typescript
// models/Section.ts
const SectionSchema = new Schema({
  courseId:    { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  slug:        String,
  title:       { type: String, required: true },
  description: String,
  order:       { type: Number, required: true },
  createdAt:   { type: Date, default: Date.now },
});
```

### 3.4 Topics Collection (Core Content Document)

```typescript
// models/Topic.ts
const BlockSchema = new Schema({
  type: {
    type: String,
    enum: ['heading','smallHeading','mediumHeading','text','list','orderedList',
           'numberedList','code','table','image','badge','line','gap',
           'callout','video','quiz'],
    required: true,
  },
  content: Schema.Types.Mixed,  // structure varies per block type
}, { _id: false });

const TopicSchema = new Schema({
  sectionId:  { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
  courseId:   { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  slug:       { type: String, required: true, index: true },
  title:      { type: String, required: true },
  heading:    String,                          // display heading (can differ from nav title)

  blocks:             [BlockSchema],           // ← THE CONTENT (same format as existing repo)
  isPremium:          { type: Boolean, default: false },
  previewBlockCount:  { type: Number, default: 3 },   // blocks shown to free users
  order:              { type: Number, required: true },
  estimatedReadTime:  Number,                  // minutes
  tags:               [String],
  status:             { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },

  // SEO
  metaTitle:       String,
  metaDescription: String,
  ogImage:         String,

  publishedAt: Date,
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

// Text index for search
TopicSchema.index({ title: 'text', heading: 'text', tags: 'text' });
```

### 3.5 Blogs Collection

```typescript
// models/Blog.ts
// Note: NO isPremium field — all blogs are always free
const BlogSchema = new Schema({
  slug:        { type: String, required: true, unique: true, index: true },
  title:       { type: String, required: true },
  subtitle:    String,
  blocks:      [BlockSchema],                  // same block format as topics
  tags:        [String],
  coverImage:  String,
  authorId:    { type: Schema.Types.ObjectId, ref: 'User' },
  rating:      { type: Number, default: 0 },
  status:      { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },

  // SEO
  metaTitle:       String,
  metaDescription: String,
  ogImage:         String,

  publishedAt: Date,
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

BlogSchema.index({ title: 'text', subtitle: 'text', tags: 'text' });
```

### 3.6 SiteConfig Collection (Admin-Controlled Navigation & SEO)

```typescript
// models/SiteConfig.ts
// Key-value store. Each document has a unique "key".
const SiteConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  // key = 'navigation' → stores header/footer/announcement config
  // key = 'global-seo'  → stores default title template, OG image, etc.

  data: Schema.Types.Mixed,   // flexible JSON payload
  updatedAt:  { type: Date, default: Date.now },
  updatedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
});
```

Example `navigation` document:
```json
{
  "key": "navigation",
  "data": {
    "header": {
      "siteName": "EngineerTutorial",
      "logo": "/logo.svg",
      "links": [
        {
          "label": "Learn",
          "type": "dropdown",
          "children": [
            { "label": "System Design", "href": "/learn/system-design", "icon": "🏗️" },
            { "label": "Apache Kafka",  "href": "/learn/kafka",         "icon": "⚡" }
          ]
        },
        { "label": "Blogs",    "href": "/blogs",    "type": "link" },
        { "label": "Roadmaps", "href": "/roadmaps", "type": "link" }
      ],
      "ctaLabel": "Get Pro",
      "ctaHref": "/pricing"
    },
    "announcement": {
      "enabled": true,
      "text": "🚀 New course: GenAI for Engineers — now available!",
      "link": "/learn/genai",
      "bgColor": "#155dfc"
    },
    "footer": {
      "brandName": "EngineerTutorial",
      "description": "Learn system design, Kafka, and more — taught by engineers from top companies.",
      "links": [
        { "label": "About",   "href": "/about" },
        { "label": "Contact", "href": "/contact" }
      ],
      "socials": [
        { "platform": "github",   "url": "https://github.com/..." },
        { "platform": "linkedin", "url": "https://linkedin.com/..." }
      ]
    }
  }
}
```

### 3.7 Progress Collection

```typescript
// models/Progress.ts
const ProgressSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

  completedTopics:       [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  lastVisitedTopicId:    { type: Schema.Types.ObjectId, ref: 'Topic' },
  completionPercentage:  { type: Number, default: 0 },   // 0-100

  updatedAt: { type: Date, default: Date.now },
});

ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
```

---

## 4. API Route Design

### Content APIs (public, gated server-side for premium)

```
GET  /api/courses                             List all published courses
GET  /api/courses/[courseId]                  Course metadata
GET  /api/courses/[courseId]/sections         Sections + topics list (for sidebar, no block content)
GET  /api/topics/[topicId]                    Full topic with blocks (premium-gated)
GET  /api/blogs                               Blog list  ?page=&category=&search=
GET  /api/blogs/[slug]                        Full blog post (always free)
GET  /api/search                              ?q=&type=all|topics|blogs|courses&limit=10
```

### User APIs (session required)

```
GET    /api/user/me                           Current user profile
PUT    /api/user/me                           Update profile (name, bio, github, linkedin, theme)
GET    /api/user/progress                     All course progress for current user
POST   /api/user/progress                     Mark topic complete  { topicId, courseId }
GET    /api/user/bookmarks                    List bookmarks
POST   /api/user/bookmarks                    Add bookmark  { type: 'topic'|'blog', refId }
DELETE /api/user/bookmarks/[id]               Remove bookmark
```

### AI API (open to all, no limits)

```
POST /api/ai/chat
Body: { messages: [{role, content}], contextTopic?: string, contextCode?: string }
Response: Streamed text (ReadableStream / Server-Sent Events)
```

### Code Execution API

```
POST /api/code/execute
Body: { sourceCode, language, stdin? }
Response: { stdout, stderr, time, memory, status }
Rate limit: 10 runs/minute per IP (in-memory)
```

### Razorpay Payment APIs

```
POST /api/razorpay/create-order
Body: { planType: 'monthly' | 'annual' }
Response: { orderId, amount, currency, key }

POST /api/razorpay/verify-payment
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
Response: { success: true } → updates user subscription in MongoDB

POST /api/razorpay/webhook
Headers: X-Razorpay-Signature
Body: Razorpay webhook payload (payment.captured, subscription.charged, etc.)
```

### Upload APIs (admin only)

```
POST /api/upload/cloudinary    Multipart upload → returns { url }
POST /api/upload/static        Multipart upload → saves to /public/uploads/ → returns { path }
```

### Admin APIs (admin/author role required)

```
GET    /api/admin/stats                       Dashboard stats
GET    /api/admin/content                     All content (any status)
POST   /api/admin/content/topics              Create topic
PUT    /api/admin/content/topics/[id]         Update topic (full body — entire blocks[] array)
DELETE /api/admin/content/topics/[id]         Archive topic
POST   /api/admin/content/blogs               Create blog
PUT    /api/admin/content/blogs/[id]          Update blog
GET    /api/admin/navigation                  Get SiteConfig 'navigation' document
PUT    /api/admin/navigation                  Update SiteConfig 'navigation' document
GET    /api/admin/seo/[type]/[id]             Get SEO fields for topic/blog/course
PUT    /api/admin/seo/[type]/[id]             Update SEO fields
GET    /api/admin/users                       ?role=&status=&search=&page=
PUT    /api/admin/users/[id]                  Update role / subscription status
GET    /api/admin/subscriptions               List all subscriptions
POST   /api/admin/subscriptions/refund/[id]   Issue refund via Razorpay
```

---

## 5. Authentication — NextAuth.js

### Configuration (`lib/auth.ts`)

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import User from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.hashedPassword) return null;
        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!valid) return null;
        return { id: user._id.toString(), email: user.email, name: user.name,
                 role: user.role, subscriptionStatus: user.subscriptionStatus,
                 currentPeriodEnd: user.currentPeriodEnd };
      }
    }),
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    GithubProvider({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          { $setOnInsert: { email: user.email, name: user.name, image: user.image,
                            provider: account?.provider, role: 'free_user',
                            subscriptionStatus: 'free' } },
          { upsert: true, new: true }
        );
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.subscriptionStatus = user.subscriptionStatus;
        token.currentPeriodEnd = user.currentPeriodEnd;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role;
      session.user.subscriptionStatus = token.subscriptionStatus;
      session.user.currentPeriodEnd = token.currentPeriodEnd;
      return session;
    },
  },
});
```

### Route Protection (`middleware.ts`)

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect admin routes — require admin role
  if (pathname.startsWith('/admin')) {
    if (!req.auth) return NextResponse.redirect(new URL('/login', req.url));
    const role = req.auth.user?.role;
    if (role !== 'admin' && role !== 'super_admin' && role !== 'author') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## 6. Content Gating — Server-Side

This is the most critical security piece. The API checks subscription status before returning `blocks[]`.

```typescript
// app/api/topics/[topicId]/route.ts
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Topic from '@/models/Topic';

export async function GET(req: Request, { params }: { params: { topicId: string } }) {
  await connectDB();
  const session = await auth();
  const topic = await Topic.findById(params.topicId).lean();

  if (!topic || topic.status !== 'published') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const isPremiumUser =
    session?.user?.subscriptionStatus === 'pro' &&
    session?.user?.currentPeriodEnd &&
    new Date(session.user.currentPeriodEnd) > new Date();

  const isAdmin = ['admin', 'super_admin', 'author'].includes(session?.user?.role ?? '');

  // Gate the content server-side
  if (topic.isPremium && !isPremiumUser && !isAdmin) {
    const preview = topic.blocks.slice(0, topic.previewBlockCount);
    return Response.json({
      ...topic,
      blocks: preview,
      isGated: true,
      totalBlocks: topic.blocks.length,
    });
  }

  return Response.json({ ...topic, isGated: false });
}
```

The client-side `ContentGate` component reads `isGated` from the response and renders the blur overlay:

```tsx
// components/content/ContentGate.tsx
export function ContentGate({ isGated }: { isGated: boolean }) {
  if (!isGated) return null;
  return (
    <div className="relative -mt-24">
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-900 z-10" />
      {/* Lock CTA */}
      <div className="relative z-20 flex flex-col items-center py-16 gap-4">
        <LockIcon className="w-10 h-10 text-accent" />
        <h3 className="text-xl font-bold">This content is for Pro members</h3>
        <UpgradeModal trigger={<Button>Unlock Premium Content</Button>} />
      </div>
    </div>
  );
}
```

---

## 7. Admin Block Editor (CMS)

The admin CMS is the most complex UI component. It is a drag-and-drop block editor that stores content as an ordered `blocks[]` array.

### Key Libraries

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @monaco-editor/react   # code blocks in the editor
```

### BlockEditor Architecture

```tsx
// components/editor/BlockEditor.tsx

type Block = { id: string; type: BlockType; content: any };

export function BlockEditor({ initialBlocks, onSave }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlocks((items) => arrayMove(items, findIndex(active.id), findIndex(over!.id)));
    }
  }

  function addBlock(type: BlockType) {
    setBlocks(prev => [...prev, { id: crypto.randomUUID(), type, content: defaultContent(type) }]);
  }

  function updateBlock(id: string, content: any) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  }

  function deleteBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div className="flex gap-4">
      {/* Left: Block palette */}
      <BlockPalette onAdd={addBlock} />

      {/* Center: Draggable block list */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)}>
          {blocks.map(block => (
            <SortableBlock key={block.id} block={block}
              onUpdate={updateBlock} onDelete={deleteBlock} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Right: Live preview */}
      <ContentRenderer blocks={blocks} />
    </div>
  );
}
```

### Auto-Save Draft

```typescript
// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    await fetch(`/api/admin/content/topics/${topicId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, status: 'draft', autoSave: true }),
    });
  }, 30_000);
  return () => clearInterval(interval);
}, [blocks, topicId]);
```

### On-Demand ISR Revalidation on Publish

When admin publishes content, invalidate the Next.js cache so the page updates immediately:

```typescript
// app/api/admin/content/topics/[id]/route.ts  (PUT handler)
import { revalidatePath } from 'next/cache';

// ... after saving to MongoDB ...
if (body.status === 'published') {
  revalidatePath(`/learn/${courseSlug}/${sectionSlug}/${topicSlug}`);
  revalidatePath('/sitemap.xml');
}
```

---

## 8. Navigation Config System

Navigation is stored in MongoDB (`SiteConfig` collection, key: `'navigation'`). This means the admin can change header links, footer, and the announcement bar without any code deployment.

### Reading nav config in Server Components

```typescript
// lib/getSiteConfig.ts
import { connectDB } from './mongodb';
import SiteConfig from '@/models/SiteConfig';
import { cache } from 'react';

export const getSiteConfig = cache(async (key: string) => {
  await connectDB();
  const config = await SiteConfig.findOne({ key }).lean();
  return config?.data ?? null;
});
```

```tsx
// app/layout.tsx (Server Component)
import { getSiteConfig } from '@/lib/getSiteConfig';
import { Header } from '@/components/layout/Header';

export default async function RootLayout({ children }) {
  const navConfig = await getSiteConfig('navigation');
  return (
    <html>
      <body>
        <Header config={navConfig?.header} announcement={navConfig?.announcement} />
        {children}
      </body>
    </html>
  );
}
```

### Admin saves navigation changes

```typescript
// app/api/admin/navigation/route.ts
export async function PUT(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const data = await req.json();
  await SiteConfig.findOneAndUpdate(
    { key: 'navigation' },
    { data, updatedAt: new Date(), updatedBy: session.user.id },
    { upsert: true }
  );
  revalidatePath('/', 'layout');   // revalidate layout so new nav shows immediately
  return Response.json({ success: true });
}
```

---

## 9. Payment Integration — Razorpay

### Setup

```bash
npm install razorpay
```

```typescript
// lib/razorpay.ts
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

### Step 1 — Create Order (server-side)

```typescript
// app/api/razorpay/create-order/route.ts
export async function POST(req: Request) {
  const { planType } = await req.json();
  const amount = planType === 'annual' ? 299900 : 29900;  // amount in paise (₹299 or ₹29.99)

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });

  return Response.json({
    orderId: order.id,
    amount:  order.amount,
    currency: order.currency,
    key:     process.env.RAZORPAY_KEY_ID,
  });
}
```

### Step 2 — Client-side Checkout Modal

```tsx
// components/subscription/RazorpayButton.tsx
declare const Razorpay: any;

export function RazorpayButton({ planType }: { planType: 'monthly' | 'annual' }) {
  async function handlePayment() {
    const { orderId, amount, currency, key } = await fetch('/api/razorpay/create-order', {
      method: 'POST', body: JSON.stringify({ planType }),
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());

    const rzp = new Razorpay({
      key,
      amount,
      currency,
      order_id: orderId,
      name: 'EngineerTutorial Pro',
      description: planType === 'annual' ? 'Annual Plan' : 'Monthly Plan',
      handler: async function(response: any) {
        // Step 3: verify payment server-side
        await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          body: JSON.stringify(response),
          headers: { 'Content-Type': 'application/json' },
        });
        window.location.reload();  // refresh to show unlocked content
      },
    });
    rzp.open();
  }

  return <Button onClick={handlePayment}>Upgrade to Pro</Button>;
}
```

> Add `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` in `app/layout.tsx`.

### Step 3 — Verify Payment (server-side)

```typescript
// app/api/razorpay/verify-payment/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  const session = await auth();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Update user subscription
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);   // +1 month for monthly plan

  await connectDB();
  await User.findByIdAndUpdate(session?.user?.id, {
    subscriptionStatus: 'pro',
    razorpayPaymentId:  razorpay_payment_id,
    currentPeriodEnd:   periodEnd,
  });

  return Response.json({ success: true });
}
```

---

## 10. Code Editor — Monaco + Judge0

### Monaco Editor Component

```bash
npm install @monaco-editor/react
```

```tsx
// components/editor/MonacoEditor.tsx
import { Editor } from '@monaco-editor/react';
import { useTheme } from '@/context/ThemeContext';

export function MonacoEditor({ language, value, onChange, readOnly = false, height = '400px' }) {
  const { theme } = useTheme();

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
      options={{
        readOnly,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
      onChange={onChange}
    />
  );
}
```

### Judge0 Wrapper

```typescript
// lib/judge0.ts
const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python:     71,
  java:       62,
  cpp:        54,
  go:         60,
  rust:       73,
  sql:        82,
  bash:       46,
};

export async function executeCode(sourceCode: string, language: string, stdin?: string) {
  const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions?wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!,
    },
    body: JSON.stringify({
      source_code:  sourceCode,
      language_id:  LANGUAGE_IDS[language],
      stdin:        stdin ?? '',
      cpu_time_limit: 5,
      memory_limit:   262144,
    }),
  });
  return response.json();
}
```

### In-Memory Rate Limiter

```typescript
// lib/rateLimiter.ts
// Simple in-memory store. Resets on server restart. Good enough for MVP.
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;                   // allowed
  }

  if (entry.count >= limit) return false;  // blocked

  entry.count++;
  return true;
}
```

```typescript
// app/api/code/execute/route.ts
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const allowed = checkRateLimit(`code:${ip}`, 10, 60_000);
  if (!allowed) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const { sourceCode, language, stdin } = await req.json();
  const result = await executeCode(sourceCode, language, stdin);
  return Response.json(result);
}
```

---

## 11. AI Chatbot Integration

### AIChatWindow Component Architecture

```tsx
// components/ai/AIChatWindow.tsx
// Uses Context API for chat state (open/closed, messages)

export function AIChatWindow() {
  const { isOpen, toggle, messages, addMessage, isLoading, setLoading } = useChatContext();
  const params = useParams();                 // detect current topic from URL
  const [input, setInput] = useState('');

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    addMessage(userMsg);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [...messages, userMsg],
        contextTopic: params?.topicId,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Handle streaming response
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let aiContent = '';
    addMessage({ role: 'assistant', content: '' });   // placeholder

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiContent += decoder.decode(value);
      updateLastMessage(aiContent);                   // update the placeholder in real-time
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center">
        <BotIcon className="w-7 h-7 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 z-50 bg-white dark:bg-gray-900 border-l shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <span className="font-semibold">AI Assistant</span>
        <button onClick={toggle}><X className="w-5 h-5" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm
              ${m.role === 'user' ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {m.content}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask anything..." rows={2}
          className="flex-1 resize-none rounded border px-3 py-2 text-sm" />
        <Button onClick={sendMessage} disabled={isLoading}>Send</Button>
      </div>
    </div>
  );
}
```

### AI API Route (Streaming Proxy)

```typescript
// app/api/ai/chat/route.ts
export async function POST(req: Request) {
  const { messages, contextTopic, contextCode } = await req.json();

  const systemPrompt = contextTopic
    ? `You are a helpful CS tutor on EngineerTutorial. The user is currently reading: "${contextTopic}". Answer concisely and clearly.`
    : `You are a helpful CS tutor. Answer questions about system design, Kafka, AWS, and software engineering.`;

  const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];
  if (contextCode) {
    fullMessages.push({ role: 'user', content: `Here is the code in question:\n\`\`\`\n${contextCode}\n\`\`\`` });
  }

  // Forward to external AI service and stream the response back
  const aiResponse = await fetch(process.env.AI_SERVICE_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
    },
    body: JSON.stringify({ messages: fullMessages, stream: true }),
  });

  // Pass the stream directly to the client
  return new Response(aiResponse.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

---

## 12. SEO Implementation

### Dynamic Metadata per Route

```typescript
// app/(public)/learn/[courseId]/[sectionId]/[topicId]/page.tsx

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const topic = await Topic.findOne({ slug: params.topicId }).lean();
  if (!topic) return {};

  return {
    title: topic.metaTitle || topic.title,
    description: topic.metaDescription,
    openGraph: {
      title:       topic.metaTitle || topic.title,
      description: topic.metaDescription,
      images: [{ url: topic.ogImage || `/og?title=${encodeURIComponent(topic.title)}` }],
      type: 'article',
    },
    alternates: {
      canonical: `/learn/${params.courseId}/${params.sectionId}/${params.topicId}`,
    },
  };
}
```

### Dynamic OG Image Generation

```tsx
// app/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'EngineerTutorial';

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%',
                  background: '#0f172a', color: 'white',
                  alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
      <div style={{ fontSize: 56, fontWeight: 700, maxWidth: 900 }}>{title}</div>
    </div>,
    { width: 1200, height: 630 }
  );
}
```

### Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Blog from '@/models/Blog';
import Course from '@/models/Course';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const baseUrl = 'https://yourdomain.com';

  const [topics, blogs, courses] = await Promise.all([
    Topic.find({ status: 'published' }).select('slug courseId sectionId updatedAt').lean(),
    Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    Course.find({ status: 'published' }).select('slug updatedAt').lean(),
  ]);

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/blogs`, lastModified: new Date() },
    ...courses.map(c => ({ url: `${baseUrl}/learn/${c.slug}`, lastModified: c.updatedAt })),
    ...blogs.map(b => ({ url: `${baseUrl}/blogs/${b.slug}`,   lastModified: b.updatedAt })),
    ...topics.map(t => ({
      url: `${baseUrl}/learn/${t.courseId}/${t.sectionId}/${t.slug}`,
      lastModified: t.updatedAt,
    })),
  ];
}
```

---

## 13. Image Upload — Dual Approach

### Cloudinary Upload

```typescript
// app/api/upload/cloudinary/route.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'engineer-tutorial' }, (err, result) => {
      if (err) reject(err); else resolve(result);
    }).end(buffer);
  });

  return Response.json({ url: result.secure_url });
}
```

### Static Upload to `/public`

```typescript
// app/api/upload/static/route.ts
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
  await writeFile(filePath, buffer);

  return Response.json({ path: `/uploads/${filename}` });
}
```

Both return either a URL or a path that the BlockEditor inserts into the image block's `content.src` field.

---

## 14. Content Migration Script

A one-time Node.js script to import the existing JSON content from the reference repo into MongoDB.

```javascript
// scripts/migrate.mjs
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGO_URI = process.env.MONGODB_URI;

// Read all JSON topic files from the reference repo
// Adjust this path to wherever you have the old repo cloned
const DATA_DIR = '../Engineer-Tutorial/src/data';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Example: migrate system-design topics
  const systemDesignDir = path.join(DATA_DIR, 'system-design');
  const topicFiles = fs.readdirSync(systemDesignDir);

  for (const file of topicFiles) {
    const rawData = JSON.parse(fs.readFileSync(path.join(systemDesignDir, file), 'utf-8'));
    // Map old JSON structure to new Topic schema
    await Topic.create({
      slug:             rawData.id,
      title:            rawData.heading,
      heading:          rawData.heading,
      blocks:           rawData.blocks,    // ← direct copy, same format
      isPremium:        false,
      status:           'published',
      previewBlockCount: 3,
      estimatedReadTime: Math.ceil(rawData.blocks.length * 0.5),
      // courseId and sectionId need to be set after creating Course/Section documents
    });
    console.log(`Migrated: ${rawData.id}`);
  }

  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch(console.error);
```

Run with: `node scripts/migrate.mjs`

---

## 15. Environment Variables

Create a `.env.local` file in the project root:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/engineer-tutorial

# NextAuth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=

# Judge0 (Code Execution)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=

# Your separate AI service
AI_SERVICE_URL=https://your-ai-service.com/api/chat
AI_SERVICE_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App URL (for OG images, sitemap, etc.)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 16. Deployment Strategy

### Vercel (Recommended)

1. Push code to GitHub
2. Import repo in Vercel dashboard
3. Add all environment variables from `.env.local`
4. Vercel auto-detects Next.js and deploys
5. Every push to `main` triggers a new production deployment
6. PRs get preview deployments automatically

### MongoDB Atlas Setup

1. Create a free M0 cluster at cloud.mongodb.com
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` (all IPs) for Vercel serverless functions
4. Copy the connection string into `MONGODB_URI`
5. Upgrade to M10+ when traffic grows

### Razorpay Configuration

1. Create account at razorpay.com
2. Use Test Mode keys during development (`rzp_test_...`)
3. Switch to Live Mode keys before launch
4. Configure webhook URL: `https://yourdomain.com/api/razorpay/webhook`
5. Enable webhook events: `payment.captured`

### Judge0 Setup

1. Sign up at RapidAPI → Judge0 CE
2. Free tier: 50 requests/day (sufficient for MVP)
3. Add `JUDGE0_API_KEY` to environment variables

---

*End of Implementation Guide*
