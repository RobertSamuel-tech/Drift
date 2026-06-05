'use client'

import { useEffect, useState, useCallback } from 'react'
import { computeRecoveryMetrics, recoveryRateColor, type RecoveryMetrics } from '@/lib/recovery-metrics'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /**
   * 'full'  — large card used in Dashboard and Report (rate + supporting metrics)
   * 'stat'  — compact inline block matching GhostMode header StatBlock style
   */
  variant?: 'full' | 'stat'
}

// ─── Shared poll hook ─────────────────────────────────────────────────────────

function useRecoveryMetrics() {
  const [metrics, setMetrics] = useState<RecoveryMetrics | null>(null)

  const refresh = useCallback(() => setMetrics(computeRecoveryMetrics()), [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 4000)
    return () => clearInterval(id)
  }, [refresh])

  return metrics
}

// ─── Stat variant (Ghost Mode header) ────────────────────────────────────────

function StatVariant() {
  const metrics = useRecoveryMetrics()
  if (!metrics?.hasData) return null

  const color = recoveryRateColor(metrics.recoveryRate)

  return (
    <div
      className="flex flex-col items-end gap-0.5 border-l border-slate-700/60 pl-4"
      title={`${metrics.correctedGhosts} of ${metrics.identifiedGhosts} ghost features corrected`}
    >
      <span className={`font-mono text-lg font-bold tabular-nums leading-none ${color}`}>
        {metrics.recoveryRate}%
      </span>
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
        Recovery Rate
      </span>
    </div>
  )
}

// ─── Full variant (Dashboard + Report) ───────────────────────────────────────

function FullVariant() {
  const metrics = useRecoveryMetrics()

  // Loading
  if (metrics === null) return null

  // Waiting — no ghost interactions yet
  if (!metrics.hasData) {
    return (
      <div className="border border-slate-700/60 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
            Drift Recovery Rate
          </span>
          <span className="rounded-sm border border-slate-700/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-slate-600">
            Live from Novus
          </span>
        </div>
        <div className="px-5 py-5 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
            Waiting for recovery telemetry…
          </p>
          <p className="mt-1 font-mono text-[9px] text-slate-800">
            Select a ghost feature and apply an AI correction to begin tracking
          </p>
        </div>
      </div>
    )
  }

  const color = recoveryRateColor(metrics.recoveryRate)

  return (
    <div className="border border-slate-700/60 bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
          Drift Recovery Rate
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-slate-600">
            corrected / identified × 100
          </span>
          <span className="flex items-center gap-1 rounded-sm border border-emerald-500/30 bg-emerald-500/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-emerald-400">
            <span className="relative flex h-1 w-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-400" />
            </span>
            Live from Novus
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-0 divide-x divide-slate-800/60">
        {/* Rate — dominant left */}
        <div className="flex flex-col items-center justify-center px-10 py-6">
          <span className={`font-mono text-6xl font-black tabular-nums leading-none ${color}`}>
            {metrics.recoveryRate}%
          </span>
          <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Recovery Rate
          </span>
        </div>

        {/* Supporting metrics — right */}
        <div className="grid grid-cols-3 divide-x divide-slate-800/60">
          <div className="flex flex-col items-center justify-center px-6 py-6">
            <span className="font-mono text-3xl font-bold tabular-nums leading-none text-red-400">
              {metrics.identifiedGhosts}
            </span>
            <span className="mt-2 font-mono text-[9px] uppercase tracking-widest text-slate-600 text-center leading-tight">
              Ghost Features<br />Identified
            </span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-6">
            <span className={`font-mono text-3xl font-bold tabular-nums leading-none ${color}`}>
              {metrics.correctedGhosts}
            </span>
            <span className="mt-2 font-mono text-[9px] uppercase tracking-widest text-slate-600 text-center leading-tight">
              Ghost Features<br />Corrected
            </span>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-6">
            <span className="font-mono text-3xl font-bold tabular-nums leading-none text-slate-400">
              {metrics.identifiedGhosts - metrics.correctedGhosts}
            </span>
            <span className="mt-2 font-mono text-[9px] uppercase tracking-widest text-slate-600 text-center leading-tight">
              Still Drifting
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function DriftRecoveryRate({ variant = 'full' }: Props) {
  return variant === 'stat' ? <StatVariant /> : <FullVariant />
}
