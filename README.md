# DRIFT

### Product Intelligence Command Center

> *"You built what you planned. Users adopted something else entirely."*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Pendo](https://img.shields.io/badge/Pendo-Powered-FF4876?logo=pendo&logoColor=white)](https://pendo.io)
[![Novus](https://img.shields.io/badge/Novus.ai-Analytics-6366f1?logoColor=white)](https://novus.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is Drift?

Drift is a **product intelligence platform** for founders and product teams. It compares your original product specification against real user behavior data from [Novus.ai](https://novus.ai) — powered by [Pendo](https://pendo.io) — and produces a single signal: the **Drift Score**. That score measures exactly how far your shipped product has traveled from your original intent.

Paste a spec. Get a score. See which features are haunting your product.

---

## What Makes Drift Different

Most analytics tools tell you what users are doing. Drift tells you **where they diverged from what you intended**.

| Capability | Traditional Analytics | Drift |
|---|---|---|
| Data source | Usage events only | Usage events **cross-referenced against your spec** |
| Setup | Manual event tagging by engineers | Plain-text PRD or roadmap — no tagging required |
| Output | Dashboards you interpret yourself | Scored, prioritized action plan |
| Answer | What happened | **Why it diverged from your intent** |
| Recovery | None | AI correction cards + Drift Recovery Rate |

Drift introduces five classifications no general-purpose analytics tool exposes:

| Classification | Signal | Meaning |
|---|---|---|
| **Ghost** | High priority · 0 usage | Built with effort. Never adopted. Engineering spend with no return. |
| **Overbuilt** | High priority · Low usage | Over-invested. Users engage at a fraction of the expected rate. |
| **Underbuilt** | Low priority · High usage | Users seek it out. Your roadmap ignores it. Untapped growth vector. |
| **Misunderstood** | Any priority · Unexpected usage | Users engage, but not as designed. Intent and behavior diverged. |
| **Aligned** | Priority ≈ Usage | Spec intent matches actual user behavior. Product–market fit signal. |

---

## Core Features

| Feature | Description |
|---|---|
| **Drift Score Engine** | A single 0–100 signal. Computed from the weighted gap between your spec's priority declarations and actual Novus usage data. Below 50 means your product is drifting. |
| **Session-First Explore Flow** | Analysis results are temporary by default. Explore Ghost Mode, the Founder Report, and AI corrections without any database writes. State is preserved if you navigate back. |
| **Ghost Mode** | Three-pane command center: Product Spec · Drift Zones · Live Novus Event Feed. Click any zone to open an AI correction panel. Includes a live **Novus Live Signals** sidebar. |
| **Founder Report** | Nine-section executive dashboard: Reality Map, Top Risks, Roadmap Reallocation, Feature Lifecycle, Engineering Waste, and AI Recommendations — all from a single spec paste. |
| **Product Reality Map** | Unified three-column view: Intended Product · Actual Product · Top Risks. Built from real Novus usage data ranked against spec priority. |
| **Drift Recovery Rate** | Live telemetry metric: `corrected ghost features / identified ghost features × 100`. Powered by real Pendo events. Visible on Dashboard, Ghost Mode header, and every Report. |
| **Roadmap Reallocation** | Invest / Improve / Remove recommendations with confidence scores derived from usage data, not opinion. |
| **Engineering Waste Calculator** | Ghost and overbuilt features converted into estimated sprint cost (sprints × team size × daily rate). Surfaces recoverable dollar value. |
| **AI Correction Cards** | GPT-4o-mini via OpenRouter. Each drift zone produces a correction card: user story reframe, copy rewrite, mockup direction. |
| **Analysis Archive** | Persistent storage of all saved analyses with scores, dates, Ghost Mode and Report quick-access, and per-entry deletion. |

---

## Novus.ai + Pendo Integration

Drift uses [Novus.ai](https://novus.ai) as its product analytics backbone, with [Pendo](https://pendo.io) as the underlying event tracking engine.

### How It Works

```
User action in Drift
        │
        ▼
analytics.X()          ← lib/novus.ts  (single abstraction layer)
        │
        ├──► window.pendo.track()    ──►  Pendo / Novus.ai cloud
        │                                 (persistent telemetry)
        │
        └──► storeEvent()           ──►  sessionStorage
                                          (lib/novus-session.ts)
                                          │
                                          ├── Novus Live Signals panel
                                          └── Drift Recovery Rate metric
```

All events pass through a single `analytics` object in `lib/novus.ts`. No component ever calls `pendo.track()` directly. The session store enables the live telemetry panels to display real data without a server round-trip or a Pendo Data API key.

### SDK Initialization

Pendo loads via `next/script` with `strategy="afterInteractive"` in `app/providers.tsx`, which wraps the entire application through `app/layout.tsx`. On script load, `pendo.initialize()` is called with visitor and account identifiers.

```
app/layout.tsx
  └── <Providers>
        └── <Script src="https://cdn.pendo.io/agent/static/{key}/pendo.js"
                    onLoad={() => pendo.initialize({ visitor, account })} />
```

### Tracked Events

| Event | Properties | Fired By |
|---|---|---|
| `analysis_started` | — | Analyze button click |
| `analysis_completed` | `score` · `featuresFound` · `driftTypes[]` | API success in `handleAnalyze()` |
| `spec_pasted` | — | `onPaste` on spec textarea |
| `ghost_mode_opened` | `projectId` · `source` | Ghost Mode button / archive link / report nav |
| `ghost_feature_selected` | `featureName` · `driftType` | Drift zone click in Ghost Mode |
| `ai_correction_applied` | `featureName` · `driftType` · `cardsCount` | Correction cards loaded from `/api/correct` |
| `report_viewed` | `projectId` · `score` | Saved report mounts |
| `report_generated` | `score` · `featuresFound` | Session report computed |
| `report_exported` | `projectName` · `score` | Export as Markdown click |
| `analysis_saved` | `projectId` · `score` | Save to Dashboard confirmed |
| `archive_opened` | — | User navigates to `/dashboard` |

### Novus Live Signals Panel

Displayed in Ghost Mode's right sidebar beneath the Novus event feed. Powered entirely by session-storage telemetry — no API key required.

| Signal | Source Event | Display |
|---|---|---|
| Top Ghost Zone | `ghost_feature_selected` (driftType=ghost) | Feature name · selection count |
| Most Corrected Feature | `ai_correction_applied` (driftType=ghost) | Feature name · correction count |
| Most Viewed Report | `report_viewed` | Project ID · view count |
| Total Analyses | `analysis_completed` | Count |
| Ghost Mode Opens | `ghost_mode_opened` | Count |
| Reports Generated | `report_generated` | Count |

Shows **"Waiting for Novus telemetry…"** until the first real interaction. Zero fabricated values.

### Drift Recovery Rate

Formula: `(unique corrected ghost features / unique identified ghost features) × 100`

| Term | Definition | Source |
|---|---|---|
| Identified ghost features | Unique feature names from `ghost_feature_selected` where `driftType = ghost`, plus any in `ai_correction_applied` | Session store |
| Corrected ghost features | Unique feature names from `ai_correction_applied` where `driftType = ghost` | Session store |
| Duplicate handling | Both sets use `Set<string>` — a feature corrected 5× still counts as 1 | `lib/recovery-metrics.ts` |

Color thresholds:

| Rate | Color | Interpretation |
|---|---|---|
| > 60% | Green | Most ghost features have corrections in progress |
| 25–60% | Amber | Partial recovery — more corrections needed |
| < 25% | Red | Most ghost features are still uncorrected |

Displayed on: Dashboard · Ghost Mode command header · Founder Report

---

## Architecture

Drift is a full-stack Next.js 14 application on the App Router — server components for data-intensive pages, client components for interactive exploration, and pure TypeScript computation functions that run on both sides.

```
┌──────────────────────────────────────────────────────────────┐
│                          Client                              │
│                                                              │
│  /analyze        →  paste spec, explore, save                │
│  /ghost/[id]     →  three-pane investigation (saved)         │
│  /ghost/session  →  three-pane investigation (unsaved)       │
│  /report/[id]    →  nine-section founder report              │
│  /report/session →  founder report (unsaved session)         │
│  /dashboard      →  saved analysis archive                   │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼────────────────────────────────────┐
│                   Next.js API Routes                         │
│                                                              │
│  /api/analyze   →  extract features + compute drift score    │
│  /api/correct   →  generate AI correction card per zone      │
│  /api/projects  →  GET list · POST save · DELETE remove      │
└──────────┬──────────────────────┬──────────────────────────┬─┘
           │                      │                          │
┌──────────▼────────┐  ┌──────────▼──────────┐  ┌───────────▼────┐
│  Supabase         │  │  Novus.ai + Pendo   │  │  OpenRouter    │
│  PostgreSQL       │  │                     │  │  GPT-4o-mini   │
│                   │  │  pendo.track()      │  │                │
│  projects         │  │  storeEvent()       │  │  Correction    │
│  drift_zones      │  │  Live signals       │  │  card gen      │
│                   │  │  Recovery rate      │  │                │
└───────────────────┘  └─────────────────────┘  └────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js App Router | 14 | Server + client components, API routes, file routing |
| Language | TypeScript | 5 | End-to-end type safety |
| Styling | Tailwind CSS | 3 | Utility-first, cyberpunk command-center aesthetic |
| Animation | Framer Motion | 12 | Score rings, panel transitions, staggered reveals |
| Database | Supabase (PostgreSQL) | — | Project and drift zone persistence |
| AI | OpenRouter → GPT-4o-mini | — | Correction card generation per drift zone |
| Analytics | Novus.ai + Pendo SDK | — | Event tracking, live signals, recovery metrics |
| Icons | Lucide React | — | Consistent icon system throughout |

---

## Application Routes

| Route | Type | Description |
|---|---|---|
| `/` | Public | Landing — system status, drift schema, live demo prompt |
| `/analyze` | Public | Paste spec → Drift Score → explore or save |
| `/ghost` | Public | Demo Ghost Mode — TaskFlow Pro, all five drift types |
| `/ghost/[id]` | Authenticated | Ghost Mode for a saved analysis |
| `/ghost/session` | Session | Ghost Mode for unsaved analysis — back nav restores state |
| `/dashboard` | Authenticated | Analysis archive with Drift Recovery Rate and delete |
| `/report/[id]` | Authenticated | Nine-section Founder Report for a saved analysis |
| `/report/session` | Session | Founder Report for unsaved analysis — save from banner |

---

## Getting Started

### Prerequisites

| Requirement | Purpose |
|---|---|
| Node.js 18+ | Runtime |
| Supabase project | Database for projects and drift zones |
| Novus.ai project | Pendo snippet key for event tracking |
| OpenRouter API key | GPT-4o-mini for AI correction cards |

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

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Novus.ai / Pendo
# NEXT_PUBLIC_NOVUS_API_KEY  — Pendo snippet key (client-side SDK loader)
# NEXT_PUBLIC_NOVUS_PROJECT_ID — your Novus project identifier
# NOVUS_API_KEY              — same snippet key, used server-side
NEXT_PUBLIC_NOVUS_API_KEY=your_pendo_snippet_key
NEXT_PUBLIC_NOVUS_PROJECT_ID=your_novus_project_id
NOVUS_API_KEY=your_pendo_snippet_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

> **Pendo snippet key** — found in your Pendo subscription under Settings → Subscription → App Details. It loads `https://cdn.pendo.io/agent/static/{key}/pendo.js` and enables `window.pendo`. A separate Pendo Integration Key for server-side data API access is not required — the telemetry panels use session-storage aggregation as the data source.

### 4. Database

Run in your Supabase SQL Editor:

```bash
supabase/schema.sql                       # fresh project
supabase/migrations/001_nullable_user_id.sql  # existing deployment
```

### 5. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # production server
```

---

## Demo

Drift ships with **TaskFlow Pro** — a pre-built demo covering all five drift types. No credentials or database required.

Open [`/ghost`](http://localhost:3000/ghost) or click **View Demo** on the landing page.

| Feature | Classification | Usage Score | Drift Signal |
|---|---|---|---|
| Dashboard Widget | Ghost | 0/100 | Built as high-priority. Never adopted. |
| CSV Export | Misunderstood | 60/100 | Used at scale, but not as designed. |
| Kanban Board | Overbuilt | 10/100 | Heavy investment, minimal engagement. |
| Team Collaboration | Underbuilt | 80/100 | High demand, treated as low priority. |
| Dark Mode | Aligned | — | Usage matches spec intent. |

**Drift Score: 21 · Ghost Features: 2 · Estimated Waste: $80,000**

---

## License

MIT © 2025 Robert Samuel
