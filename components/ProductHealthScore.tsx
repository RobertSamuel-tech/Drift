'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Shield } from 'lucide-react'
import type { HealthScore } from '@/lib/health-score'
import {
  healthScoreColor,
  healthScoreLabel,
  healthScoreBg,
  barColor,
} from '@/lib/health-score'

type Variant = 'hero' | 'report' | 'stat'

interface Props {
  variant:    Variant
  projectId?: string  // undefined = global
}

const BREAKDOWN_ROWS = [
  { key: 'recoveryRate'    as const, label: 'Recovery Rate',    weight: '40%' },
  { key: 'alignmentIndex'  as const, label: 'Alignment Index',  weight: '30%' },
  { key: 'featureAdoption' as const, label: 'Feature Adoption', weight: '20%' },
  { key: 'reportActivity'  as const, label: 'Report Activity',  weight: '10%' },
]

// ─── stat variant (GhostMode header) ─────────────────────────────────────────

function StatVariant({ data, loading }: { data: HealthScore | null; loading: boolean }) {
  if (loading || !data) {
    return (
      <div className="flex flex-col items-end gap-0.5 border-l border-slate-700/60 pl-4">
        <span className="font-mono text-lg font-bold tabular-nums leading-none text-slate-700">—</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">HEALTH</span>
      </div>
    )
  }

  const color   = healthScoreColor(data.score)
  const TrendIcon = data.trend === 'improving' ? TrendingUp : TrendingDown

  return (
    <div className="flex flex-col items-end gap-0.5 border-l border-slate-700/60 pl-4">
      <div className="flex items-center gap-1">
        <span className={`font-mono text-lg font-bold tabular-nums leading-none ${color}`}>
          {data.score}
        </span>
        <TrendIcon className={`h-3 w-3 ${color}`} />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">HEALTH</span>
    </div>
  )
}

// ─── breakdown row (used by hero + report variants) ───────────────────────────

function BreakdownRow({
  label,
  value,
  weight,
  delay,
}: {
  label:  string
  value:  number
  weight: string
  delay:  number
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[130px] shrink-0 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <div className="flex-1 h-1 bg-slate-800/80 overflow-hidden">
        <motion.div
          className={`h-full ${barColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-slate-400 w-7 text-right shrink-0">
        {value}
      </span>
      <span className="font-mono text-[9px] text-slate-700 w-6 shrink-0">{weight}</span>
    </div>
  )
}

// ─── hero variant (dashboard) ─────────────────────────────────────────────────

function HeroVariant({ data, loading }: { data: HealthScore | null; loading: boolean }) {
  const TrendIcon = data?.trend === 'improving' ? TrendingUp : TrendingDown
  const scoreVal  = data?.score ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="border border-slate-700/60 bg-slate-900 px-6 py-5"
    >
      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-600" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            Product Health Score
          </span>
        </div>

        {loading || !data ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xl font-black tabular-nums leading-none text-slate-700">—</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 border px-2 py-0.5 ${healthScoreBg(scoreVal)}`}>
              <TrendIcon className={`h-3 w-3 ${healthScoreColor(scoreVal)}`} />
              <span className={`font-mono text-[10px] uppercase tracking-widest ${healthScoreColor(scoreVal)}`}>
                {data.trend === 'improving' ? 'Improving' : 'Declining'}
              </span>
            </div>
            <span className={`font-mono text-3xl font-black tabular-nums leading-none ${healthScoreColor(scoreVal)}`}>
              {data.score}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${healthScoreColor(scoreVal)}`}>
              {healthScoreLabel(scoreVal)}
            </span>
          </div>
        )}
      </div>

      {/* Breakdown bars */}
      {loading || !data ? (
        <div className="space-y-3">
          {BREAKDOWN_ROWS.map(r => (
            <div key={r.key} className="flex items-center gap-3">
              <span className="w-[130px] shrink-0 font-mono text-[10px] uppercase tracking-widest text-slate-700">{r.label}</span>
              <div className="flex-1 h-1 bg-slate-800/80 animate-pulse" />
              <span className="font-mono text-xs tabular-nums text-slate-700 w-7 text-right">—</span>
              <span className="font-mono text-[9px] text-slate-800 w-6">{r.weight}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {BREAKDOWN_ROWS.map((r, i) => (
            <BreakdownRow
              key={r.key}
              label={r.label}
              value={data.breakdown[r.key]}
              weight={r.weight}
              delay={i * 0.08}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── report variant ───────────────────────────────────────────────────────────

function ReportVariant({ data, loading }: { data: HealthScore | null; loading: boolean }) {
  const TrendIcon = data?.trend === 'improving' ? TrendingUp : TrendingDown
  const scoreVal  = data?.score ?? 0

  return (
    <div className="border border-slate-700/60 bg-slate-900 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-slate-600" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
            Product Health Score
          </span>
        </div>

        {!loading && data && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 border px-2 py-0.5 ${healthScoreBg(scoreVal)}`}>
              <TrendIcon className={`h-3 w-3 ${healthScoreColor(scoreVal)}`} />
              <span className={`font-mono text-[10px] uppercase tracking-widest ${healthScoreColor(scoreVal)}`}>
                {data.trend === 'improving' ? 'Improving' : 'Declining'}
              </span>
            </div>
            <span className={`font-mono text-2xl font-black tabular-nums leading-none ${healthScoreColor(scoreVal)}`}>
              {data.score}
            </span>
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${healthScoreColor(scoreVal)}`}>
              {healthScoreLabel(scoreVal)}
            </span>
          </div>
        )}

        {(loading || !data) && (
          <span className="font-mono text-2xl font-black tabular-nums text-slate-700">—</span>
        )}
      </div>

      {/* Breakdown */}
      <div className="px-5 py-4 space-y-3">
        {loading || !data ? (
          BREAKDOWN_ROWS.map(r => (
            <div key={r.key} className="flex items-center gap-3">
              <span className="w-[130px] shrink-0 font-mono text-[10px] uppercase tracking-widest text-slate-700">{r.label}</span>
              <div className="flex-1 h-1 bg-slate-800/80 animate-pulse" />
              <span className="font-mono text-xs tabular-nums text-slate-700 w-7 text-right">—</span>
              <span className="font-mono text-[9px] text-slate-800 w-6">{r.weight}</span>
            </div>
          ))
        ) : (
          BREAKDOWN_ROWS.map((r, i) => (
            <BreakdownRow
              key={r.key}
              label={r.label}
              value={data.breakdown[r.key]}
              weight={r.weight}
              delay={i * 0.08}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── main export ─────────────────────────────────────────────────────────────

export default function ProductHealthScore({ variant, projectId }: Props) {
  const [data, setData]       = useState<HealthScore | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const url = projectId
        ? `/api/health-score?project_id=${encodeURIComponent(projectId)}`
        : '/api/health-score'
      const res = await fetch(url)
      if (res.ok) setData(await res.json())
    } catch {
      // non-blocking
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    if (variant !== 'stat') return
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [projectId, variant]) // eslint-disable-line react-hooks/exhaustive-deps

  if (variant === 'stat')   return <StatVariant   data={data} loading={loading} />
  if (variant === 'hero')   return <HeroVariant   data={data} loading={loading} />
  return                           <ReportVariant data={data} loading={loading} />
}
