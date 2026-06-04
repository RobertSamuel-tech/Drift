'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Layers, Target, Sparkles, ChevronDown } from 'lucide-react'

const features = [
  {
    icon: Layers,
    label: '01',
    title: 'Intent vs Reality',
    desc: 'Upload your product spec. Connect Novus analytics. See exactly which features users ignore, overuse, or misunderstand.',
    accent: 'text-violet-400',
    ring: 'ring-violet-500/20',
    glow: 'bg-violet-500/8',
    border: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    icon: Target,
    label: '02',
    title: 'Drift Score',
    desc: 'A single 0–100 score. 100 means your users behave exactly as intended. Below 50 means your product is haunted by ghost features.',
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'bg-emerald-500/8',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    icon: Sparkles,
    label: '03',
    title: 'AI Corrections',
    desc: 'GPT-4o-mini generates correction cards with user stories, copy rewrites, and mockup suggestions. Ship the fix, not a redesign.',
    accent: 'text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'bg-amber-500/8',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/3 h-[700px] w-[700px] rounded-full bg-emerald-500/5 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-8 py-4 backdrop-blur-xl"
      >
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
          DRIFT
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/ghost"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 px-4 py-1.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-500 hover:text-white"
          >
            Live Demo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400"
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Powered by Novus.ai · GPT-4o-mini
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="mb-7 inline-flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-2 text-xs backdrop-blur-sm"
        >
          <span className="font-semibold text-slate-300">LIVE ANALYSIS</span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-500">PRD</span>
          <span className="text-slate-700">→</span>
          <span className="text-slate-500">Drift Detection</span>
          <span className="text-slate-700">→</span>
          <span className="text-slate-500">AI Recommendations</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 max-w-4xl text-[clamp(2.8rem,8vw,5.5rem)] font-extrabold leading-[1.06] tracking-tight"
        >
          The Product
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            Intent Tracker
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-10 max-w-[480px] text-base leading-relaxed text-slate-400 md:text-lg"
        >
          Analyze your own product or explore a sample project.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.5 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/analyze"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_32px_rgba(52,211,153,0.4)]"
          >
            Create New Analysis
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/ghost"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/50 px-8 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-slate-500 hover:text-white"
          >
            View Demo Project
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-5 text-xs text-slate-700"
        >
          No sign-up required · Paste any PRD and get results in seconds
        </motion.p>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-slate-700" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative px-6 pb-32 pt-4">
        <div className="mx-auto max-w-5xl">

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-slate-700"
          >
            How it works
          </motion.p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.13, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
                className={`group relative overflow-hidden rounded-2xl border bg-slate-900/50 p-6 shadow-xl shadow-black/30 backdrop-blur-sm transition-colors duration-300 ${f.border}`}
              >
                <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${f.glow}`} />
                <div className={`relative mb-5 inline-flex rounded-xl p-2.5 ring-1 ${f.ring} bg-slate-950/60`}>
                  <f.icon className={`h-5 w-5 ${f.accent}`} strokeWidth={1.75} />
                </div>
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.2em] ${f.accent} opacity-60`}>
                  {f.label}
                </p>
                <h3 className="mb-2.5 text-[15px] font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-14 flex justify-center"
          >
            <Link
              href="/ghost"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-8 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/50 hover:text-emerald-400"
            >
              See the full Ghost Mode interface
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-slate-800/50 px-8 py-6 text-center text-xs text-slate-700"
      >
        DRIFT — Built with Next.js 14 · Novus.ai · GPT-4o-mini · Supabase · Hackathon 2025
      </motion.footer>
    </div>
  )
}
