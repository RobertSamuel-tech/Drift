# DRIFT

### Product Intelligence Command Center

> *"You built what you planned. Users adopted something else entirely."*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is Drift?

Drift is a **product intelligence tool** for founders and product teams. It compares your original product specification against real user behavior data from [Novus.ai](https://novus.ai) and produces a single signal — the **Drift Score** — that measures how far your shipped product has traveled from your original intent.

Paste a spec. Get a score. See exactly which features are haunting your product.

---

## What Makes Drift Different

Most analytics tools tell you what users are doing. Drift tells you **where they diverged from what you intended**.

| Other Tools | Drift |
|---|---|
| Show you usage metrics | Cross-reference metrics against your spec |
| Require event tagging by engineers | Works from plain-text PRDs and roadmaps |
| Produce dashboards you interpret yourself | Produces a scored, prioritized action plan |
| Show what happened | Show the gap between intent and reality |

Drift introduces five classifications that no general-purpose analytics tool exposes:

- **Ghost** — Built as high-priority. Zero user adoption. Engineering effort with no return.
- **Overbuilt** — Heavy investment. Users engage at a fraction of the expected rate.
- **Underbuilt** — Users seek it out. Your spec treats it as low priority. Untapped growth.
- **Misunderstood** — Users engage, but not as designed. Intent and behavior diverged.
- **Aligned** — Spec priority and actual usage match. This is what success looks like.

---

## Core Features

**Drift Score Engine**
A single 0–100 signal computed from the gap between your spec's priority declarations and actual Novus usage data. Below 50 means your product is haunted. 100 means users behave exactly as you intended.

**Ghost Mode**
A three-pane command center showing your Product Spec, Drift Zones, and live Novus event feed side by side. Click any zone to open an AI correction panel with a user story reframe, copy rewrite, and mockup direction.

**Founder Report**
A nine-section executive report covering the Product Reality Map, Top Risks, Roadmap Reallocation (Invest / Improve / Remove), Feature Lifecycle stages, Engineering Waste estimate, and AI Recommendations — all derived from a single spec paste.

**Roadmap Reallocation**
Drift doesn't just tell you what's broken. It tells you where to move your engineering capacity: which features to invest in, which to improve, and which to remove from active development — with confidence scores and plain-English evidence.

**Engineering Waste Calculator**
Ghost and overbuilt features are converted into estimated sprint cost. A 5-engineer team building a ghost feature at high priority represents real, recoverable loss. Drift surfaces it.

**AI Correction Cards**
Powered by GPT-4o-mini via OpenRouter. For each drift zone, Drift generates a correction card with a product framing rewrite, a copy suggestion, and a mockup direction — ready to hand to design or engineering.

**Session-First Explore Flow**
Analysis results are temporary by default. Explore Ghost Mode, the full Founder Report, and AI corrections without saving anything. Save to your archive only when you're ready.

---

## Architecture

Drift is a full-stack Next.js 14 application built on the App Router with server components for data-intensive pages and client components for interactive exploration.

```
┌─────────────────────────────────────────────────────────┐
│                      Client                             │
│                                                         │
│   /analyze      →   paste spec, explore results         │
│   /ghost/[id]   →   three-pane investigation view       │
│   /report/[id]  →   nine-section founder report         │
│   /dashboard    →   saved analysis archive              │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────────────────┐
│                   Next.js API Routes                     │
│                                                         │
│   /api/analyze   →   extract features + score spec      │
│   /api/correct   →   generate AI correction card        │
│   /api/projects  →   read / write saved analyses        │
└────────┬──────────────────────┬───────────────────────┬─┘
         │                      │                       │
┌────────▼──────┐   ┌───────────▼─────────┐   ┌────────▼────────┐
│  Supabase     │   │  Novus.ai           │   │  OpenRouter     │
│  PostgreSQL   │   │                     │   │  GPT-4o-mini    │
│               │   │  Real user events   │   │                 │
│  projects     │   │  Usage scores       │   │  Correction     │
│  drift_zones  │   │  Live feed          │   │  card gen       │
└───────────────┘   └─────────────────────┘   └─────────────────┘
```

All report computations (Reality Map, Alignment Index, Roadmap Reallocation, Feature Lifecycle, Engineering Waste) run as pure TypeScript functions — no external inference, no black box. Session-mode analysis runs entirely client-side from `sessionStorage` with no database writes until the user explicitly saves.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, API routes, file-based routing |
| Language | TypeScript 5 | End-to-end type safety across all layers |
| Styling | Tailwind CSS 3 | Utility-first design system, cyberpunk command-center aesthetic |
| Animation | Framer Motion 12 | Score rings, panel transitions, staggered reveals |
| Database | Supabase (PostgreSQL) | Persistent project + drift zone storage |
| AI | OpenRouter → GPT-4o-mini | Correction card generation per drift zone |
| Analytics | Novus.ai | Real user event data and usage scores |
| Icons | Lucide React | Consistent icon system throughout |

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Landing page — system status, drift classification schema, live demo prompt |
| `/analyze` | Paste a spec → instant Drift Score + zone breakdown → explore or save |
| `/ghost` | Demo Ghost Mode — TaskFlow Pro with 5 features across all drift types |
| `/ghost/[id]` | Ghost Mode for a saved analysis — spec, zones, and live Novus feed |
| `/ghost/session` | Ghost Mode for an unsaved session — no database write required |
| `/dashboard` | Analysis archive — all saved projects with scores and quick actions |
| `/report/[id]` | Nine-section Founder Report for a saved analysis |
| `/report/session` | Founder Report for an unsaved session — save from the banner |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Novus.ai](https://novus.ai) project
- An [OpenRouter](https://openrouter.ai) API key

### 1. Clone

```bash
git clone https://github.com/RobertSamuel-tech/Drift.git
cd Drift
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Novus.ai
NEXT_PUBLIC_NOVUS_API_KEY=your_novus_api_key
NEXT_PUBLIC_NOVUS_PROJECT_ID=your_novus_project_id
NOVUS_API_KEY=your_novus_server_api_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 4. Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# Full schema — run once on a fresh project
supabase/schema.sql
```

If you are updating an existing deployment, apply the incremental migration:

```bash
supabase/migrations/001_nullable_user_id.sql
```

### 5. Run

```bash
npm run dev        # Development server → http://localhost:3000
npm run build      # Production build
npm run start      # Production server
```

---

## Demo

Drift ships with **TaskFlow Pro** — a pre-built demo project that demonstrates all five drift types without requiring any credentials or database connection.

Open [`/ghost`](http://localhost:3000/ghost) or click **View Demo** on the landing page.

Demo features:
- Dashboard widget — **Ghost** (0/100 usage, high priority)
- CSV Export — **Misunderstood** (60/100 usage, used differently than intended)
- Kanban Board — **Overbuilt** (10/100 usage, high investment)
- Team Collaboration — **Underbuilt** (80/100 usage, low priority)
- Dark Mode — **Aligned** (usage matches spec intent)

**Estimated waste: $80,000 · Drift Score: 21 · 2 ghost features**

---

## License

MIT © 2025 Robert Samuel
