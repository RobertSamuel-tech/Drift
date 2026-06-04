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
      <header className="flex h-12 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-6">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-[#FF8A1F] tracking-widest">DRIFT</span>
          <span className="h-3 w-px bg-slate-700" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            Product Intelligence Command Center
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/dashboard"
            className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300">
            Archive
          </Link>
          <Link href="/ghost"
            className="flex items-center gap-1.5 border border-slate-700/60 bg-slate-800/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400">
            Live Demo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* ── System status strip ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-6 border-b border-slate-800/60 bg-slate-950 px-6 py-2"
      >
        {[
          { label: 'NOVUS CONNECTED',          color: 'bg-emerald-400' },
          { label: 'GPT-4o READY',             color: 'bg-emerald-400' },
          { label: 'ANALYSIS ENGINE ONLINE',   color: 'bg-emerald-400' },
          { label: 'DRIFT DETECTION ACTIVE',   color: 'bg-emerald-400' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.color} opacity-40`} />
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.color}`} />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">{s.label}</span>
          </div>
        ))}
      </motion.div>

      <main className="mx-auto max-w-6xl space-y-6 p-6">

        {/* ── Title + CTA ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-wide text-white">
              PRODUCT INTELLIGENCE
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
              Detect the gap between what you built and what users actually do.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="flex items-center gap-2 bg-emerald-500 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-emerald-400"
            >
              Initialize Analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/ghost"
              className="flex items-center gap-2 border border-slate-700/60 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-slate-400 transition-all hover:border-slate-500 hover:text-white"
            >
              View Demo
            </Link>
          </div>
        </motion.div>

        {/* ── Capability panels ─────────────────────────────────────────────── */}
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
              className={`bg-slate-900 p-5 ${cap.border}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <cap.icon className={`h-4 w-4 ${cap.color}`} />
                <span className={`font-mono text-[9px] uppercase tracking-widest ${cap.color} opacity-60`}>
                  {cap.id}
                </span>
              </div>
              <p className={`mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em] ${cap.color}`}>
                {cap.title}
              </p>
              <p className="text-sm leading-relaxed text-slate-400">{cap.desc}</p>
              <p className={`mt-3 font-mono text-[9px] uppercase tracking-widest ${cap.color} opacity-50`}>
                {cap.stat}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── How it works — process strip ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="border border-slate-700/60 bg-slate-900"
        >
          <div className="border-b border-slate-800/60 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Analysis Pipeline
            </span>
          </div>
          <div className="flex flex-col items-start gap-0 divide-y divide-slate-800/60 md:flex-row md:divide-x md:divide-y-0">
            {[
              { step: '01', label: 'SPEC INPUT',        desc: 'Paste any PRD, README, or roadmap' },
              { step: '02', label: 'FEATURE EXTRACTION', desc: 'Parse features + intended priorities' },
              { step: '03', label: 'NOVUS CORRELATION',  desc: 'Cross-reference actual usage events' },
              { step: '04', label: 'DRIFT SCORING',      desc: 'Compute 0–100 score per feature' },
              { step: '05', label: 'REPORT GENERATION',  desc: 'Roadmap reallocation + AI corrections' },
            ].map(p => (
              <div key={p.step} className="flex-1 px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">{p.step}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400/80">{p.label}</p>
                <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── System metrics row ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid grid-cols-5 gap-px border border-slate-700/60 bg-slate-700/20"
        >
          {SYSTEM_METRICS.map(m => (
            <div key={m.label} className="bg-slate-900 px-4 py-3 text-center">
              <p className={`font-mono text-xl font-bold tabular-nums leading-none ${m.color}`}>{m.value}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-600">{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Drift types reference ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="border border-slate-700/60 bg-slate-900"
        >
          <div className="border-b border-slate-800/60 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Drift Classification Schema
            </span>
          </div>
          <div className="divide-y divide-slate-800/40">
            {[
              { type: 'GHOST',         desc: 'Built as high-priority. Zero adoption. Engineering effort with no return.',       color: 'text-slate-400', dot: 'bg-slate-500' },
              { type: 'OVERBUILT',     desc: 'Heavy investment. Users engage at a fraction of the expected rate.',              color: 'text-red-400',   dot: 'bg-red-500' },
              { type: 'UNDERBUILT',    desc: 'Users seek it out. Spec treats it as low priority. Untapped growth.',             color: 'text-amber-400', dot: 'bg-amber-500' },
              { type: 'MISUNDERSTOOD', desc: 'Users engage but not as designed. Intent and behavior diverged.',                 color: 'text-violet-400',dot: 'bg-violet-500' },
              { type: 'ALIGNED',       desc: 'Spec priority and actual usage match. This is what product success looks like.',  color: 'text-emerald-400',dot: 'bg-emerald-500' },
            ].map(d => (
              <div key={d.type} className="flex items-center gap-4 px-4 py-2.5 hover:bg-slate-800/30 transition-colors">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${d.dot}`} />
                <span className={`w-28 shrink-0 font-mono text-[10px] uppercase tracking-widest ${d.color}`}>{d.type}</span>
                <span className="text-sm text-slate-500">{d.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Demo prompt ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center justify-between border border-slate-700/60 bg-slate-900 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <Ghost className="h-4 w-4 text-slate-600" />
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                TaskFlow Pro — Live Demo
              </p>
              <p className="text-xs text-slate-600">
                Ghost Mode · 5 features · Drift Score 21 · $80,000 estimated waste
              </p>
            </div>
          </div>
          <Link
            href="/ghost"
            className="flex items-center gap-1.5 border border-slate-700/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-400 transition-all hover:border-emerald-500/40 hover:text-emerald-400"
          >
            Open Analysis <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="mt-8 border-t border-slate-800/60 px-6 py-3 text-center">
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
          DRIFT · Next.js 14 · Novus.ai · GPT-4o-mini · Supabase · 2025
        </span>
      </footer>
    </div>
  )
}
