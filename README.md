# DRIFT — The Product Intent Tracker

> *"You built what you planned. Users adopted something else entirely."*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-black?logo=framer)](https://www.framer.com/motion/)

DRIFT is a product analytics tool that compares your original product specification against real user behavior from **Novus.ai** to produce a **Drift Score** — a single number measuring how far your shipped product has traveled from founder intent.

---

## Architecture

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                         DRIFT Platform                           │
  │                                                                  │
  │  Founder pastes spec (PRD / README / roadmap)                    │
  │          │                                                       │
  │          ▼                                                       │
  │  ┌───────────────┐   POST /api/analyze    ┌──────────────────┐  │
  │  │  /analyze     │ ─────────────────────▶ │  Analysis Engine │  │
  │  │  (Client)     │ ◀───── DriftZone[] ─── │                  │  │
  │  └───────┬───────┘                        │  extractFeatures │  │
  │          │  Save                          │  calculateDrift  │  │
  │          ▼                                │  classifyType    │  │
  │  ┌───────────────┐                        └──────────────────┘  │
  │  │  Supabase     │                                 │            │
  │  │  PostgreSQL   │ ◀─── persist zones/projects ───┘            │
  │  │               │                                              │
  │  │  projects     │                                              │
  │  │  drift_zones  │                                              │
  │  └───────┬───────┘                                              │
  │          │  Load on report                                      │
  │          ▼                                                       │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │                    lib/  (pure TypeScript)                  │ │
  │  │                                                            │ │
  │  │  drift-algorithm      →  Drift Score (0–100)               │ │
  │  │  reality-map          →  Founder Intent vs User Reality     │ │
  │  │  founder-alignment    →  Alignment Index + Regret Index     │ │
  │  │  feature-lifecycle    →  Ghost / Ignored / Partial / Core   │ │
  │  │  cost-analysis        →  Engineering waste → $              │ │
  │  │  roadmap-reallocation →  Remove / Improve / Invest actions  │ │
  │  └───────────────────────────┬────────────────────────────────┘ │
  │                              │                                   │
  │          ┌───────────────────┼───────────────────┐              │
  │          ▼                   ▼                   ▼              │
  │  ┌──────────────┐   ┌─────────────────┐  ┌──────────────────┐  │
  │  │  Novus.ai    │   │  /report/[id]   │  │  OpenRouter      │  │
  │  │              │   │                 │  │  GPT-4o-mini     │  │
  │  │  Event data  │   │  01 Exec Summary│  │                  │  │
  │  │  Usage scores│   │  02 Top Risks   │  │  POST /api/correct│ │
  │  │  Live feed   │   │  03 Reality Map │  │  Correction cards│  │
  │  └──────────────┘   │  04 Roadmap     │  └──────────────────┘  │
  │                     │  05 Lifecycle   │                         │
  │                     │  06 Ghost Feat. │                         │
  │                     │  07 Eng. Impact │                         │
  │                     │  08 AI Recs     │                         │
  │                     │  09 Summary     │                         │
  │                     └─────────────────┘                         │
  └──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
  Spec Text (raw string)
       │
       │  extractFeaturesFromSpec()
       ▼
  SpecFeature[]  ──────────────────────────────────────┐
  { name, priority, mentions }                         │
       │                                               │
       │  + Novus events (avgPerSession)               │
       │                                               │
       ▼                                               ▼
  calculateDriftScore()                      classifyDriftType()
       │                                               │
       ▼                                               ▼
  score: number (0–100)                   DriftZone[]
                                          { feature_name,
                                            intended_priority,
                                            actual_usage_score,
                                            drift_type }
                                                       │
               ┌───────────────────────────────────────┤
               │               │               │       │
               ▼               ▼               ▼       ▼
        buildRealityMap  buildFeatureLifecycle  │  generateRoadmapReallocation
               │               │               │       │
               ▼               ▼               ▼       ▼
        RealityMap       LifecycleItem[]  calculateWasteMetrics
               │                               │
               ▼                               ▼
        calculateFounderAlignment ◀── concentrationScore
               │
               ▼
        FounderAlignment
        { alignmentIndex, regretIndex, severity, summary }
```

---

## The Five Drift Types

| Type | Condition | What it means |
|------|-----------|---------------|
| **Ghost** | `priority=high`, `usage=0` | Built with priority. Zero user adoption. Engineering effort, no return. |
| **Overbuilt** | `priority=high`, `usage<20` | Heavy investment, minimal adoption. Users don't value it the way you do. |
| **Underbuilt** | `priority=low`, `usage>80` | Users seek it out. Your spec ignores it. Untapped growth vector. |
| **Misunderstood** | `priority=medium`, `usage>50` | Users engage, but not as designed. Intent and behavior diverged. |
| **Aligned** | usage ≈ expected | Spec priority and actual usage match. This is what success looks like. |

---

## Scoring Algorithms

### Drift Score

```
weight        = { high: 3, medium: 2, low: 1 }
expectedUsage = { high: 80, medium: 50, low: 20 }

featureDrift  = |expectedUsage[priority] − actualUsageScore| × weight
totalDrift    = Σ featureDrift
maxDrift      = Σ (100 × weight)

driftScore    = round(100 − (totalDrift / maxDrift) × 100)
```

### Founder Alignment Index

```
alignmentIndex = driftScore
               − (ghostFeatures    × 8)
               − (overbuiltFeatures × 5)
               − (10  if concentrationScore > 70)
               − (15  if concentrationScore > 85)
               clamped to [0, 100]

regretIndex    = 100 − alignmentIndex
```

| Regret Index | Severity |
|---|---|
| 0 – 25 | Aligned |
| 26 – 50 | Concern |
| 51 – 75 | High Risk |
| 76 – 100 | Critical Misalignment |

### Reality Concentration

```
concentrationScore = round((topFeatureUsage / totalUsage) × 100)
```

> 70% → "You are operating a single-feature product."
> 50% → "Most user value comes from a small portion of the roadmap."

### Roadmap Reallocation

```
INVEST  →  top 20% by usage AND usageScore ≥ 60     confidence: 85–97%
REMOVE  →  drift_type = ghost AND usageScore = 0     confidence: 90–95%
IMPROVE →  usageScore > 50 OR drift_type = underbuilt confidence: 75–95%
```

No feature appears in two buckets. Summary cites actual feature names.

### Feature Lifecycle Stages

```
usageScore = 0        →  Ghost           (built, never adopted)
usageScore 1–19       →  Ignored         (built, rarely touched)
usageScore 20–59      →  Partial Adoption (growing, not dominant)
usageScore 60–100     →  Core Product    (users depend on it)
```

### Engineering Waste

```
sprintWeight = { high: 1, medium: 0.5, low: 0.25 }
wastedSprints = Σ sprintWeight  (ghost + overbuilt features only)
wastedDays    = wastedSprints × 10 days × 5 engineers
estimatedCost = wastedDays × $800/day
```

---

## Report Sections

| # | Section | What it shows |
|---|---------|---------------|
| 01 | **Executive Summary** | Founder Alignment Meter — radial SVG KPI with Regret Index and four severity zones |
| 02 | **Top Risks** | Three highest-risk drift zones with plain-English business cost |
| 03 | **Product Reality Map** | Side-by-side: Founder Intent (by priority) vs User Reality (by usage) |
| 04 | **Roadmap Reallocation** | Invest / Improve / Remove actions with confidence scores and evidence |
| 05 | **Feature Lifecycle** | Every feature's journey from spec to Ghost / Ignored / Partial / Core |
| 06 | **Ghost Features** | Zero-adoption features with priority context |
| 07 | **Engineering Impact** | Wasted sprints and dollar estimate from ghost + overbuilt features |
| 08 | **AI Recommendations** | Correction cards: user story reframe, copy rewrite, mockup direction |
| 09 | **Founder Summary** | One-paragraph plain-English summary citing actual features |

---

## Ghost Mode

Three-pane investigation layout at `/ghost` (demo) or `/dashboard/[id]`:

```
┌─────────────────────┬────────────────────────┬──────────────────────┐
│   PRODUCT SPEC      │     DRIFT ZONES         │   NOVUS EVENTS       │
│                     │                         │                      │
│  # TaskFlow Pro     │  ┌──────────┐ ┌───────┐ │  ● Dashboard         │
│                     │  │Dashboard │ │Kanban │ │    Count: 0  Avg: 0  │
│  * Dashboard (MUST) │  │  Ghost   │ │ Over- │ │                      │
│  * CSV Export (MUST)│  │  0/100   │ │ built │ │  ● Kanban Board      │
│  * Team collab      │  └──────────┘ │10/100 │ │    Count: 12 Avg: 1  │
│  * Dark mode (NICE) │               └───────┘ │                      │
│  * Custom emoji     │  ┌──────────┐           │  ● CSV Export        │
│                     │  │CSV Export│           │    Count: 240 Avg: 6 │
│                     │  │ Misunder-│           │                      │
│                     │  │ stood    │           │  ● Dark Mode         │
│                     │  │ 60/100   │           │    Count: 0  Avg: 0  │
└─────────────────────┴────────────────────────┴──────────────────────┘
     GHOST FEATURES: 2   EST. WASTE: $80,000   DRIFT SCORE: 21
```

Click any zone to open the AI correction panel (slide-out) with:
- User story reframe
- Copy rewrite suggestion
- Mockup direction

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 App Router | SSR pages + API routes |
| Language | TypeScript 5 | End-to-end type safety |
| Styling | Tailwind CSS 3 | Utility-first design system |
| Animations | Framer Motion 12 | SVG meters, slide-ins, staggered reveals |
| Database | Supabase (PostgreSQL + RLS) | Projects, drift zones, correction cards |
| AI | OpenRouter → GPT-4o-mini | Correction card generation |
| Analytics | Novus.ai | Real user event tracking + usage scores |

---

## Project Structure

```
drift/
│
├── app/
│   ├── page.tsx                    # Landing page
│   ├── analyze/page.tsx            # Paste spec → instant drift analysis
│   ├── dashboard/page.tsx          # Saved analyses list
│   ├── dashboard/[id]/page.tsx     # Ghost Mode for a saved project
│   ├── report/[id]/
│   │   ├── page.tsx                # Full Founder Report (9 sections)
│   │   └── ExportButton.tsx        # Markdown export client component
│   ├── ghost/page.tsx              # Demo Ghost Mode (no login required)
│   └── api/
│       ├── analyze/route.ts        # POST: extract features + drift score
│       ├── correct/route.ts        # POST: generate AI correction cards
│       ├── projects/route.ts       # GET: list | POST: save analysis
│       └── health/route.ts         # GET: environment variable check
│
├── components/
│   ├── FounderAlignmentMeter.tsx   # 330° SVG radial meter, Regret vs Alignment
│   ├── ProductRealityMap.tsx       # Founder Intent vs User Reality columns
│   ├── RoadmapReallocation.tsx     # Invest/Improve/Remove recommendation cards
│   ├── FeatureTimeline.tsx         # Feature lifecycle stage cards
│   ├── GhostMode.tsx               # Three-pane spec / zones / Novus layout
│   ├── DriftScore.tsx              # Animated circular score ring
│   ├── DriftGrid.tsx               # Visual drift zone grid
│   ├── SpecViewer.tsx              # Spec viewer with line highlighting
│   ├── NovusFeed.tsx               # Live Novus event feed
│   └── CorrectionPanel.tsx         # AI correction slide-out panel
│
├── lib/
│   ├── drift-algorithm.ts          # Core: extractFeatures, calculateDrift, classify
│   ├── reality-map.ts              # buildRealityMap() — intent vs reality + concentration
│   ├── founder-alignment.ts        # calculateFounderAlignment() — Alignment + Regret Index
│   ├── feature-lifecycle.ts        # buildFeatureLifecycle() — Ghost/Ignored/Partial/Core
│   ├── cost-analysis.ts            # calculateWasteMetrics() — sprints → dollar estimate
│   ├── roadmap-reallocation.ts     # generateRoadmapReallocation() — invest/improve/remove
│   ├── analyze.ts                  # Shared analysis logic
│   ├── fallback-cards.ts           # Offline correction cards by drift type
│   ├── demo-data.ts                # Demo project: TaskFlow Pro
│   ├── novus.ts                    # Novus.ai client
│   ├── openai.ts                   # OpenRouter / OpenAI client
│   ├── supabase.ts                 # Supabase client factory (anon + service role)
│   └── database.types.ts           # TypeScript interfaces: Project, DriftZone, etc.
│
├── lib/*.test.ts                   # Pure TS test suites (tsx runner, no framework)
│   ├── reality-map.test.ts         # 22 tests
│   ├── feature-lifecycle.test.ts   # 19 tests
│   ├── cost-analysis.test.ts       # 15 tests
│   └── roadmap-reallocation.test.ts# 18 tests
│
└── supabase/
    ├── schema.sql                  # Full PostgreSQL schema + RLS policies
    └── migrations/                 # Incremental migration files
```

---

## Database Schema

```sql
projects (
  id                uuid PRIMARY KEY,
  user_id           uuid REFERENCES auth.users,
  name              text,
  novus_project_id  text,
  spec_source       text,            -- 'github' | 'manual' | 'demo'
  spec_content      text,
  drift_score       integer,
  last_analyzed     timestamptz,
  created_at        timestamptz
)

drift_zones (
  id                uuid PRIMARY KEY,
  project_id        uuid REFERENCES projects,
  feature_name      text,
  intended_priority text,            -- 'high' | 'medium' | 'low'
  actual_usage_score integer,        -- 0–100 from Novus
  drift_type        text,            -- 'ghost' | 'overbuilt' | 'underbuilt' | 'misunderstood' | 'aligned'
  novus_event_name  text,
  position_x        integer,
  position_y        integer,
  created_at        timestamptz
)

correction_cards (
  id                uuid PRIMARY KEY,
  project_id        uuid REFERENCES projects,
  drift_zone_id     uuid REFERENCES drift_zones,
  title             text,
  user_story        text,
  copy_rewrite      text,
  mockup_suggestion text,
  priority          text,            -- 'critical' | 'high' | 'medium' | 'low'
  ai_generated      boolean,
  created_at        timestamptz
)
```

---

## API Reference

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/analyze` | POST | `{ spec_content: string }` | `{ score, zones[], featuresFound }` |
| `/api/correct` | POST | `{ zone_id, drift_type, feature_name }` | `{ card: CorrectionCard }` |
| `/api/projects` | GET | — | `{ projects[] }` |
| `/api/projects` | POST | `{ name, spec_content, drift_score, zones[] }` | `{ project_id }` |
| `/api/health` | GET | — | `{ supabase, novus, openrouter }` status flags |

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/RobertSamuel-tech/Drift.git
cd Drift
```

### 2. Install

```bash
npm install
```

### 3. Environment variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Novus.ai
NEXT_PUBLIC_NOVUS_API_KEY=your_novus_key
NEXT_PUBLIC_NOVUS_PROJECT_ID=your_project_id
NOVUS_API_KEY=your_novus_server_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 4. Database

Run `supabase/schema.sql` in your Supabase SQL Editor. For existing deployments:

```bash
# Apply incremental migration (nullable user_id for anonymous saves)
supabase/migrations/001_nullable_user_id.sql
```

### 5. Run

```bash
npm run dev        # development
npm run build      # production build
npm run start      # production server
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Run tests

```bash
npx tsx lib/reality-map.test.ts
npx tsx lib/feature-lifecycle.test.ts
npx tsx lib/cost-analysis.test.ts
npx tsx lib/roadmap-reallocation.test.ts
```

74 tests, no test framework required.

---

## Demo

The app ships with **TaskFlow Pro** — a pre-built demo project showing all five drift types. No credentials required.

| Route | What you see |
|-------|-------------|
| `/ghost` | Full Ghost Mode on live demo data: Dashboard (Ghost, 0/100), CSV Export (Misunderstood, 60/100), Kanban Board (Overbuilt, 10/100) |
| `/analyze` | Paste any PRD → click **Load Demo Spec** for instant analysis |
| `/dashboard` | Saved analyses list (requires Supabase) |
| `/report/[id]` | Full 9-section Founder Report (requires a saved project) |

---

## License

MIT © 2025 Robert Samuel
