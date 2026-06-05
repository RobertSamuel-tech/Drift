# DRIFT

### Product Intelligence Command Center

> *"You built what you planned. Users adopted something else entirely."*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Pendo](https://img.shields.io/badge/Pendo-Analytics-FF4876?logo=pendo&logoColor=white)](https://pendo.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is Drift?

Drift is a **product intelligence platform** for founders and product teams. It compares your original product specification against real user behavior data from [Novus.ai](https://novus.ai) and produces a single signal — the **Drift Score** — that measures exactly how far your shipped product has traveled from your original intent.

Paste a spec. Get a score. See which features are haunting your product.

---

## What Makes Drift Different

Most analytics tools tell you what users are doing. Drift tells you **where they diverged from what you intended**.

| Other Tools | Drift |
|---|---|
| Show usage metrics | Cross-references metrics against your spec |
| Require manual event tagging | Works from plain-text PRDs and roadmaps |
| Produce dashboards you interpret yourself | Produces a scored, prioritized action plan |
| Tell you what happened | Shows the gap between intent and reality |

Drift introduces five classifications no general-purpose analytics tool exposes:

| Classification | Meaning |
|---|---|
| **Ghost** | Built as high-priority. Zero user adoption. Engineering effort with no return. |
| **Overbuilt** | Heavy investment. Users engage at a fraction of the expected rate. |
| **Underbuilt** | Users seek it out. Your spec treats it as low priority. Untapped growth. |
| **Misunderstood** | Users engage, but not as designed. Intent and behavior diverged. |
| **Aligned** | Spec priority and actual usage match. This is what product success looks like. |

---

## Core Features

**Drift Score Engine**
A single 0–100 signal computed from the gap between your spec's priority declarations and actual Novus usage data. Below 50 means your product is drifting. 100 means users behave exactly as you intended.

**Session-First Explore Flow**
Analysis results are temporary by default. Explore Ghost Mode, the full Founder Report, and AI corrections freely — with no database writes — until you explicitly choose to save. Navigating back from Ghost Mode or Report restores your exact analysis state automatically.

**Ghost Mode**
A three-pane command center showing your Product Spec, Drift Zones, and live Novus event feed side by side. Click any zone to open an AI correction panel with a user story reframe, copy rewrite, and mockup direction. Includes a live **Novus Signals** sidebar showing real session telemetry as you interact.

**Founder Report**
A nine-section executive dashboard covering the Product Reality Map, Top Risks, Roadmap Reallocation (Invest / Improve / Remove), Feature Lifecycle stages, Engineering Waste estimate, and AI Recommendations — all derived from a single spec paste, with zero manual setup.

**Product Reality Map**
A unified three-column view showing Intended Product, Actual Product, and Top Risks in a single aligned layout. See at a glance exactly where user behavior diverges from spec intent.

**Drift Recovery Rate**
A live telemetry-backed metric that tracks what percentage of identified ghost features have received AI corrections. Computed from real Pendo events — no fabricated data. Displayed on the Dashboard, in Ghost Mode's command header, and at the top of every Founder Report. Color-coded: red below 25%, amber 25–60%, green above 60%.

**Roadmap Reallocation**
Drift tells you where to move your engineering capacity — which features to invest in, which to improve, and which to remove from active development — with confidence scores and plain-English evidence.

**Engineering Waste Calculator**
Ghost and overbuilt features are converted into estimated sprint cost. Drift surfaces the real, recoverable dollar value of misaligned engineering effort.

**AI Correction Cards**
Powered by GPT-4o-mini via OpenRouter. For each drift zone, Drift generates a correction card with a product framing rewrite, copy suggestion, and mockup direction — ready to act on immediately.

**Analysis Archive**
All saved analyses stored with scores, dates, and quick access to Ghost Mode and Report. Remove any entry directly from the archive when it's no longer needed.

**Live Telemetry Layer**
All user interactions — analyses, ghost zone selections, corrections, report views, exports, and saves — are tracked via Pendo through a single `analytics` abstraction in `lib/novus.ts`. Events are simultaneously forwarded to Pendo and stored in `sessionStorage`, powering the Novus Live Signals panel and Drift Recovery Rate in real time with no dependency on a read-capable API.

---

## Telemetry Events

| Event | Fired When |
|---|---|
| `analysis_started` | User clicks Analyze |
| `analysis_completed` | API returns result with score and zones |
| `spec_pasted` | User pastes content into the spec textarea |
| `ghost_mode_opened` | User enters Ghost Mode (with source: analyze / archive / report) |
| `ghost_feature_selected` | User clicks a drift zone in Ghost Mode |
| `ai_correction_applied` | AI correction cards load for a zone |
| `report_viewed` | Saved Founder Report mounts |
| `report_generated` | Session report computed from unsaved analysis |
| `report_exported` | User downloads Markdown export |
| `analysis_saved` | Analysis saved to database |
| `archive_opened` | User navigates to the Analysis Archive |

---

## Architecture

Drift is a full-stack Next.js 14 application built on the App Router — server components for data-intensive report pages, client components for interactive exploration, and pure TypeScript computation functions that run on both sides.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                                                             │
│   /analyze           →   paste spec, explore, save          │
│   /ghost/[id]        →   three-pane investigation (saved)   │
│   /ghost/session     →   three-pane investigation (unsaved) │
│   /report/[id]       →   nine-section founder report        │
│   /report/session    →   founder report (unsaved session)   │
│   /dashboard         →   saved analysis archive             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────────┐
│                    Next.js API Routes                       │
│                                                             │
│   /api/analyze   →   extract features + score spec          │
│   /api/correct   →   generate AI correction card            │
│   /api/projects  →   GET list · POST save · DELETE remove   │
└───────────┬───────────────────────┬────────────────────────┬┘
            │                       │                        │
┌───────────▼──────┐  ┌─────────────▼──────┐  ┌─────────────▼───┐
│  Supabase        │  │  Novus.ai / Pendo  │  │  OpenRouter     │
│  PostgreSQL      │  │                    │  │  GPT-4o-mini    │
│                  │  │  SDK: pendo.track()│  │                 │
│  projects        │  │  Session telemetry │  │  Correction     │
│  drift_zones     │  │  Recovery metrics  │  │  card gen       │
└──────────────────┘  └────────────────────┘  └─────────────────┘
```

All report computations — Reality Map, Alignment Index, Roadmap Reallocation, Feature Lifecycle, Engineering Waste — run as pure TypeScript functions with no external calls. Session-mode analysis runs entirely client-side from `sessionStorage` with no database writes until the user explicitly saves. Telemetry events are captured in `sessionStorage` via `lib/novus-session.ts` and forwarded to Pendo simultaneously, enabling the Novus Live Signals panel and Drift Recovery Rate to reflect real interactions without a server round-trip.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, API routes, file-based routing |
| Language | TypeScript 5 | End-to-end type safety across all layers |
| Styling | Tailwind CSS 3 | Utility-first design, cyberpunk command-center aesthetic |
| Animation | Framer Motion 12 | Score rings, panel transitions, staggered reveals |
| Database | Supabase (PostgreSQL) | Persistent project and drift zone storage |
| AI | OpenRouter → GPT-4o-mini | Correction card generation per drift zone |
| Analytics | Novus.ai + Pendo SDK | Event tracking, live signals, recovery metrics |
| Icons | Lucide React | Consistent icon system throughout |

---

## Application Routes

| Route | What it does |
|---|---|
| `/` | Landing — system status, drift classification schema, live demo |
| `/analyze` | Paste a spec → Drift Score + zone breakdown → explore freely or save |
| `/ghost` | Demo Ghost Mode — TaskFlow Pro across all five drift types |
| `/ghost/[id]` | Ghost Mode for a saved analysis — spec, zones, Novus feed, live signals |
| `/ghost/session` | Ghost Mode for an unsaved session — back nav restores analyze state |
| `/dashboard` | Analysis archive — saved projects, Drift Recovery Rate, delete support |
| `/report/[id]` | Nine-section Founder Report for a saved analysis |
| `/report/session` | Founder Report for an unsaved session — save from the sticky banner |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Novus.ai](https://novus.ai) project with Pendo snippet key
- An [OpenRouter](https://openrouter.ai) API key

### 1. Clone

```bash
git clone https://github.com/RobertSamuel-tech/Drift-.git
cd Drift-
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

# Novus.ai / Pendo
# NEXT_PUBLIC_NOVUS_API_KEY is the Pendo snippet key (loads the tracking SDK in the browser)
# NOVUS_API_KEY is the same key used server-side for Novus data queries
NEXT_PUBLIC_NOVUS_API_KEY=your_pendo_snippet_key
NEXT_PUBLIC_NOVUS_PROJECT_ID=your_novus_project_id
NOVUS_API_KEY=your_pendo_snippet_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

> **Note on Pendo keys**: `NEXT_PUBLIC_NOVUS_API_KEY` is the client-side Pendo snippet key found in your Pendo subscription settings. It loads `https://cdn.pendo.io/agent/static/{key}/pendo.js` and enables `window.pendo`. A separate Pendo Integration Key (for server-side data queries) is not required for the application to run — telemetry panels fall back to session-storage aggregation automatically.

### 4. Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# Full schema — run once on a fresh project
supabase/schema.sql
```

For existing deployments, apply the incremental migration:

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

Drift ships with **TaskFlow Pro** — a pre-built demo that covers all five drift types. No credentials or database required.

Open [`/ghost`](http://localhost:3000/ghost) or click **View Demo** on the landing page.

| Feature | Drift Type | Usage |
|---|---|---|
| Dashboard Widget | Ghost | 0/100 — built, never adopted |
| CSV Export | Misunderstood | 60/100 — used differently than intended |
| Kanban Board | Overbuilt | 10/100 — over-invested, under-used |
| Team Collaboration | Underbuilt | 80/100 — high demand, low priority |
| Dark Mode | Aligned | matches spec intent |

**Drift Score: 21 · Ghost Features: 2 · Estimated Waste: $80,000**

---

## License

MIT © 2025 Robert Samuel
