'use client'

import { motion } from 'framer-motion'
import { Ghost, TrendingUp, AlertTriangle } from 'lucide-react'
import type { RealityMap, RealityFeature } from '@/lib/reality-map'
import { spring } from '@/components/ui/drift-theme'

function featureStatus(f: RealityFeature) {
  if (f.driftType === 'ghost' || f.usageScore === 0)
    return { text: 'text-red-400',     dot: 'bg-red-500',     icon: <Ghost        className="h-3 w-3 shrink-0 text-red-400/60"    />, tag: 'GHOST'     }
  if (f.usageScore >= 60)
    return { text: 'text-emerald-400', dot: 'bg-emerald-500', icon: <TrendingUp   className="h-3 w-3 shrink-0 text-emerald-400/60" />, tag: 'CORE'      }
  if (f.driftType === 'misunderstood')
    return { text: 'text-violet-400',  dot: 'bg-violet-500',  icon: <AlertTriangle className="h-3 w-3 shrink-0 text-violet-400/60" />, tag: 'MISMATCH'  }
  return     { text: 'text-slate-300', dot: 'bg-slate-600',   icon: null,                                                              tag: 'TRACKED'   }
}

function FeatureRow({ f, rank, showBar }: { f: RealityFeature; rank: number; showBar?: boolean }) {
  const { text, dot, icon, tag } = featureStatus(f)
  return (
    <div className="flex items-center gap-3 border-b border-slate-800/40 px-4 py-2.5 last:border-0 hover:bg-slate-800/20 transition-colors">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="w-5 shrink-0 font-mono text-[9px] text-slate-700">#{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <p className={`truncate text-sm font-semibold ${text}`}>{f.name}</p>
        </div>
        {showBar ? (
          <div className="mt-1.5 h-px w-full overflow-hidden bg-slate-800">
            <motion.div
              className="h-full bg-emerald-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${f.usageScore}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        ) : (
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-600">
            {f.priority} priority
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="font-mono text-[10px] tabular-nums text-slate-400">{f.usageScore}/100</span>
        <span className={`font-mono text-[8px] uppercase tracking-widest opacity-50 ${text}`}>{tag}</span>
      </div>
    </div>
  )
}

interface Props {
  data:        RealityMap
  rightPanel?: React.ReactNode
}

export default function ProductRealityMap({ data, rightPanel }: Props) {
  const ghostCount = data.intendedFeatures.filter(f => f.driftType === 'ghost').length

  const colClass = rightPanel
    ? 'grid-cols-1 lg:grid-cols-[1fr_1fr_320px]'
    : 'grid-cols-1 lg:grid-cols-2'

  return (
    <div>
      {/* ── Metrics strip — edge-to-edge, no outer border (card provides it) ── */}
      <div className="grid grid-cols-3 gap-px border-b border-slate-700/60 bg-slate-700/20">
        {([
          {
            label: 'REALITY CONCENTRATION',
            value: `${data.concentrationScore}%`,
            color: data.concentrationScore > 70 ? 'text-red-400' : data.concentrationScore > 50 ? 'text-amber-400' : 'text-emerald-400',
          },
          { label: 'DOMINANT FEATURE', value: data.dominantFeature, color: 'text-white' },
          { label: 'GHOST FEATURES',   value: String(ghostCount),   color: ghostCount > 0 ? 'text-red-400' : 'text-slate-400' },
        ] as const).map(m => (
          <div key={m.label} className="bg-slate-900 px-5 py-3">
            <p className={`font-mono text-xl font-bold tabular-nums leading-none ${m.color}`}>{m.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-600">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Comparison grid ───────────────────────────────────────────────── */}
      <div className={`grid ${colClass} divide-y divide-slate-800/60 lg:divide-x lg:divide-y-0`}>

        {/* Intended Product */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ...spring.panel }}
          className="min-w-0 overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/60 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Intended Product
            </span>
            <span className="ml-auto font-mono text-[9px] text-slate-700">Spec Priority Order</span>
          </div>
          <div>
            {data.intendedFeatures.map((f, i) => (
              <FeatureRow key={f.name} f={f} rank={i + 1} showBar={false} />
            ))}
          </div>
        </motion.div>

        {/* Actual Product */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ...spring.panel }}
          className="min-w-0 overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/60 px-4 py-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Actual Product
            </span>
            <span className="ml-auto font-mono text-[9px] text-slate-700">Novus Usage Order</span>
          </div>
          <div>
            {data.actualFeatures.map((f, i) => (
              <FeatureRow key={f.name} f={f} rank={i + 1} showBar />
            ))}
          </div>
        </motion.div>

        {/* Optional right panel (e.g. Top Risks) */}
        {rightPanel && (
          <div className="min-w-0 overflow-hidden">
            {rightPanel}
          </div>
        )}

      </div>

      {/* ── Reality summary ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, ...spring.panel }}
        className="mx-5 my-4 border-l-2 border-violet-500/50 bg-violet-500/5 px-5 py-4"
      >
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-violet-500/60">
          Reality Summary
        </p>
        <p className="text-sm font-semibold leading-relaxed text-violet-100">{data.realitySummary}</p>
        {data.dominantFeature !== '—' && (
          <p className="mt-1.5 font-mono text-[10px] text-slate-600">
            Features consuming roadmap space show minimal adoption. Product behavior diverges from spec intent.
          </p>
        )}
      </motion.div>
    </div>
  )
}
