'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { aggregateSignals, type NovusLiveSignals } from '@/lib/novus-session'

// ─── Single signal row ────────────────────────────────────────────────────────

function SignalRow({
  label,
  primary,
  secondary,
  color = 'text-white',
}: {
  label:     string
  primary:   string
  secondary?: string
  color?:    string
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-slate-800/50 px-4 py-3 last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-0.5 shrink-0">
        {label}
      </span>
      <div className="text-right min-w-0">
        <p className={`font-mono text-xs font-bold tabular-nums ${color} truncate`}>{primary}</p>
        {secondary && (
          <p className="font-mono text-[10px] text-slate-500 tabular-nums">{secondary}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function NovusAnalyticsPanel() {
  const [signals, setSignals] = useState<NovusLiveSignals | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  const refresh = useCallback(() => {
    setSignals(aggregateSignals())
    setLastRefresh(Date.now())
  }, [])

  // Initial load + poll every 4 seconds for new events fired by user actions
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 4000)
    return () => clearInterval(id)
  }, [refresh])

  // ── Header ─────────────────────────────────────────────────────────────────
  const header = (
    <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-950/80 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-300">
          Novus Live Signals
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-400">
          Live
        </span>
        <button
          onClick={refresh}
          title="Refresh telemetry"
          className="text-slate-600 transition-colors hover:text-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  // ── Loading ────────────────────────────────────────────────────────────────
  if (signals === null) {
    return (
      <div>
        {header}
        <div className="px-4 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Loading telemetry…
          </p>
        </div>
      </div>
    )
  }

  // ── Waiting state ──────────────────────────────────────────────────────────
  if (!signals.hasData) {
    return (
      <div>
        {header}
        <div className="px-4 py-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 leading-relaxed">
            Waiting for Novus telemetry…
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-slate-600">
            Events populate as you interact
          </p>
        </div>
      </div>
    )
  }

  // ── Live data ──────────────────────────────────────────────────────────────
  return (
    <div>
      {header}

      {/* Ranked features */}
      {signals.mostClickedGhostFeature && (
        <SignalRow
          label="Top Ghost Zone"
          primary={signals.mostClickedGhostFeature.name}
          secondary={`${signals.mostClickedGhostFeature.count}× selected`}
          color="text-red-400"
        />
      )}
      {signals.mostCorrectedFeature && (
        <SignalRow
          label="Most Corrected"
          primary={signals.mostCorrectedFeature.name}
          secondary={`${signals.mostCorrectedFeature.count}× corrected`}
          color="text-violet-400"
        />
      )}
      {signals.mostViewedReport && (
        <SignalRow
          label="Top Report"
          primary={signals.mostViewedReport.projectId === 'session' ? 'Session report' : signals.mostViewedReport.projectId.slice(0, 8) + '…'}
          secondary={`${signals.mostViewedReport.count}× viewed`}
          color="text-amber-400"
        />
      )}

      {/* Session counters */}
      <div className="grid grid-cols-3 divide-x divide-slate-800/50 border-t border-slate-800/50">
        <div className="px-2 py-3 text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-emerald-400">
            {signals.totalAnalysesCompleted}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">
            Analyses
          </p>
        </div>
        <div className="px-2 py-3 text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-slate-300">
            {signals.totalGhostSessions}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">
            Ghost Opens
          </p>
        </div>
        <div className="px-2 py-3 text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-slate-300">
            {signals.totalReportsGenerated}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">
            Reports
          </p>
        </div>
      </div>

      {/* Last refresh */}
      <div className="border-t border-slate-800/40 px-4 py-2">
        <p className="font-mono text-[9px] text-slate-600">
          {new Date(lastRefresh).toLocaleTimeString()} · session telemetry
        </p>
      </div>
    </div>
  )
}
