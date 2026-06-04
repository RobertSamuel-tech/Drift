'use client'

import { motion } from 'framer-motion'
import { Ghost, TrendingUp, AlertTriangle, ArrowRight, ArrowDown } from 'lucide-react'
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

interface Props { data: RealityMap }

export default function ProductRealityMap({ data }: Props) {
  const ghostCount = data.intendedFeatures.filter(f => f.driftType === 'ghost').length

  return (
    <div>
      {/* ── Metrics strip ────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-px border border-slate-700/60 bg-slate-700/20">
        {([
          {
            label: 'REALITY CONCENTRATION',
            value: `${data.concentrationScore}%`,
            color: data.concentrationScore > 70 ? 'text-red-400' : data.concentrationScore > 50 ? 'text-amber-400' : 'text-emerald-400',
          },
          { label: 'DOMINANT FEATURE',    value: data.dominantFeature, color: 'text-white' },
          { label: 'GHOST FEATURES',      value: String(ghostCount),   color: ghostCount > 0 ? 'text-red-400' : 'text-slate-400' },
        ] as const).map(m => (
          <div key={m.label} className="bg-slate-900 px-4 py-3">
            <p className={`font-mono text-xl font-bold tabular-nums leading-none ${m.color}`}>{m.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-600">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Comparison board ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-px md:flex-row">

        {/* Left — Intended Product */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ...spring.panel }}
          className="flex-1 border border-slate-700/60 bg-slate-900"
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

        {/* Center arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="flex items-center justify-center bg-slate-950 px-2 py-2 md:flex-col md:px-3"
        >
          <ArrowRight className="hidden h-5 w-5 text-slate-700 md:block" />
          <ArrowDown  className="h-5 w-5 text-slate-700 md:hidden" />
          <p className="mt-1 hidden font-mono text-[8px] uppercase tracking-widest text-slate-700 md:block text-center leading-tight">
            Drift<br />Gap
          </p>
        </motion.div>

        {/* Right — Actual Product */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ...spring.panel }}
          className="flex-1 border border-slate-700/60 bg-slate-900"
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
      </div>

      {/* ── Reality summary ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, ...spring.panel }}
        className="mt-4 border-l-2 border-violet-500/50 bg-violet-500/5 px-5 py-4"
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
