'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart2, Clock, Plus } from 'lucide-react'

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
  const scoreBorder = (s: number) =>
    s >= 80 ? 'border-emerald-500/20' : s >= 50 ? 'border-amber-500/20' : 'border-red-500/20'

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Homepage
          </Link>
          <span className="text-slate-700">|</span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-sm font-bold text-transparent">DRIFT</span>
          <span className="text-sm text-slate-500">/ Dashboard</span>
        </div>
        <Link href="/analyze"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 px-3 py-1.5 text-sm text-slate-400 transition-all hover:border-slate-500 hover:text-white">
          <Plus className="h-3.5 w-3.5" /> New Analysis
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Saved Analyses</h1>
          <p className="mb-10 text-slate-400">Click any analysis to explore it in Ghost Mode.</p>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/40" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <BarChart2 className="mx-auto mb-3 h-8 w-8 text-slate-700" />
              <p className="text-sm text-slate-500">No analyses saved yet.</p>
              <Link href="/analyze" className="mt-4 inline-block text-sm text-emerald-500 hover:underline">
                Run your first analysis →
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex items-stretch gap-2"
              >
                <Link href={`/dashboard/${p.id}`}
                  className={`group flex flex-1 items-center justify-between rounded-2xl border bg-slate-900/60 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/60 ${scoreBorder(p.drift_score)}`}>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <span className={`text-3xl font-bold tabular-nums ${scoreColor(p.drift_score)}`}>
                      {p.drift_score}
                    </span>
                    <p className="text-[10px] text-slate-600">drift score</p>
                  </div>
                </Link>
                <Link href={`/report/${p.id}`}
                  className="flex items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 text-xs font-semibold text-slate-500 transition-all hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-violet-400">
                  Report
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
