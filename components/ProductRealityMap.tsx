'use client'

import { motion } from 'framer-motion'
import { Ghost, Star, AlertTriangle, ArrowRight, ArrowDown } from 'lucide-react'
import type { RealityMap, RealityFeature } from '@/lib/reality-map'

function featureStyle(f: RealityFeature) {
  if (f.driftType === 'ghost' || f.usageScore === 0)
    return { text: 'text-red-400',    icon: <Ghost    className="h-3.5 w-3.5 shrink-0 text-red-400/70"    /> }
  if (f.usageScore >= 60)
    return { text: 'text-emerald-400',icon: <Star     className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" /> }
  if (f.driftType === 'misunderstood')
    return { text: 'text-violet-400', icon: <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-violet-400/70" /> }
  return   { text: 'text-slate-300',  icon: null }
}

function FeatureRow({ f, rank, showBar }: { f: RealityFeature; rank: number; showBar?: boolean }) {
  const { text, icon } = featureStyle(f)
  return (
    <div className="flex items-start gap-2 py-2 border-b border-slate-800/40 last:border-0">
      <span className="mt-0.5 w-5 shrink-0 text-right text-[10px] font-bold text-slate-700">#{rank}</span>
      {icon && <span className="mt-0.5">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${text}`}>{f.name}</p>
        {showBar ? (
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-emerald-500/60"
              initial={{ width: 0 }}
              animate={{ width: `${f.usageScore}%` }}
              transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        ) : (
          <p className="text-[10px] capitalize text-slate-600">{f.priority} priority</p>
        )}
      </div>
      <span className="shrink-0 text-[10px] font-mono text-slate-500">{f.usageScore}/100</span>
    </div>
  )
}

interface Props { data: RealityMap }

export default function ProductRealityMap({ data }: Props) {
  const ghostCount = data.intendedFeatures.filter(f => f.driftType === 'ghost').length

  return (
    <div>
      {/* Metrics row */}
      <div className="mb-8 flex flex-wrap gap-3">
        {([
          { label: 'Reality Concentration', value: `${data.concentrationScore}%`, color: data.concentrationScore > 70 ? 'text-red-400' : data.concentrationScore > 50 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Dominant Feature',       value: data.dominantFeature,          color: 'text-white' },
          { label: 'Ghost Features',         value: String(ghostCount),            color: 'text-red-400' },
        ] as const).map(m => (
          <div key={m.label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
            <p className={`text-xl font-black tabular-nums ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-slate-600">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start">

        {/* Left — Founder Intent */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5"
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Founder Intent</p>
          <p className="mb-4 text-base font-bold text-white">Intended Product</p>
          {data.intendedFeatures.map((f, i) => (
            <FeatureRow key={f.name} f={f} rank={i + 1} showBar={false} />
          ))}
        </motion.div>

        {/* Center arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="flex items-center justify-center py-2 md:flex-col md:justify-start md:pt-16"
        >
          <ArrowRight className="hidden h-7 w-7 text-slate-700 md:block" />
          <ArrowDown  className="h-7 w-7 text-slate-700 md:hidden" />
          <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-widest text-slate-700 md:block">
            User<br />Behavior
          </p>
        </motion.div>

        {/* Right — User Reality */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5"
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">User Reality</p>
          <p className="mb-4 text-base font-bold text-white">Actual Product</p>
          {data.actualFeatures.map((f, i) => (
            <FeatureRow key={f.name} f={f} rank={i + 1} showBar />
          ))}
        </motion.div>
      </div>

      {/* Reality Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.45 }}
        className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5"
      >
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500/70">Reality Summary</p>
        <p className="text-sm font-semibold leading-relaxed text-violet-100">{data.realitySummary}</p>
        {data.dominantFeature !== '—' && (
          <p className="mt-1.5 text-xs text-slate-500">
            Features consuming roadmap space show minimal adoption.
            Your product behaves differently than intended.
          </p>
        )}
      </motion.div>
    </div>
  )
}
