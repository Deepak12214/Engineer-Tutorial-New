# Functional Requirements
# GFG-Style Engineering Tutorial Platform

> Version: 1.0 | Status: Draft | Date: 2026-05-21

---

## Table of Contents

1. [User Management](#1-user-management)
2. [Content Management](#2-content-management)
3. [Free vs Paid Content Gating](#3-free-vs-paid-content-gating)
4. [Code Editor & Execution](#4-code-editor--execution)
5. [AI Chatbot Integration](#5-ai-chatbot-integration)
6. [Admin Panel](#6-admin-panel)
7. [SEO System](#7-seo-system)
8. [Subscription & Payments](#8-subscription--payments)
9. [Search & Filtering](#9-search--filtering)
10. [Navigation Architecture](#10-navigation-architecture)

---

## 1. User Management

### 1.1 Authentication

| # | Requirement |
|---|---|
| FR-1.1.1 | Users can register with email and password |
| FR-1.1.2 | Users can log in with Google OAuth |
| FR-1.1.3 | Users can log in with GitHub OAuth |
| FR-1.1.4 | Email verification required after registration |
| FR-1.1.5 | Password reset via email OTP link |
| FR-1.1.6 | JWT-based session with 30-day token expiry |
| FR-1.1.7 | "Remember me" option for persistent sessions |
| FR-1.1.8 | Users can delete their own account (data wipe) |

### 1.2 User Roles

| Role | Description |
|---|---|
| `guest` | Not logged in. Can access free content only. |
| `free_user` | Logged in, no subscription. Full free content + limited premium preview. |
| `premium_user` | Active paid subscription. Full access to all content. |
| `author` | Can create/edit content in admin panel. Cannot manage users. |
| `admin` | Full access to admin panel: content, users, navigation, SEO, subscriptions. |
| `super_admin` | Admin + ability to promote other users to admin. |

### 1.3 User Profile

| # | Requirement |
|---|---|
| FR-1.3.1 | User can set display name, bio, and avatar image |
| FR-1.3.2 | User can link GitHub and LinkedIn profile URLs |
| FR-1.3.3 | User can set preferred theme (light / dark / system) |
| FR-1.3.4 | User can toggle email notification preferences |
| FR-1.3.5 | Profile page shows subscription status badge |

### 1.4 Progress Tracking

| # | Requirement |
|---|---|
| FR-1.4.1 | User can mark any topic as complete |
| FR-1.4.2 | Course overview shows % completion per course |
| FR-1.4.3 | Course sidebar shows a checkmark on completed topics |
| FR-1.4.4 | Platform remembers the last visited topic per course ("Resume Learning" button) |
| FR-1.4.5 | User dashboard shows all enrolled courses with progress bars |
| FR-1.4.6 | User earns a daily login streak counter (consecutive active days) |

### 1.5 Bookmarks

| # | Requirement |
|---|---|
| FR-1.5.1 | User can bookmark any topic or blog post |
| FR-1.5.2 | Bookmarks page in user dashboard lists all saved items |
| FR-1.5.3 | User can remove bookmarks |

---

## 2. Content Management

### 2.1 Block-Based Content Format

All content (topics and blogs) is stored as an ordered array of **blocks**. Each block has a `type` and a `content` payload.

| Block Type | Description |
|---|---|
| `heading` | Large H1 section heading |
| `smallHeading` | H2 subheading |
| `mediumHeading` | H3 sub-subheading |
| `text` | Paragraph with inline formatting (`**bold**`, `_italic_`, `[[label|url]]` links) |
| `list` | Unordered bullet list |
| `orderedList` | Numbered list |
| `code` | Code block with language label and syntax highlighting |
| `table` | Data table with headers and rows |
| `image` | Image with alt text and caption |
| `badge` | Colored label / tag chips |
| `line` | Horizontal divider |
| `gap` | Vertical spacing block |
| `callout` | Info / Warning / Tip highlighted box |
| `video` | YouTube embed or hosted video player |
| `quiz` | Multiple-choice question with answer reveal |

### 2.2 Course Structure

```
Platform
└── Course           (e.g., "System Design")
    └── Section      (e.g., "Fundamentals")
        └── Topic    (e.g., "What is Load Balancing?")
```

| # | Requirement |
|---|---|
| FR-2.2.1 | Courses have: slug, title, description, icon/thumbnail, category, difficulty, author |
| FR-2.2.2 | Course categories: System Design, LLD, HLD, Kafka, AWS, GenAI, Spark, Interview Prep, DSA |
| FR-2.2.3 | Sections belong to a course and have a display order |
| FR-2.2.4 | Topics belong to a section and have a display order |
| FR-2.2.5 | Topics have: `blocks[]`, `isPremium`, `estimatedReadTime`, `tags[]`, SEO fields |
| FR-2.2.6 | Topics have a status: `draft`, `published`, `archived` |
| FR-2.2.7 | Only `published` topics are visible to end users |

### 2.3 Blog System

| # | Requirement |
|---|---|
| FR-2.3.1 | Blogs use the same block-based format as topics |
| FR-2.3.2 | **All blogs are free** — no premium gating on any blog |
| FR-2.3.3 | Blogs have: slug, title, subtitle, coverImage, tags, author, publishedAt, rating |
| FR-2.3.4 | Blog listing page shows cover image, title, subtitle, tags, and read time |
| FR-2.3.5 | Related blog articles are suggested at the bottom by matching tags |
| FR-2.3.6 | Blogs have a status: `draft`, `published`, `archived` |

### 2.4 Code Snippets in Content

| # | Requirement |
|---|---|
| FR-2.4.1 | Code blocks inside topics support multiple languages per block (tabs) |
| FR-2.4.2 | Supported languages: JavaScript, Python, Java, C++, Go, Rust, SQL, Bash |
| FR-2.4.3 | Code blocks have syntax highlighting (read-only display in content) |
| FR-2.4.4 | Code blocks have a "Copy" button |
| FR-2.4.5 | Code blocks have an "Open in Playground" button (loads code into the editor) |
| FR-2.4.6 | Code blocks in topics have an "Ask AI about this code" button |

---

## 3. Free vs Paid Content Gating

### 3.1 Gating Rules

| Scenario | Behavior |
|---|---|
| Guest visits a **free** topic | Full content visible, no login required |
| Guest visits a **premium** topic | Content preview (first N blocks) shown, then a login wall modal appears |
| Free user visits a **premium** topic | Content preview shown, then a "Subscribe to unlock" upgrade modal appears |
| Premium user visits any topic | Full content always visible |
| Any user visits any **blog** | Full blog always visible (no gating on blogs) |

### 3.2 Preview Behavior

| # | Requirement |
|---|---|
| FR-3.2.1 | Each premium topic has a configurable `previewBlockCount` field (default: 3 blocks) |
| FR-3.2.2 | Free users see the preview blocks + a blurred/faded overlay below |
| FR-3.2.3 | A lock icon and "Unlock Premium Content" CTA is shown over the blur overlay |
| FR-3.2.4 | **Content gating is enforced on the server** — the API returns only preview blocks for non-premium users, not full content |
| FR-3.2.5 | The client-side blur overlay is a UX affordance only, not the security mechanism |

### 3.3 Access Flow

```
User clicks premium topic
  ├── Not logged in → Show "Login to Continue" modal → After login → Show "Subscribe" modal
  └── Logged in, free tier → Show "Subscribe to Unlock" modal → Razorpay payment flow → Access granted
```

---

## 4. Code Editor & Execution

### 4.1 Editor Features

| # | Requirement |
|---|---|
| FR-4.1.1 | Monaco Editor is used (same engine as VS Code) |
| FR-4.1.2 | Available on: dedicated `/playground` page, within runnable code blocks in topics |
| FR-4.1.3 | Supported languages: JavaScript, Python, Java, C++, Go, SQL, Rust, Bash |
| FR-4.1.4 | Editor features: syntax highlighting, basic autocomplete, line numbers, bracket matching |
| FR-4.1.5 | Theme syncs with site theme toggle (dark editor in dark mode, light in light mode) |
| FR-4.1.6 | Font size control (+/-) |
| FR-4.1.7 | "Reset to starter code" button (restores original code from the block) |
| FR-4.1.8 | "Copy code" button |
| FR-4.1.9 | Language selector dropdown |

### 4.2 Code Execution

| # | Requirement |
|---|---|
| FR-4.2.1 | Code is executed via Judge0 API (sandboxed, never on platform servers directly) |
| FR-4.2.2 | Execution timeout: 5 seconds |
| FR-4.2.3 | Memory limit: 256 MB |
| FR-4.2.4 | Output panel shows: stdout, stderr, execution time, memory used, exit status |
| FR-4.2.5 | stdin input field available for programs that require user input |
| FR-4.2.6 | Rate limiting via Node.js in-memory cache: 10 runs/minute per user (resets on server restart) |
| FR-4.2.7 | Error messages from compilation/runtime shown clearly in the output panel |

### 4.3 Playground Page

| # | Requirement |
|---|---|
| FR-4.3.1 | Dedicated `/playground` page with full-screen editor + output panel |
| FR-4.3.2 | URL carries a `?lang=` query param to pre-select language |
| FR-4.3.3 | "Open in Playground" buttons from topic code blocks open the code pre-loaded |

---

## 5. AI Chatbot Integration

### 5.1 Chat Window

| # | Requirement |
|---|---|
| FR-5.1.1 | A floating chat panel is anchored to the bottom-right of the screen |
| FR-5.1.2 | Panel states: closed (only floating button visible), open (full chat panel ~400px wide) |
| FR-5.1.3 | Panel persists across page navigations without losing chat history for the session |
| FR-5.1.4 | Keyboard shortcut: Ctrl+/ (or Cmd+/) toggles the chat panel |
| FR-5.1.5 | Panel has a close (X) and minimize button |
| FR-5.1.6 | Chat is **free and unlimited for all users** — no message caps |

### 5.2 Context-Aware Behavior

| # | Requirement |
|---|---|
| FR-5.2.1 | When a user is on a topic page, the topic title and course name are auto-injected into the system prompt |
| FR-5.2.2 | An "Explain this topic" button on the reading page pre-fills the chat input with the current topic title |
| FR-5.2.3 | An "Ask AI about this code" button on code blocks injects the code into the chat input |
| FR-5.2.4 | Suggested prompt chips are shown when chat is empty (e.g., "Explain this in simple terms", "Give me an example", "What are common mistakes?") |

### 5.3 API Integration

| # | Requirement |
|---|---|
| FR-5.3.1 | All AI requests are proxied through the platform's own `/api/ai/chat` endpoint |
| FR-5.3.2 | The platform calls the user's separate AI service using `AI_SERVICE_URL` and `AI_SERVICE_API_KEY` env vars |
| FR-5.3.3 | AI responses are streamed token-by-token (Server-Sent Events) for a real-time feel |
| FR-5.3.4 | If the AI service is unavailable, a friendly error message is shown: "AI assistant is temporarily unavailable" |
| FR-5.3.5 | Chat history for the current session is stored in client state (not persisted to DB in MVP) |

---

## 6. Admin Panel

### 6.1 Dashboard

| # | Requirement |
|---|---|
| FR-6.1.1 | Stats cards: total registered users, active premium subscribers, total published content, daily active users |
| FR-6.1.2 | Revenue summary: monthly recurring revenue (MRR), new subscribers this month |
| FR-6.1.3 | Quick-action buttons: "Add New Topic", "Add New Blog", "View Users" |
| FR-6.1.4 | Recent activity feed: recent signups, recent purchases, recently published content |

### 6.2 Content Block Editor (CMS)

| # | Requirement |
|---|---|
| FR-6.2.1 | Admin can create and edit Topics and Blogs using a visual block editor |
| FR-6.2.2 | Block palette lets admin add any block type by clicking (heading, text, code, image, table, video, callout, quiz, etc.) |
| FR-6.2.3 | Blocks are reorderable via drag-and-drop |
| FR-6.2.4 | Each block is editable inline: text areas, code editors, image pickers |
| FR-6.2.5 | Live preview panel renders the content exactly as end users will see it |
| FR-6.2.6 | Admin can toggle content status: Draft → Published → Archived |
| FR-6.2.7 | Scheduled publish: admin can set a future publish date/time |
| FR-6.2.8 | Draft is auto-saved every 30 seconds |
| FR-6.2.9 | Metadata sidebar on the editor: slug (auto-generated, editable), course/section assignment, order, `isPremium` toggle, estimated read time, tags, SEO fields |

### 6.3 Image Upload in Editor

Admin has two ways to insert images into content:

| Method | Description |
|---|---|
| **Cloudinary Upload** | Upload image → Cloudinary hosts it → Returns a URL → URL stored in the image block |
| **Static Upload** | Upload image to platform backend → Saved to `/public/uploads/` → Path stored in image block → Served by Next.js |

Both methods are available via an "Insert Image" dialog in the block editor. Admin can also manually paste any public image URL.

### 6.4 Navigation Builder

| # | Requirement |
|---|---|
| FR-6.4.1 | Admin can edit header links: add, remove, reorder nav items |
| FR-6.4.2 | Admin can create dropdown menus in header with sub-links (e.g., "Learn" dropdown with all courses) |
| FR-6.4.3 | Admin can configure the header CTA button text and destination URL |
| FR-6.4.4 | Admin can toggle and configure the announcement bar (text, link, background color) |
| FR-6.4.5 | Admin can edit footer: brand description, links, social media URLs |
| FR-6.4.6 | All navigation config is stored in the database (SiteConfig collection) — changes take effect without a code deploy |
| FR-6.4.7 | A live preview of the header shows changes before saving |

### 6.5 SEO Manager

| # | Requirement |
|---|---|
| FR-6.5.1 | Every topic, blog, and course has editable SEO fields: meta title, meta description, canonical URL, OG image URL, OG title, OG description |
| FR-6.5.2 | SEO manager lists all content with a "completeness" indicator (red = missing fields, green = complete) |
| FR-6.5.3 | Admin can edit Global SEO: default title template (`%s | SiteName`), default OG image, Twitter handle |
| FR-6.5.4 | Admin can edit `robots.txt` content from the panel |
| FR-6.5.5 | "Regenerate Sitemap" button triggers on-demand sitemap rebuild from current published content |

### 6.6 User Management

| # | Requirement |
|---|---|
| FR-6.6.1 | Admin can view all users with filters: role, subscription status, join date, search by name/email |
| FR-6.6.2 | Admin can manually grant or revoke premium access for any user |
| FR-6.6.3 | Admin can change a user's role (e.g., promote to author or admin) |
| FR-6.6.4 | Admin can ban a user (blocks login, content access) |
| FR-6.6.5 | Admin can view a user's activity: last login, courses in progress, payments made |
| FR-6.6.6 | Admin can export the user list as CSV |

### 6.7 Subscription Management

| # | Requirement |
|---|---|
| FR-6.7.1 | Admin can view all active subscriptions with start date and renewal date |
| FR-6.7.2 | Admin can view failed/cancelled subscriptions |
| FR-6.7.3 | Admin can issue a manual refund (triggers Razorpay refund API) |
| FR-6.7.4 | Admin can view payment webhook logs for debugging |

---

## 7. SEO System

### 7.1 Per-Page Metadata

| # | Requirement |
|---|---|
| FR-7.1.1 | Every page has a unique `<title>` tag using the pattern: `[Page Title] | [Site Name]` |
| FR-7.1.2 | Every page has a `<meta name="description">` tag |
| FR-7.1.3 | Every content page has Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`) |
| FR-7.1.4 | Topic and blog pages generate dynamic OG images with the title and site branding |
| FR-7.1.5 | Canonical URLs are set on all pages to prevent duplicate content issues |
| FR-7.1.6 | Admin and draft pages have `<meta name="robots" content="noindex">` |

### 7.2 Structured Data (Schema.org)

| Page Type | Schema |
|---|---|
| Blog post | `Article` |
| Topic page | `Article` + `BreadcrumbList` |
| Course overview | `Course` |
| FAQ section | `FAQPage` |
| All content pages | `BreadcrumbList` |

### 7.3 Technical SEO

| # | Requirement |
|---|---|
| FR-7.3.1 | `/sitemap.xml` is auto-generated from all published topics, blogs, and courses in the database |
| FR-7.3.2 | Sitemap is regenerated on-demand when admin publishes new content |
| FR-7.3.3 | `/robots.txt` is configurable from the admin panel |
| FR-7.3.4 | All images use proper `alt` text |
| FR-7.3.5 | Semantic HTML heading hierarchy (h1 → h2 → h3) is enforced in content blocks |
| FR-7.3.6 | Page load is optimized: images use next/image with lazy loading, code split per route |

### 7.4 Content SEO

| # | Requirement |
|---|---|
| FR-7.4.1 | Estimated read time is displayed on every topic and blog |
| FR-7.4.2 | Tags are clickable and lead to filtered content pages |
| FR-7.4.3 | Related articles section at bottom of each topic/blog (matched by tags) |
| FR-7.4.4 | Breadcrumb navigation on all content pages |

---

## 8. Subscription & Payments

### 8.1 Plans

| Plan | Access | Price |
|---|---|---|
| **Free** | All free topics + all blogs | Free forever |
| **Pro** | All topics (free + premium) + all blogs | Monthly or Annual billing via Razorpay |

### 8.2 Payment Flow (Razorpay)

| # | Requirement |
|---|---|
| FR-8.2.1 | User clicks "Upgrade to Pro" anywhere on the platform |
| FR-8.2.2 | Backend creates a Razorpay Order (amount, currency, receipt) |
| FR-8.2.3 | Client-side Razorpay checkout modal opens (using Razorpay JS SDK) |
| FR-8.2.4 | On payment success, client sends `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` to backend |
| FR-8.2.5 | Backend verifies the HMAC-SHA256 signature using `razorpay_key_secret` |
| FR-8.2.6 | On verification success, User record is updated: `subscriptionStatus: 'pro'`, `currentPeriodEnd` set |
| FR-8.2.7 | User is immediately redirected to the content they were trying to access |

### 8.3 Subscription Management for Users

| # | Requirement |
|---|---|
| FR-8.3.1 | User can view their subscription status and expiry date in the dashboard |
| FR-8.3.2 | User receives an email notification before subscription expires (7 days prior) |
| FR-8.3.3 | After expiry, user is automatically downgraded to free tier |

### 8.4 Access Enforcement

| # | Requirement |
|---|---|
| FR-8.4.1 | Access to premium content is checked server-side on every request (JWT `subscriptionStatus` + `currentPeriodEnd`) |
| FR-8.4.2 | Expired subscriptions are automatically detected by comparing `currentPeriodEnd` to the current date |
| FR-8.4.3 | Admin-granted access is not tied to a payment and does not expire unless manually revoked |

---

## 9. Search & Filtering

### 9.1 Global Search

| # | Requirement |
|---|---|
| FR-9.1.1 | A search bar is accessible from the header on all pages |
| FR-9.1.2 | Keyboard shortcut: Ctrl+K (Cmd+K on Mac) opens the search modal |
| FR-9.1.3 | Search covers: topic titles, blog titles, course titles, and tags |
| FR-9.1.4 | Results are grouped by type: Topics, Blogs, Courses |
| FR-9.1.5 | Recent searches are stored in browser localStorage and shown as default suggestions |
| FR-9.1.6 | Search results show a premium lock icon on gated topics |

### 9.2 Blog Filtering

| # | Requirement |
|---|---|
| FR-9.2.1 | Blog listing page has category tag filters (e.g., System Design, Databases, Kafka) |
| FR-9.2.2 | Blog listing has a search input to filter by title/subtitle |
| FR-9.2.3 | Pagination: 9 blogs per page |

### 9.3 Course Filtering

| # | Requirement |
|---|---|
| FR-9.3.1 | Courses listing page can be filtered by category (System Design, Kafka, AWS, etc.) |
| FR-9.3.2 | Courses can be filtered by difficulty (Beginner, Intermediate, Advanced) |
| FR-9.3.3 | A "Free" / "Premium" filter shows which courses require a subscription |

---

## 10. Navigation Architecture

### 10.1 Header

| # | Requirement |
|---|---|
| FR-10.1.1 | Header contains: logo + site name, primary nav links, search icon, theme toggle, auth CTA |
| FR-10.1.2 | For guests: header shows "Login" and "Get Started" buttons |
| FR-10.1.3 | For logged-in users: header shows user avatar with a dropdown (Dashboard, Billing, Logout) |
| FR-10.1.4 | "Learn" nav item has a dropdown showing all available courses with icons |
| FR-10.1.5 | Optional announcement bar above the header (configurable from admin panel) |
| FR-10.1.6 | Header is sticky (stays at top on scroll) |
| FR-10.1.7 | On mobile: primary nav collapses into a hamburger menu drawer |

### 10.2 Course Sidebar

| # | Requirement |
|---|---|
| FR-10.2.1 | Sidebar shows: course title, overall progress bar, list of sections (collapsible), list of topics per section |
| FR-10.2.2 | Completed topics show a green checkmark |
| FR-10.2.3 | Premium topics show a lock icon for free users |
| FR-10.2.4 | Currently active topic is highlighted |
| FR-10.2.5 | Sidebar is sticky and scrolls independently from main content |
| FR-10.2.6 | On mobile: sidebar becomes a slide-in drawer triggered by a menu button |

### 10.3 In-Page Navigation

| # | Requirement |
|---|---|
| FR-10.3.1 | A Table of Contents (right sidebar) auto-generates from heading blocks in the topic |
| FR-10.3.2 | Table of Contents highlights the currently visible section on scroll |
| FR-10.3.3 | "Previous Topic" and "Next Topic" buttons at the bottom of each topic |
| FR-10.3.4 | Breadcrumb trail at the top: Home > Learn > [Course] > [Section] > [Topic] |
| FR-10.3.5 | "Back to top" button appears after scrolling down 500px |
| FR-10.3.6 | A reading progress bar (thin line at top of page) shows scroll depth |

---

*End of Functional Requirements Document*
