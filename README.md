# DRIFT — The Product Intent Tracker

> Detect the gap between what you built and what users actually do.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-black?logo=framer)](https://www.framer.com/motion/)

---

## What is DRIFT?

Every product starts with a vision. DRIFT measures how far yours has traveled from it.

Paste your product spec — a PRD, README, or roadmap — and DRIFT cross-references it against real user behavior from **Novus.ai** to produce a **Drift Score**: a single number (0–100) that tells you how closely your shipped product matches what you originally intended to build.

The lower the score, the further users have drifted from founder intent.

---

## The Five Drift Types

| Type | What it means |
|------|---------------|
| **Ghost** | Built as high-priority. No measurable user adoption. Engineering effort with zero return. |
| **Overbuilt** | Received heavy investment. Users engage at a fraction of the expected rate. |
| **Underbuilt** | Users actively seek it out. Your spec treats it as low priority. |
| **Misunderstood** | Users engage, but not the way you designed it. Intent and behavior diverged. |
| **Aligned** | Spec priority and actual usage match. This is what success looks like. |

---

## Report Sections

### Founder Alignment Index
An executive-level radial meter that answers one question in three seconds: *how wrong was the original product assumption?* Calculated from the Drift Score, ghost feature count, overbuilt features, and usage concentration. Shows a Regret Index (0–100) with a 330° animated SVG arc segmented into four severity zones.

### Product Reality Map
Side-by-side comparison of **Founder Intent** (features sorted by intended priority) vs **User Reality** (features sorted by actual Novus usage score). Includes a concentration score measuring how dominant the top feature is relative to total usage, and a generated summary that reads: *"You are operating a single-feature product."* when appropriate.

### Feature Lifecycle Timeline
Every feature classified into one of four stages based on its usage score:

| Stage | Usage Score |
|-------|-------------|
| Ghost | 0 |
| Ignored | 1–19 |
| Partial Adoption | 20–59 |
| Core Product | 60–100 |

Displayed as animated cards showing the feature's journey from spec to shipping to adoption outcome.

### Engineering Impact
Ghost and overbuilt features converted into a dollar figure. Assumes 5 engineers × 10 days/sprint × $800/day. Shows estimated waste, wasted sprint count, and ghost feature count — all derived from actual Novus data.

### Top Risks
The three highest-risk drift zones ranked by severity (Ghost → Overbuilt → Misunderstood → Underbuilt), each with a plain-English explanation of the business cost.

### AI Recommendations
Correction cards generated per drift type with a user story reframe, copy rewrite suggestion, and mockup direction.

---

## Ghost Mode

Three-pane split screen for deep investigation:

- **Left** — Spec viewer with line-level highlighting tied to each drift zone
- **Center** — Visual drift grid with clickable zones that open AI correction panels
- **Right** — Live Novus event feed showing real user interactions as they happen

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Animations | Framer Motion 12 |
| Database | Supabase (PostgreSQL + RLS) |
| AI | OpenRouter → GPT-4o-mini |
| Analytics | Novus.ai |

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

Run `supabase/schema.sql` in your Supabase SQL Editor.

```sql
-- Already have the schema? Apply the incremental migration:
-- supabase/migrations/001_nullable_user_id.sql
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
drift/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── analyze/                  # Paste spec → instant drift analysis
│   ├── dashboard/                # Saved analyses list
│   ├── dashboard/[id]/           # Ghost Mode for a saved project
│   ├── report/[id]/              # Founder Report (print/export-ready)
│   ├── ghost/                    # Demo Ghost Mode (no login required)
│   └── api/
│       ├── analyze/              # POST: extract features + drift score
│       ├── correct/              # POST: generate AI correction cards
│       ├── projects/             # GET: list | POST: save analysis
│       └── health/               # GET: environment variable check
│
├── components/
│   ├── FounderAlignmentMeter.tsx # Radial SVG meter — Regret vs Alignment Index
│   ├── ProductRealityMap.tsx     # Founder Intent vs User Reality side-by-side
│   ├── FeatureTimeline.tsx       # Feature lifecycle stage cards
│   ├── GhostMode.tsx             # Three-pane investigation layout
│   ├── DriftScore.tsx            # Animated circular score ring
│   ├── DriftGrid.tsx             # Visual drift zone grid
│   ├── SpecViewer.tsx            # Spec viewer with zone highlighting
│   ├── NovusFeed.tsx             # Live Novus event feed
│   └── CorrectionPanel.tsx       # AI correction slide-out panel
│
├── lib/
│   ├── founder-alignment.ts      # Alignment Index + Regret Index calculator
│   ├── reality-map.ts            # Intended vs actual feature sort + concentration
│   ├── feature-lifecycle.ts      # Ghost / Ignored / Partial / Core classifier
│   ├── cost-analysis.ts          # Engineering waste → dollar estimate
│   ├── drift-algorithm.ts        # Core drift scoring formula
│   ├── analyze.ts                # Shared analysis logic
│   ├── fallback-cards.ts         # Offline correction cards
│   ├── demo-data.ts              # Demo project (TaskFlow Pro)
│   ├── novus.ts                  # Novus.ai client
│   ├── openai.ts                 # OpenRouter / OpenAI client
│   ├── supabase.ts               # Supabase client factory
│   └── database.types.ts         # TypeScript interfaces
│
└── supabase/
    ├── schema.sql                # Full PostgreSQL schema + RLS policies
    └── migrations/               # Incremental migration files
```

---

## How the Drift Score is Calculated

```
Spec Text  →  extractFeaturesFromSpec()  →  SpecFeature[]
                                                 ↓
Novus Events  →  calculateDriftScore()  →  Score (0–100)
                                                 ↓
               classifyDriftType()  →  ghost | overbuilt | underbuilt | misunderstood | aligned
```

Each feature is weighted by intended priority (high=3, medium=2, low=1). Expected usage thresholds are 80/50/20. Drift per feature is `|expectedUsage − actualUsage| × weight`. The final score is `100 − (totalDrift / maxDrift) × 100`.

---

## How the Founder Alignment Index is Calculated

```
alignmentIndex = driftScore
               − (ghostFeatures × 8)
               − (overbuiltFeatures × 5)
               − (10 if concentrationScore > 70)
               − (15 if concentrationScore > 85)

               clamped to [0, 100]

regretIndex = 100 − alignmentIndex
```

| Regret Index | Severity |
|---|---|
| 0–25 | Aligned |
| 26–50 | Concern |
| 51–75 | High Risk |
| 76–100 | Critical Misalignment |

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Extract features + compute drift from a spec |
| `/api/correct` | POST | Generate AI correction cards for a drift zone |
| `/api/projects` | GET | List all saved analyses |
| `/api/projects` | POST | Save an analysis to Supabase |
| `/api/health` | GET | Check environment variable status |

---

## Demo

The app ships with **TaskFlow Pro** — a pre-built demo project that shows all five drift types in action. No credentials required.

Visit `/ghost` for Ghost Mode on live demo data.  
Visit `/analyze` and click **Load Demo Spec** to run the full analysis flow.

---

## License

MIT © 2025 Robert Samuel
