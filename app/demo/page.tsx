'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, RefreshCw, RotateCcw, Activity, Ghost,
  TrendingUp, TrendingDown, Shield, Zap, Database, Cpu,
} from 'lucide-react'
import { aggregateSignals, getEvents, clearEvents } from '@/lib/novus-session'
import type { NovusLiveSignals, TelemetryEvent } from '@/lib/novus-session'
import { healthScoreColor, healthScoreLabel, barColor } from '@/lib/health-score'
import { recoveryRateColor } from '@/lib/recovery-metrics'
import type { HealthScore } from '@/lib/health-score'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbMetrics {
  identifiedGhosts: number
  correctedGhosts:  number
  recoveryRate:     number
  hasData:          boolean
  health:           HealthScore | null
}

interface SessionMetrics {
  totalAnalyses:    number
  ghostSessions:    number
  reportsGenerated: number
  novusEventCount:  number
  signals:          NovusLiveSignals | null
  recentEvents:     TelemetryEvent[]
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ type }: { type: 'db' | 'session' }) {
  return type === 'db' ? (
    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-slate-700">
      <Database className="h-2.5 w-2.5" /> Supabase
    </span>
  ) : (
    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-slate-700">
      <Cpu className="h-2.5 w-2.5" /> Session
    </span>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  color = 'text-white',
  source,
  icon: Icon,
  delay = 0,
}: {
  label:  string
  value:  string
  sub?:   string
  color?: string
  source: 'db' | 'session'
  icon:   React.ElementType
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="border border-slate-700/60 bg-slate-900 px-6 py-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          <SourceBadge type={source} />
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
      </div>
      <p className={`font-mono text-4xl font-black tabular-nums leading-none ${color}`}>{value}</p>
      {sub && <p className="font-mono text-[10px] text-slate-600">{sub}</p>}
    </motion.div>
  )
}

// ─── Breakdown bar ────────────────────────────────────────────────────────────

