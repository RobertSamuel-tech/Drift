'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Ghost, TrendingUp, Zap, Activity } from 'lucide-react'

const CAPABILITIES = [
  {
    id: '01',
    title: 'INTENT VS REALITY',
    desc: 'Cross-reference your product spec against actual Novus usage data. Identify which features users adopt, ignore, or misuse.',
    stat: '5 drift types detected',
    color: 'text-violet-400',
    border: 'border-l-2 border-violet-500/60',
    icon: Activity,
  },
  {
    id: '02',
    title: 'DRIFT SCORE ENGINE',
    desc: 'A single 0–100 signal. 100 means users behave exactly as intended. Below 50 means your product is haunted by ghost features.',
    stat: '<3s analysis time',
    color: 'text-emerald-400',
    border: 'border-l-2 border-emerald-500/60',
    icon: TrendingUp,
  },
  {
    id: '03',
    title: 'AI CORRECTION CARDS',
    desc: 'GPT-4o-mini converts drift zones into actionable correction cards: user story rewrites, copy changes, mockup direction.',
    stat: 'GPT-4o-mini',
    color: 'text-amber-400',
    border: 'border-l-2 border-amber-500/60',
    icon: Zap,
  },
]

const SYSTEM_METRICS = [
  { label: 'DETECTION ACCURACY', value: '100%',    color: 'text-emerald-400' },
  { label: 'DRIFT TYPES',        value: '5',        color: 'text-white' },
  { label: 'ANALYSIS SPEED',     value: '<3s',      color: 'text-white' },
  { label: 'AI BACKEND',         value: 'GPT-4o',   color: 'text-white' },
  { label: 'DATA SOURCE',        value: 'Novus.ai', color: 'text-white' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* ── Top command bar ────────────────────────────────────────────────── */}
      <header className="flex h-12 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-8">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-[#FF8A1F] tracking-widest">DRIFT</span>
          <span className="h-3 w-px bg-slate-700" />
          {/* Phase 3 — increased header subtitle contrast */}
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
            Product Intelligence Command Center
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard"
            className="px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-200">
            Archive
          </Link>
          <Link href="/ghost"
            className="flex items-center gap-1.5 border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-slate-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400">
            Live Demo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* ── System status strip — Phase 3: larger text, more contrast ──────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-8 border-b border-slate-700/60 bg-slate-900/60 px-8 py-3"
      >
        {[
          { label: 'NOVUS CONNECTED',         color: 'bg-emerald-400' },
          { label: 'GPT-4o READY',            color: 'bg-emerald-400' },
          { label: 'ANALYSIS ENGINE ONLINE',  color: 'bg-emerald-400' },
          { label: 'DRIFT DETECTION ACTIVE',  color: 'bg-emerald-400' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.color} opacity-40`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${s.color}`} />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Phase 1 — max-w-7xl, Phase 8 — tighter spacing */}
      <main className="mx-auto max-w-7xl space-y-5 px-8 py-5">

        {/* ── Title + CTA — Phase 2: text-5xl hero ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            {/* Phase 2 — from text-2xl to text-5xl */}
            <h1 className="font-mono text-5xl font-bold tracking-wide text-white leading-tight">
              PRODUCT INTELLIGENCE
            </h1>
            {/* Phase 2 — subtitle from text-slate-500 to text-slate-300 */}
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-slate-300">
              Detect the gap between what you built and what users actually do.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/analyze"
              className="flex items-center gap-2 bg-emerald-500 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-emerald-400 min-h-[44px]"
            >
              Initialize Analysis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ghost"
              className="flex items-center gap-2 border border-slate-600 px-6 py-3 font-mono text-sm uppercase tracking-widest text-slate-300 transition-all hover:border-slate-400 hover:text-white min-h-[44px]"
            >
              View Demo
            </Link>
          </div>
        </motion.div>

        {/* ── Capability panels — Phase 5: larger titles, padding, contrast ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-1 gap-px border border-slate-700/60 bg-slate-700/20 md:grid-cols-3"
        >
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.35 }}
              className={`bg-slate-900 p-6 ${cap.border}`}
            >
              <div className="mb-5 flex items-start justify-between">
                <cap.icon className={`h-5 w-5 ${cap.color}`} />
                <span className={`font-mono text-xs uppercase tracking-widest ${cap.color} opacity-70`}>
                  {cap.id}
                </span>
              </div>
              <p className={`mb-3 font-mono text-sm font-bold uppercase tracking-[0.18em] ${cap.color}`}>
                {cap.title}
              </p>
              {/* Phase 5 — description from text-slate-400 to text-slate-300 */}
              <p className="text-sm leading-relaxed text-slate-300">{cap.desc}</p>
              <p className={`mt-4 font-mono text-xs uppercase tracking-widest ${cap.color} opacity-70`}>
                {cap.stat}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Analysis Pipeline — Phase 5: larger text, more padding ──────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="border border-slate-700/60 bg-slate-900"
        >
          <div className="border-b border-slate-700/60 px-6 py-3">
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Analysis Pipeline
            </span>
          </div>
          <div className="flex flex-col items-start gap-0 divide-y divide-slate-800/60 md:flex-row md:divide-x md:divide-y-0">
            {[
              { step: '01', label: 'SPEC INPUT',         desc: 'Paste any PRD, README, or roadmap' },
              { step: '02', label: 'FEATURE EXTRACTION', desc: 'Parse features + intended priorities' },
              { step: '03', label: 'NOVUS CORRELATION',  desc: 'Cross-reference actual usage events' },
              { step: '04', label: 'DRIFT SCORING',      desc: 'Compute 0–100 score per feature' },
              { step: '05', label: 'REPORT GENERATION',  desc: 'Roadmap reallocation + AI corrections' },
            ].map(p => (
              <div key={p.step} className="flex-1 px-6 py-4">
                {/* Phase 9 — step number from slate-700 to slate-500 */}
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500">{p.step}</p>
                <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">{p.label}</p>
                {/* Phase 5 — description from text-slate-500 to text-slate-300 */}
                <p className="mt-1.5 text-sm text-slate-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── System metrics — Phase 4: text-3xl, taller cards, bigger labels  */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid grid-cols-5 gap-px border border-slate-700/60 bg-slate-700/20"
        >
          {SYSTEM_METRICS.map(m => (
            <div key={m.label} className="bg-slate-900 px-6 py-5 text-center">
              {/* Phase 4 — from text-xl to text-3xl */}
              <p className={`font-mono text-3xl font-bold tabular-nums leading-none ${m.color}`}>{m.value}</p>
              {/* Phase 4 — from text-[9px] to text-sm */}
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-400">{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Drift Classification Schema — Phase 6: higher contrast ──────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="border border-slate-700/60 bg-slate-900"
        >
          <div className="border-b border-slate-700/60 px-6 py-3">
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Drift Classification Schema
            </span>
          </div>
          <div className="divide-y divide-slate-800/60">
            {[
              { type: 'GHOST',         desc: 'Built as high-priority. Zero adoption. Engineering effort with no return.',       color: 'text-slate-300', dot: 'bg-slate-400' },
              { type: 'OVERBUILT',     desc: 'Heavy investment. Users engage at a fraction of the expected rate.',              color: 'text-red-400',   dot: 'bg-red-500'   },
              { type: 'UNDERBUILT',    desc: 'Users seek it out. Spec treats it as low priority. Untapped growth.',             color: 'text-amber-400', dot: 'bg-amber-500' },
              { type: 'MISUNDERSTOOD', desc: 'Users engage but not as designed. Intent and behavior diverged.',                 color: 'text-violet-400',dot: 'bg-violet-500'},
              { type: 'ALIGNED',       desc: 'Spec priority and actual usage match. This is what product success looks like.',  color: 'text-emerald-400',dot: 'bg-emerald-500'},
            ].map(d => (
              <div key={d.type} className="flex items-center gap-5 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <span className={`h-2 w-2 shrink-0 rounded-full ${d.dot}`} />
                {/* Phase 6 — type label from text-[10px] to text-sm, text-zinc-200 */}
                <span className={`w-36 shrink-0 font-mono text-xs font-semibold uppercase tracking-widest ${d.color}`}>{d.type}</span>
                {/* Phase 6 — description from text-slate-500 to text-slate-300 */}
                <span className="text-sm leading-relaxed text-slate-300">{d.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Demo prompt — Phase 7: taller, bigger title, min-h button ─────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center justify-between border border-slate-700/60 bg-slate-900 px-6 py-5"
        >
          <div className="flex items-center gap-4">
            {/* Phase 7 — Ghost icon from text-slate-600 to text-slate-400 */}
            <Ghost className="h-6 w-6 shrink-0 text-slate-400" />
            <div>
              {/* Phase 7 — title from text-xs to text-sm, better contrast */}
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                TaskFlow Pro — Live Demo
              </p>
              {/* Phase 7 — subtitle from text-slate-600 to text-slate-400 */}
              <p className="mt-0.5 text-sm text-slate-400">
                Ghost Mode · 5 features · Drift Score 21 · $80,000 estimated waste
              </p>
            </div>
          </div>
          {/* Phase 7 — button with min-h-[42px] */}
          <Link
            href="/ghost"
            className="flex items-center gap-2 border border-slate-600 px-5 py-2.5 font-mono text-sm uppercase tracking-widest text-slate-300 transition-all hover:border-emerald-500/60 hover:text-emerald-400 min-h-[42px]"
          >
            Open Analysis <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

      </main>

      {/* ── Footer — Phase 9: increase contrast ──────────────────────────── */}
      <footer className="mt-4 border-t border-slate-700/60 px-8 py-4 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
          DRIFT · Next.js 14 · Novus.ai · GPT-4o-mini · Supabase
        </span>
      </footer>
    </div>
  )
}
