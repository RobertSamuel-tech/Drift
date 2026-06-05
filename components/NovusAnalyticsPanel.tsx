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
    <div className="flex items-start justify-between gap-2 border-b border-slate-800/50 px-4 py-2.5 last:border-0">
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600 mt-0.5 shrink-0">
        {label}
      </span>
      <div className="text-right min-w-0">
        <p className={`font-mono text-xs font-bold tabular-nums ${color} truncate`}>{primary}</p>
        {secondary && (
          <p className="font-mono text-[9px] text-slate-700 tabular-nums">{secondary}</p>
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
    <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-950/80 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
          Novus Live Signals
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-emerald-400">
          Live from Novus
        </span>
        <button
          onClick={refresh}
          title="Refresh telemetry"
          className="text-slate-700 transition-colors hover:text-slate-400"
        >
          <RefreshCw className="h-2.5 w-2.5" />
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
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
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
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600 leading-relaxed">
            Waiting for Novus telemetry…
          </p>
          <p className="mt-1 font-mono text-[8px] text-slate-800">
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
        <div className="px-2 py-2 text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-emerald-400">
            {signals.totalAnalysesCompleted}
          </p>
          <p className="font-mono text-[8px] uppercase tracking-widest text-slate-700 mt-0.5">
            Analyses
          </p>
        </div>
        <div className="px-2 py-2 text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-slate-300">
            {signals.totalGhostSessions}
          </p>
          <p className="font-mono text-[8px] uppercase tracking-widest text-slate-700 mt-0.5">
            Ghost Opens
          </p>
        </div>
        <div className="px-2 py-2 text-center">
          <p className="font-mono text-sm font-bold tabular-nums text-slate-300">
            {signals.totalReportsGenerated}
          </p>
          <p className="font-mono text-[8px] uppercase tracking-widest text-slate-700 mt-0.5">
            Reports
          </p>
        </div>
      </div>

      {/* Data source proof */}
      <div className="border-t border-slate-800/40 px-4 py-1.5">
        <p className="font-mono text-[8px] text-slate-800">
          {new Date(lastRefresh).toLocaleTimeString()} · session telemetry
        </p>
      </div>
    </div>
  )
}