function BreakdownRow({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[130px] shrink-0 font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <div className="flex-1 h-1 bg-slate-800 overflow-hidden">
        <motion.div
          className={`h-full ${barColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-slate-400 w-7 text-right">{value}</span>
      <span className="font-mono text-[9px] text-slate-700 w-6">{weight}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DemoMetricsPage() {
  const [db, setDb]           = useState<DbMetrics | null>(null)
  const [sess, setSess]       = useState<SessionMetrics | null>(null)
  const [dbLoading, setDbLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [resetFlash, setResetFlash]   = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch DB-backed metrics ────────────────────────────────────────────────
  const loadDb = useCallback(async () => {
    try {
      const [recRes, hRes] = await Promise.all([
        fetch('/api/recovery'),
        fetch('/api/health-score'),
      ])
      const rec = recRes.ok ? await recRes.json() : null
      const h   = hRes.ok  ? await hRes.json()   : null

      setDb({
        identifiedGhosts: rec?.identifiedGhosts ?? 0,
        correctedGhosts:  rec?.correctedGhosts  ?? 0,
        recoveryRate:     rec?.recoveryRate      ?? 0,
        hasData:          rec?.hasData           ?? false,
        health:           h ?? null,
      })
    } catch { /* non-blocking */ } finally {
      setDbLoading(false)
    }
  }, [])

  // ── Read session metrics ──────────────────────────────────────────────────
  const loadSession = useCallback(() => {
    const signals = aggregateSignals()
    const events  = getEvents()
    setSess({
      totalAnalyses:    signals.totalAnalysesCompleted,
      ghostSessions:    signals.totalGhostSessions,
      reportsGenerated: signals.totalReportsGenerated,
      novusEventCount:  events.length,
      signals,
      recentEvents:     events.slice(-10).reverse(),
    })
    setLastRefresh(Date.now())
  }, [])

  // ── Initial load + polling ─────────────────────────────────────────────────
  useEffect(() => {
    loadDb()
    loadSession()
    const t = setInterval(loadSession, 4000)
    return () => clearInterval(t)
  }, [loadDb, loadSession])

  // ── Reset handler ──────────────────────────────────────────────────────────
  function handleReset() {
    if (!confirm('Clear this demo session telemetry? Supabase data is not affected.')) return
    clearEvents()
    loadSession()
    if (flashTimer.current) clearTimeout(flashTimer.current)
    setResetFlash(true)
    flashTimer.current = setTimeout(() => setResetFlash(false), 2500)
  }

  const loading = dbLoading || !sess

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* ── Command bar ───────────────────────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b border-slate-700/60 bg-slate-900 px-8">
        <div className="flex items-center gap-5">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-300">
            <ArrowLeft className="h-3.5 w-3.5" /> Archive
          </Link>
          <span className="h-4 w-px bg-slate-700" />
          <span className="font-mono text-sm font-bold text-[#FF8A1F] tracking-widest">DRIFT</span>
          <span className="text-slate-700">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Demo Metrics</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-slate-700">
            Updated {new Date(lastRefresh).toLocaleTimeString()}
          </span>
          <button
            onClick={loadSession}
            title="Refresh session metrics"
            className="text-slate-600 transition-colors hover:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 border border-red-500/30 bg-red-500/8 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/15"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Session
          </button>
        </div>
      </header>

      {/* ── Reset flash ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {resetFlash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 border-b border-emerald-500/30 bg-emerald-500/8 px-8 py-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              Session telemetry cleared — Supabase data unchanged
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-screen-xl px-8 py-8 space-y-6">

        {/* ── Source legend ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 border-b border-slate-800/60 pb-4">
          <p className="font-mono text-xs text-slate-600">Data sources:</p>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <Database className="h-3 w-3" /> Supabase — persisted across sessions
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <Cpu className="h-3 w-3" /> Session — current browser tab only
          </span>
        </div>

        {/* ── Six metric cards ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse border border-slate-800/60 bg-slate-900/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <MetricCard
              label="Total Analyses"
              value={String(sess!.totalAnalyses)}
              sub={sess!.totalAnalyses === 1 ? '1 analysis run' : `${sess!.totalAnalyses} analysis runs`}
              color={sess!.totalAnalyses > 0 ? 'text-white' : 'text-slate-600'}
              source="session"
              icon={Activity}
              delay={0.05}
            />
            <MetricCard
              label="Ghost Features Identified"
              value={String(db!.identifiedGhosts)}
              sub={db!.hasData ? `${db!.correctedGhosts} corrected so far` : 'No ghost interactions yet'}
              color={db!.identifiedGhosts > 0 ? 'text-red-400' : 'text-slate-600'}
              source="db"
              icon={Ghost}
              delay={0.1}
            />
            <MetricCard
              label="Corrections Generated"
              value={String(db!.correctedGhosts)}
              sub={db!.identifiedGhosts > 0
                ? `${db!.identifiedGhosts - db!.correctedGhosts} still uncorrected`
                : 'Apply corrections in Ghost Mode'}
              color={db!.correctedGhosts > 0 ? 'text-violet-400' : 'text-slate-600'}
              source="db"
              icon={Zap}
              delay={0.15}
            />
            <MetricCard
              label="Recovery Rate"
              value={db!.hasData ? `${db!.recoveryRate}%` : '—'}
              sub={db!.hasData
                ? `${db!.correctedGhosts} / ${db!.identifiedGhosts} ghost features corrected`
                : 'Interact with ghost zones to begin'}
              color={db!.hasData ? recoveryRateColor(db!.recoveryRate) : 'text-slate-600'}
              source="db"
              icon={TrendingUp}
              delay={0.2}
            />
            <MetricCard
              label="Product Health Score"
              value={db!.health ? String(db!.health.score) : '—'}
              sub={db!.health
                ? `${healthScoreLabel(db!.health.score)} · ${db!.health.trend === 'improving' ? '↑ Improving' : '↓ Declining'}`
                : 'Run an analysis to generate'}
              color={db!.health ? healthScoreColor(db!.health.score) : 'text-slate-600'}
              source="db"
              icon={Shield}
              delay={0.25}
            />
            <MetricCard
              label="Novus Events Captured"
              value={String(sess!.novusEventCount)}
              sub={sess!.novusEventCount > 0
                ? `across ${Object.keys(
                    sess!.recentEvents.reduce<Record<string, true>>((a, e) => { a[e.event] = true; return a }, {})
                  ).length} event types`
                : 'Events fire on every interaction'}
              color={sess!.novusEventCount > 0 ? 'text-emerald-400' : 'text-slate-600'}
              source="session"
              icon={Activity}
              delay={0.3}
            />
          </div>
        )}

        {/* ── Health Score breakdown ───────────────────────────────────────── */}
        {db?.health && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="border border-slate-700/60 bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-slate-600" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
                  Health Score Breakdown
                </span>
              </div>
              <div className="flex items-center gap-3">
                <SourceBadge type="db" />
                <span className={`font-mono text-lg font-black tabular-nums ${healthScoreColor(db.health.score)}`}>
                  {db.health.score}
                </span>
                <span className={`flex items-center gap-1 font-mono text-xs ${healthScoreColor(db.health.score)}`}>
                  {db.health.trend === 'improving'
                    ? <><TrendingUp className="h-3 w-3" /> Improving</>
                    : <><TrendingDown className="h-3 w-3" /> Declining</>}
                </span>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <BreakdownRow label="Recovery Rate"    value={db.health.breakdown.recoveryRate}    weight="40%" />
              <BreakdownRow label="Alignment Index"  value={db.health.breakdown.alignmentIndex}  weight="30%" />
              <BreakdownRow label="Feature Adoption" value={db.health.breakdown.featureAdoption} weight="20%" />
              <BreakdownRow label="Report Activity"  value={db.health.breakdown.reportActivity}  weight="10%" />
            </div>
          </motion.div>
        )}

        {/* ── Session signal highlights ────────────────────────────────────── */}
        {sess?.signals?.hasData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="border border-slate-700/60 bg-slate-900"
          >
            <div className="flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
              <Cpu className="h-3.5 w-3.5 text-slate-600" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
                Session Signal Highlights
              </span>
              <SourceBadge type="session" />
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-800/50 md:grid-cols-4">
              {[
                { label: 'Analyses', value: sess.signals.totalAnalysesCompleted, color: 'text-white' },
                { label: 'Ghost Opens', value: sess.signals.totalGhostSessions, color: 'text-emerald-400' },
                { label: 'Reports', value: sess.signals.totalReportsGenerated, color: 'text-violet-400' },
                { label: 'Events', value: sess.novusEventCount, color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-4 py-4 text-center">
                  <p className={`font-mono text-2xl font-black tabular-nums ${color}`}>{value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            {(sess.signals.mostClickedGhostFeature || sess.signals.mostCorrectedFeature) && (
              <div className="grid grid-cols-1 divide-y divide-slate-800/50 border-t border-slate-800/50 md:grid-cols-2 md:divide-x md:divide-y-0">
                {sess.signals.mostClickedGhostFeature && (
                  <div className="px-5 py-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Top Ghost Zone</span>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-red-400">{sess.signals.mostClickedGhostFeature.name}</p>
                      <p className="font-mono text-[10px] text-slate-600">{sess.signals.mostClickedGhostFeature.count}× selected</p>
                    </div>
                  </div>
                )}
                {sess.signals.mostCorrectedFeature && (
                  <div className="px-5 py-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Most Corrected</span>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-violet-400">{sess.signals.mostCorrectedFeature.name}</p>
                      <p className="font-mono text-[10px] text-slate-600">{sess.signals.mostCorrectedFeature.count}× corrected</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Recent events log ────────────────────────────────────────────── */}
        {sess && sess.recentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            className="border border-slate-700/60 bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
                  Recent Novus Events
                </span>
                <SourceBadge type="session" />
              </div>
              <span className="font-mono text-[10px] text-slate-700">
                Last {sess.recentEvents.length} of {sess.novusEventCount}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="px-5 py-2 text-left font-mono text-[9px] uppercase tracking-widest text-slate-700">Time</th>
                    <th className="px-5 py-2 text-left font-mono text-[9px] uppercase tracking-widest text-slate-700">Event</th>
                    <th className="px-5 py-2 text-left font-mono text-[9px] uppercase tracking-widest text-slate-700">Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {sess.recentEvents.map((e, i) => (
                    <tr key={i} className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/20">
                      <td className="px-5 py-2.5 font-mono text-[10px] text-slate-700 whitespace-nowrap">
                        {new Date(e.ts).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-2.5 font-mono text-xs text-emerald-400 whitespace-nowrap">
                        {e.event}
                      </td>
                      <td className="px-5 py-2.5 font-mono text-[10px] text-slate-500 max-w-sm truncate">
                        {Object.keys(e.properties).length > 0
                          ? JSON.stringify(e.properties)
                          : <span className="text-slate-700">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {sess && sess.novusEventCount === 0 && !db?.hasData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-900/40 py-20 text-center"
          >
            <Activity className="mb-4 h-10 w-10 text-slate-700" />
            <p className="font-mono text-sm font-bold uppercase tracking-widest text-slate-400">
              No telemetry yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Interact with Ghost Mode, run an analysis, or open a report to generate real events.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/ghost"
                className="flex items-center gap-2 border border-slate-700/60 bg-slate-800/60 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-slate-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400">
                <Ghost className="h-3.5 w-3.5" /> Open Demo Ghost Mode
              </Link>
              <Link href="/analyze"
                className="flex items-center gap-2 bg-emerald-500 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-emerald-400">
                Run Analysis
              </Link>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  )
}
