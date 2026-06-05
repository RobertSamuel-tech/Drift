'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Ghost, AlertTriangle, Clock, BarChart2, TrendingDown, Activity, ArrowRight, Trash2 } from 'lucide-react'

interface ProjectRow {
  id: string
  name: string
  drift_score: number
  spec_source: string
  created_at: string
}

function scoreColor(s: number)      { return s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400' }
function scoreBg(s: number)         { return s >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : s >= 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30' }
function scoreAccentL(s: number)    { return s >= 80 ? 'border-l-4 border-emerald-500' : s >= 50 ? 'border-l-4 border-amber-500' : 'border-l-4 border-red-500' }
function scoreLabel(s: number)      { return s >= 80 ? 'HEALTHY' : s >= 50 ? 'DRIFTING' : 'CRITICAL' }
function scoreLabelColor(s: number) { return s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400' }

// ─── Hero metric tile ─────────────────────────────────────────────────────────
function MetricTile({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-white',
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="border border-slate-700/60 bg-slate-900 px-6 py-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <p className={`font-mono text-4xl font-black tabular-nums leading-none ${color}`}>{value}</p>
      {sub && <p className="mt-1.5 font-mono text-xs text-slate-600">{sub}</p>}
    </motion.div>
  )
}

// ─── Analysis command card ─────────────────────────────────────────────────────
function AnalysisCard({ p, index, onDelete }: { p: ProjectRow; index: number; onDelete: (id: string) => void }) {
  const [removing, setRemoving] = useState(false)

  const date = new Date(p.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  async function handleRemove() {
    if (!confirm(`Remove "${p.name}"? This cannot be undone.`)) return
    setRemoving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id }),
      })
      if (res.ok) {
        if (typeof pendo !== 'undefined') {
          pendo.track('project_deleted', {
            projectId: p.id,
            projectName: p.name,
            driftScore: p.drift_score,
            specSource: p.spec_source,
          })
        }
        onDelete(p.id)
      }
    } finally {
      setRemoving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.06, duration: 0.35 }}
      className={`border bg-slate-900 ${scoreAccentL(p.drift_score)} flex flex-col`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div className="min-w-0 flex-1">
          <span className={`font-mono text-xs font-bold uppercase tracking-widest ${scoreLabelColor(p.drift_score)}`}>
            {scoreLabel(p.drift_score)}
          </span>
          <h2 className="mt-1 truncate text-xl font-bold text-white">{p.name}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-widest ${scoreBg(p.drift_score)} ${scoreLabelColor(p.drift_score)}`}>
            {scoreLabel(p.drift_score)}
          </div>
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Remove analysis"
            className="flex items-center justify-center border border-slate-700/60 bg-slate-800/60 p-1.5 text-slate-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Score — big and dominant */}
      <div className="border-y border-slate-800/60 px-6 py-6 text-center">
        <p className={`font-mono text-7xl font-black tabular-nums leading-none ${scoreColor(p.drift_score)}`}>
          {p.drift_score}
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-500">DRIFT SCORE</p>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-3 divide-x divide-slate-800/60 border-b border-slate-800/60">
        <div className="px-4 py-3 text-center">
          <p className="font-mono text-lg font-bold text-slate-400">—</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Ghost Features</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="font-mono text-lg font-bold text-slate-400">—</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Est. Waste</p>
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-600" />
            <p className="font-mono text-[10px] text-slate-500">{date}</p>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600 mt-0.5">Analyzed</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 divide-x divide-slate-800/60 border-t border-slate-800/60">
        <Link
          href={`/ghost/${p.id}`}
          className="flex items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-widest text-slate-400 transition-all hover:bg-emerald-500/8 hover:text-emerald-400"
        >
          <Ghost className="h-3.5 w-3.5" />
          Ghost Mode
        </Link>
        <Link
          href={`/report/${p.id}`}
          className="flex items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-widest text-slate-400 transition-all hover:bg-violet-500/8 hover:text-violet-400"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Open Report
        </Link>
      </div>
    </motion.div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

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

  // Derived metrics — all from real data
  const total    = projects.length
  const avgScore = total > 0 ? Math.round(projects.reduce((s, p) => s + p.drift_score, 0) / total) : 0
  const critical = projects.filter(p => p.drift_score < 50).length
  const healthy  = projects.filter(p => p.drift_score >= 80).length

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* ── Command bar ──────────────────────────────────────────────────── */}
      <header className="flex h-12 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-8">
        <div className="flex items-center gap-4">
          <Link href="/"
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-300">
            <ArrowLeft className="h-3 w-3" /> HOME
          </Link>
          <span className="h-3 w-px bg-slate-700" />
          <span className="font-mono text-[10px] font-bold text-[#FF8A1F] tracking-widest">DRIFT</span>
          <span className="text-slate-700">/</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Analysis Archive</span>
        </div>
        <Link href="/analyze"
          className="flex items-center gap-1.5 border border-slate-700/60 bg-slate-800/60 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-slate-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400">
          <Plus className="h-3 w-3" /> New Analysis
        </Link>
      </header>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-700/60 bg-slate-900 px-8 py-10">
        <div className="mx-auto max-w-screen-2xl">

          {/* Title row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8 flex items-end justify-between"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Product Intelligence Command Center
              </p>
              <h1 className="mt-1 font-mono text-4xl font-bold uppercase tracking-wide text-white">
                Analysis Archive
              </h1>
              <p className="mt-2 text-base text-slate-400">
                Review previous drift investigations and reopen any report.
              </p>
            </div>
            <Link href="/analyze"
              className="flex items-center gap-2 bg-emerald-500 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-emerald-400">
              Initialize New Analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Metric tiles — 4 across */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricTile
              icon={Activity}
              label="Total Analyses"
              value={loading ? '—' : String(total)}
              sub={total === 1 ? '1 investigation' : `${total} investigations`}
              color="text-white"
              delay={0.1}
            />
            <MetricTile
              icon={BarChart2}
              label="Average Drift Score"
              value={loading || total === 0 ? '—' : String(avgScore)}
              sub={!loading && total > 0 ? (avgScore >= 80 ? 'Fleet healthy' : avgScore >= 50 ? 'Some drift detected' : 'Critical alignment issues') : 'No data yet'}
              color={total > 0 ? scoreColor(avgScore) : 'text-slate-400'}
              delay={0.15}
            />
            <MetricTile
              icon={TrendingDown}
              label="Critical Projects"
              value={loading ? '—' : String(critical)}
              sub={critical === 0 ? 'None critical' : `Score below 50`}
              color={critical > 0 ? 'text-red-400' : 'text-slate-400'}
              delay={0.2}
            />
            <MetricTile
              icon={Ghost}
              label="Healthy Projects"
              value={loading ? '—' : String(healthy)}
              sub={healthy === 0 ? 'None healthy' : `Score above 80`}
              color={healthy > 0 ? 'text-emerald-400' : 'text-slate-400'}
              delay={0.25}
            />
          </div>

        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-screen-2xl px-8 py-6">

        {/* Status strip */}
        {!loading && !error && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mb-5 flex items-center justify-between border-b border-slate-800/60 pb-4"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
              {total} Investigation{total !== 1 ? 's' : ''} on Record
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-700">
              Sorted by date
            </span>
          </motion.div>
        )}

        {/* ── Analysis cards grid ──────────────────────────────────────── */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <AnalysisCard key={p.id} p={p} index={i} onDelete={id => setProjects(prev => prev.filter(x => x.id !== id))} />
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 animate-pulse border border-slate-800/60 bg-slate-900/40" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 border border-red-500/20 bg-red-500/5 px-5 py-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500/60" />
            <span className="font-mono text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-900/40 py-24 text-center"
          >
            <BarChart2 className="mb-4 h-10 w-10 text-slate-700" />
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-slate-400">
              No analyses on record
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Run your first analysis to begin tracking product drift.
            </p>
            <Link href="/analyze"
              className="mt-6 flex items-center gap-2 bg-emerald-500 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-emerald-400">
              Initialize First Analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

      </main>
    </div>
  )
}
