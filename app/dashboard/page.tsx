'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, FileText, AlertTriangle, Clock } from 'lucide-react'

interface ProjectRow {
  id: string
  name: string
  drift_score: number
  spec_source: string
  created_at: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setProjects(d.projects) })
      .catch(() => setError('Could not load analyses'))
      .finally(() => setLoading(false))
  }, [])

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400'

  const scoreAccent = (s: number) =>
    s >= 80 ? 'border-l-2 border-emerald-500' : s >= 50 ? 'border-l-2 border-amber-500' : 'border-l-2 border-red-500'

  const scoreLabel = (s: number) =>
    s >= 80 ? 'HEALTHY' : s >= 50 ? 'DRIFTING' : 'CRITICAL'

  const scoreLabelColor = (s: number) =>
    s >= 80 ? 'text-emerald-500/60' : s >= 50 ? 'text-amber-500/60' : 'text-red-500/60'

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* ── Command bar ────────────────────────────────────────────────────── */}
      <header className="flex h-12 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-6">
        <div className="flex items-center gap-4">
          <Link href="/"
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-300">
            <ArrowLeft className="h-3 w-3" /> HOME
          </Link>
          <span className="h-3 w-px bg-slate-700" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            DRIFT
          </span>
          <span className="text-slate-700">/</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Analysis Archive
          </span>
        </div>
        <Link href="/analyze"
          className="flex items-center gap-1.5 border border-slate-700/60 bg-slate-800/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400">
          <Plus className="h-3 w-3" /> NEW ANALYSIS
        </Link>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-4">

        {/* ── Section header ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-white">
              Analysis Archive
            </h1>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
              Saved drift analyses — click any record to open Ghost Mode
            </p>
          </div>
          {projects.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
              {projects.length} record{projects.length !== 1 ? 's' : ''}
            </span>
          )}
        </motion.div>

        {/* ── Table header ──────────────────────────────────────────────────── */}
        {!loading && !error && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="border border-slate-700/60 bg-slate-900"
          >
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_80px_80px_100px_120px_80px] items-center gap-4 border-b border-slate-800/60 px-4 py-2">
              {['PRODUCT', 'SCORE', 'STATUS', 'GHOST', 'ANALYZED', 'ACTIONS'].map(col => (
                <span key={col} className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-800/40">
              {projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className={`grid grid-cols-[1fr_80px_80px_100px_120px_80px] items-center gap-4 px-0 py-0 ${scoreAccent(p.drift_score)} hover:bg-slate-800/30 transition-colors`}
                >
                  {/* Project name */}
                  <Link href={`/dashboard/${p.id}`} className="flex items-center gap-3 px-4 py-3 group">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    <span className="truncate font-sans text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {p.name}
                    </span>
                  </Link>

                  {/* Drift score */}
                  <Link href={`/dashboard/${p.id}`} className="py-3">
                    <span className={`font-mono text-xl font-black tabular-nums leading-none ${scoreColor(p.drift_score)}`}>
                      {p.drift_score}
                    </span>
                  </Link>

                  {/* Status label */}
                  <Link href={`/dashboard/${p.id}`} className="py-3">
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${scoreLabelColor(p.drift_score)}`}>
                      {scoreLabel(p.drift_score)}
                    </span>
                  </Link>

                  {/* Ghost count placeholder */}
                  <div className="py-3">
                    <span className="font-mono text-xs text-slate-600">—</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 py-3">
                    <Clock className="h-3 w-3 shrink-0 text-slate-700" />
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 py-3 pr-4">
                    <Link href={`/dashboard/${p.id}`}
                      className="border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/8 hover:text-emerald-400">
                      Ghost
                    </Link>
                    <Link href={`/report/${p.id}`}
                      className="border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400 transition-all hover:border-violet-500/50 hover:bg-violet-500/8 hover:text-violet-400">
                      Report
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="border border-slate-700/60 bg-slate-900 divide-y divide-slate-800/40">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 animate-pulse bg-slate-800/20 px-4" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500/60" />
            <span className="font-mono text-xs text-red-400">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center"
          >
            <FileText className="mx-auto mb-3 h-6 w-6 text-slate-700" />
            <p className="font-mono text-xs uppercase tracking-widest text-slate-600">No analyses on record</p>
            <Link href="/analyze"
              className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-emerald-500 transition-colors hover:text-emerald-400">
              Initialize first analysis →
            </Link>
          </motion.div>
        )}

      </main>
    </div>
  )
}
