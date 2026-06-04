'use client'

import { motion } from 'framer-motion'
import { Ghost, TrendingDown, BarChart2, Star } from 'lucide-react'
import type { FeatureLifecycleItem, LifecycleStage } from '@/lib/feature-lifecycle'
import type { LucideIcon } from 'lucide-react'

interface StageConfig {
  icon:     LucideIcon
  border:   string
  bg:       string
  iconColor: string
  badge:    string
  dot:      string
  label:    string
  outcome:  string
}

const STAGE: Record<LifecycleStage, StageConfig> = {
  'Ghost': {
    icon: Ghost, border: 'border-red-500/30 border-dashed', bg: 'bg-red-500/5',
    iconColor: 'text-red-500/70', badge: 'bg-red-500/15 text-red-400',
    dot: 'bg-red-500/60', label: '👻 Ghost Feature',
    outcome: 'Engineering effort produced no measurable adoption.',
  },
  'Ignored': {
    icon: TrendingDown, border: 'border-slate-600/40', bg: 'bg-slate-800/20',
    iconColor: 'text-slate-500', badge: 'bg-slate-700/50 text-slate-400',
    dot: 'bg-slate-500/60', label: '↓ Ignored',
    outcome: 'Built and shipped — users rarely engage.',
  },
  'Partial Adoption': {
    icon: BarChart2, border: 'border-amber-500/30', bg: 'bg-amber-500/5',
    iconColor: 'text-amber-500/70', badge: 'bg-amber-500/15 text-amber-400',
    dot: 'bg-amber-500/60', label: '↑ Partial Adoption',
    outcome: 'Growing but not yet dominant.',
  },
  'Core Product': {
    icon: Star, border: 'border-emerald-500/30', bg: 'bg-emerald-500/5',
    iconColor: 'text-emerald-500/70', badge: 'bg-emerald-500/15 text-emerald-400',
    dot: 'bg-emerald-500/60', label: '🔥 Core Product',
    outcome: 'Users repeatedly return to this feature.',
  },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props { items: FeatureLifecycleItem[] }

export default function FeatureTimeline({ items }: Props) {
  const counts = {
    ghost:   items.filter(i => i.lifecycleStage === 'Ghost').length,
    ignored: items.filter(i => i.lifecycleStage === 'Ignored').length,
    partial: items.filter(i => i.lifecycleStage === 'Partial Adoption').length,
    core:    items.filter(i => i.lifecycleStage === 'Core Product').length,
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {([
          { label: 'Ghost Features',   count: counts.ghost,   color: 'text-red-400'     },
          { label: 'Ignored Features', count: counts.ignored, color: 'text-slate-400'   },
          { label: 'Partial Adoption', count: counts.partial, color: 'text-amber-400'   },
          { label: 'Core Features',    count: counts.core,    color: 'text-emerald-400' },
        ] as const).map(m => (
          <div key={m.label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-2.5">
            <span className={`text-2xl font-black tabular-nums ${m.color}`}>{m.count}</span>
            <span className="ml-2 text-xs text-slate-500">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item, index) => {
          const cfg  = STAGE[item.lifecycleStage]
          const Icon = cfg.icon
          const steps = [
            { label: 'Feature Added', value: fmt(item.createdAt)  },
            { label: 'Analyzed',      value: fmt(item.analyzedAt) },
            { label: 'Usage',         value: `${item.usageScore} / 100` },
            { label: 'Outcome',       value: cfg.label },
          ]

          return (
            <motion.div
              key={item.featureName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
              className={`rounded-2xl border p-5 ${cfg.border} ${cfg.bg}`}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-white">{item.featureName}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {item.priority} priority
                  </p>
                </div>
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconColor}`} />
              </div>

              <div className="space-y-2">
                {steps.map((step, si) => (
                  <div key={step.label} className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {si < steps.length - 1 && (
                        <div className="mt-1 h-5 w-px bg-slate-700/40" />
                      )}
                    </div>
                    <div className="-mt-px">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{step.label}</p>
                      <p className="text-xs font-medium text-slate-300">{step.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className={`mt-4 rounded-lg px-3 py-2 text-[11px] leading-relaxed ${cfg.badge}`}>
                {cfg.outcome}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
