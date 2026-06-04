# DRIFT — The Product Intent Tracker

> Detect the gap between what you built and what users actually do.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini-orange)](https://openrouter.ai)

---

## What is DRIFT?

**DRIFT** is a product analytics tool that compares your product specification (PRD, README, roadmap) against real user behavior data from **Novus.ai** to compute a **Drift Score** — a single number (0–100) measuring how far your product has drifted from its original intent.

When your Drift Score drops, DRIFT shows you exactly which features are:

| Type | Meaning |
|------|---------|
| 👻 **Ghost** | Built with high priority — nobody uses it |
| 🔴 **Overbuilt** | Heavy investment, minimal adoption |
| 🔺 **Underbuilt** | Users love it, spec ignores it |
| 🟣 **Misunderstood** | Used differently than intended |
| ✅ **Aligned** | Behaving exactly as designed |

---

## Features

- **Ghost Mode** — Three-pane split screen: spec viewer, drift grid, live Novus feed
- **Drift Score** — Animated circular score ring (0–100) with color-coded severity
- **AI Corrections** — Click any drift zone → GPT-4o-mini generates correction cards with user stories, copy rewrites, and mockup suggestions
- **Analyze Page** — Paste any PRD and get instant drift analysis
- **Founder Report** — Executive summary with Top Risks, Ghost Features, AI Recommendations, and markdown export
- **Dashboard** — Save and revisit all your analyses

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| AI | OpenRouter → GPT-4o-mini |
| Analytics | Novus.ai |
| Animations | Framer Motion |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RobertSamuel-tech/Drift.git
cd Drift
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Novus.ai
NEXT_PUBLIC_NOVUS_API_KEY=your_novus_key
NEXT_PUBLIC_NOVUS_PROJECT_ID=your_project_id
NOVUS_API_KEY=your_novus_server_key

# OpenRouter (AI)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 4. Set up the database

Run `supabase/schema.sql` in your Supabase SQL Editor.

> If you already have the schema deployed, run `supabase/migrations/001_nullable_user_id.sql` to allow anonymous project saves.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
drift/
├── app/
│   ├── page.tsx              # Landing page
│   ├── analyze/              # Paste & analyze a spec
│   ├── dashboard/            # Saved analyses list
│   ├── dashboard/[id]/       # Ghost Mode for saved project
│   ├── report/[id]/          # Founder Report (export-ready)
│   ├── ghost/                # Demo Ghost Mode
│   └── api/
│       ├── analyze/          # POST: extract features + drift score
│       ├── correct/          # POST: generate AI correction cards
│       ├── projects/         # GET: list | POST: save analysis
│       └── health/           # GET: env variable check
├── components/
│   ├── GhostMode.tsx         # Three-pane main layout
│   ├── DriftScore.tsx        # Animated circular score ring
│   ├── DriftGrid.tsx         # Visual drift zone grid
│   ├── SpecViewer.tsx        # Spec viewer with line highlighting
│   ├── NovusFeed.tsx         # Live Novus event feed
│   └── CorrectionPanel.tsx   # AI correction slide-out panel
├── lib/
│   ├── drift-algorithm.ts    # Core drift scoring algorithm
│   ├── analyze.ts            # Shared analysis logic
│   ├── openai.ts             # OpenRouter / OpenAI client
│   ├── supabase.ts           # Supabase client factory
│   ├── database.types.ts     # TypeScript interfaces
│   ├── demo-data.ts          # Demo project (TaskFlow Pro)
│   └── fallback-cards.ts     # Offline correction cards
└── supabase/
    ├── schema.sql            # Full PostgreSQL schema + RLS
    └── migrations/           # Incremental migrations
```

---

## How the Drift Algorithm Works

```
Spec Text → extractFeaturesFromSpec() → SpecFeature[]
                                              ↓
Novus Events → calculateDriftScore() → Score (0–100)
                                              ↓
                  classifyDriftType() → ghost | overbuilt | underbuilt | misunderstood | aligned
                                              ↓
                    getDriftColor()   → Hex color per zone
```

**Score formula:**
- Each feature gets a `weight` (high=3, medium=2, low=1)
- `expectedUsage` is 80/50/20 for high/medium/low priority
- `featureDrift = |expectedUsage − actualUsage| × weight`
- `score = 100 − (totalDrift / maxDrift) × 100`

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | `POST` | Extract features + compute drift from a spec |
| `/api/correct` | `POST` | Generate AI correction cards for drift zones |
| `/api/projects` | `GET` | List all saved analyses |
| `/api/projects` | `POST` | Save an analysis to Supabase |
| `/api/health` | `GET` | Check environment variable status |

---

## Demo

The app ships with **TaskFlow Pro** — a pre-built demo project showing all five drift types in action. No credentials needed to explore.

Visit `/ghost` to see Ghost Mode running on live demo data.

---

## License

MIT © 2025 Robert Samuel
