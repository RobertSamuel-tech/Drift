'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Wrench, Trash2, ArrowRight, ArrowDown } from 'lucide-react'
import type { RoadmapReallocationResult, RoadmapAction } from '@/lib/roadmap-reallocation'
import type { DriftZone } from '@/lib/database.types'
import { formatCost } from '@/lib/cost-analysis'

// ─── types ────────────────────────────────────────────────────────────────────

type ActionType = 'invest' | 'improve' | 'remove'

const ACTION_CONFIG: Record<ActionType, {
  label:       string
  icon:        React.ElementType
  border:      string
  bg:          string
  text:        string
  badgeBg:     string
  barColor:    string
}> = {
  invest: {
    label: 'Invest',
    icon:  TrendingUp,
    border:   'border-emerald-500/30',
    bg:       'bg-emerald-500/5',
    text:     'text-emerald-400',
    badgeBg:  'bg-emerald-500/15',
    barColor: 'bg-emerald-500',
  },
  improve: {
    label: 'Improve',
    icon:  Wrench,
    border:   'border-amber-500/30',
    bg:       'bg-amber-500/5',
    text:     'text-amber-400',
    badgeBg:  'bg-amber-500/15',
    barColor: 'bg-amber-500',
  },
  remove: {
    label: 'Remove',
    icon:  Trash2,
    border:   'border-red-500/30',
    bg:       'bg-red-500/5',
    text:     'text-red-400',
    badgeBg:  'bg-red-500/15',
    barColor: 'bg-red-500',
  },
}

const PRIORITY_BADGE: Record<string, string> = {
  high:   'bg-red-500/15 text-red-400',
  medium: 'bg-blue-500/15 text-blue-400',
  low:    'bg-slate-700/50 text-slate-400',
}

// ─── sub-components ───────────────────────────────────────────────────────────

function EvidenceCard({
  action,
  type,
  index,
}: {
  action: RoadmapAction
  type:   ActionType
  index:  number
}) {
  const cfg  = ACTION_CONFIG[type]
  const Icon = cfg.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.08, duration: 0.35, ease: 'easeOut' }}
      className={`rounded-xl border p-4 ${cfg.border} ${cfg.bg}`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.text}`} />
          <p className="text-sm font-bold text-white">{action.featureName}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${cfg.badgeBg} ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mb-2.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Confidence</span>
          <span className={`text-[10px] font-black tabular-nums ${cfg.text}`}>{action.confidence}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className={`h-full rounded-full ${cfg.barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${action.confidence}%` }}
            transition={{ delay: 0.6 + index * 0.08, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="mb-1.5 text-[11px] leading-relaxed text-slate-400">{action.reason}</p>
      <p className="text-[10px] leading-relaxed text-slate-600">{action.evidence}</p>
    </motion.div>
  )
}

// ─── props ────────────────────────────────────────────────────────────────────

interface Props {
  data:           RoadmapReallocationResult
  driftZones:     DriftZone[]
  estimatedWaste: number
  wastedSprints:  number
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

export default function RoadmapReallocation({
  data,
  driftZones,
  estimatedWaste,
  wastedSprints,
}: Props) {
  // Current direction: zones sorted by intended_priority
  const currentDir = [...driftZones].sort(
    (a, b) => (PRIORITY_RANK[a.intended_priority] ?? 3) - (PRIORITY_RANK[b.intended_priority] ?? 3)
  )

  // Recommended direction: invest → improve → remove
  const recommended: { action: RoadmapAction; type: ActionType }[] = [
    ...data.invest.map  (a => ({ action: a, type: 'invest'  as ActionType })),
    ...data.improve.map (a => ({ action: a, type: 'improve' as ActionType })),
    ...data.remove.map  (a => ({ action: a, type: 'remove'  as ActionType })),
  ]

  const isEmpty = recommended.length === 0

  return (
    <div>
      {/* AI rationale */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5"
      >
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Analysis</p>
        <p className="text-sm font-semibold leading-relaxed text-slate-200">{data.summary}</p>
      </motion.div>

      {/* Two-column comparison */}
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start">

        {/* Left — Current Direction */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5"
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Current Direction</p>
          <p className="mb-4 text-sm font-bold text-slate-300">Where sprint effort is going</p>
          <div className="space-y-2">
            {currentDir.map((z, i) => (
              <div
                key={z.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-[10px] font-bold text-slate-700">#{i + 1}</span>
                  <p className="truncate text-xs font-semibold text-slate-300">{z.feature_name}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${PRIORITY_BADGE[z.intended_priority] ?? ''}`}>
                  {z.intended_priority}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Center arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex items-center justify-center py-2 md:flex-col md:justify-start md:pt-14"
        >
          <ArrowRight className="hidden h-6 w-6 text-slate-700 md:block" />
          <ArrowDown  className="h-6 w-6 text-slate-700 md:hidden" />
          <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-widest text-slate-700 md:block text-center">
            Realloc-<br />ation
          </p>
        </motion.div>

        {/* Right — Recommended Direction */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5"
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Recommended Direction</p>
          <p className="mb-4 text-sm font-bold text-slate-300">Where sprint effort should go</p>
          {isEmpty ? (
            <p className="text-sm text-slate-500">Roadmap appears well-aligned with usage data.</p>
          ) : (
            <div className="space-y-2">
              {recommended.map(({ action, type }, i) => {
                const cfg  = ACTION_CONFIG[type]
                const Icon = cfg.icon
                return (
                  <div
                    key={action.featureName}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${cfg.border} ${cfg.bg}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[10px] font-bold text-slate-700">#{i + 1}</span>
                      <p className={`truncate text-xs font-semibold ${cfg.text}`}>{action.featureName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Icon className={`h-3 w-3 ${cfg.text}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Evidence cards */}
      {!isEmpty && (
        <div className="mt-8 space-y-3">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Evidence</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recommended.map(({ action, type }, i) => (
              <EvidenceCard key={action.featureName} action={action} type={type} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Executive Outcome Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mt-8 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6"
      >
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Projected Roadmap Shift
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-black tabular-nums text-red-400">{data.remove.length}</p>
            <p className="mt-0.5 text-[10px] text-slate-600">Ghost Features Reduced</p>
          </div>
          <div>
            <p className="text-2xl font-black tabular-nums text-emerald-400">{data.invest.length}</p>
            <p className="mt-0.5 text-[10px] text-slate-600">Core Features Expanded</p>
          </div>
          <div>
            <p className="text-2xl font-black tabular-nums text-amber-400">
              {wastedSprints > 0 ? wastedSprints : '—'}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-600">Sprints Recovered</p>
          </div>
          <div>
            <p className="text-2xl font-black tabular-nums text-red-400">
              {estimatedWaste > 0 ? formatCost(estimatedWaste) : '$0'}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-600">Estimated Waste Reduced</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
