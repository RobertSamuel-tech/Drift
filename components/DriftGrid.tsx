'use client'

import { motion } from 'framer-motion'
import type { DriftZone } from '@/lib/database.types'
import { badge, spring } from '@/components/ui/drift-theme'

interface Props {
  zones: DriftZone[]
  onZoneClick?: (zone: DriftZone) => void
}

export default function DriftGrid({ zones, onZoneClick }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {zones.map((zone, index) => (
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.35, ...spring.panel }}
          whileHover={{ y: -3, transition: spring.hover }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onZoneClick?.(zone)}
          className={[
            'group relative cursor-pointer overflow-hidden rounded-2xl p-4',
            'border-2 backdrop-blur-md',
            'bg-slate-900/60',
            'shadow-xl shadow-black/40',
            'transition-shadow duration-200 hover:shadow-2xl hover:shadow-black/50',
            zone.drift_type === 'ghost' ? 'border-dashed' : '',
          ].join(' ')}
          style={{ borderColor: zone.color ?? '#6b7280' }}
        >
          {/* Radial color wash — very subtle */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
            style={{
              background: `radial-gradient(ellipse at top right, ${zone.color ?? '#6b7280'}, transparent 65%)`,
            }}
          />

          {/* Inner highlight line at top */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-30"
            style={{ background: `linear-gradient(90deg, transparent, ${zone.color ?? '#6b7280'}, transparent)` }}
          />

          {/* Feature name + priority badge */}
          <div className="relative mb-3 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug text-white">
              {zone.feature_name}
            </p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.priority[zone.intended_priority as keyof typeof badge.priority] ?? badge.priority.low}`}>
              {zone.intended_priority}
            </span>
          </div>

          {/* Drift type + usage score */}
          <div className="relative flex items-center justify-between">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${badge.drift[zone.drift_type as keyof typeof badge.drift] ?? ''}`}>
              {zone.drift_type}
            </span>
            <span className="font-mono text-xs text-slate-300">
              {zone.actual_usage_score}
              <span className="text-slate-600">/100</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
            <motion.div
              className="h-full rounded-full"
              style={{ background: zone.color ?? '#6b7280' }}
              initial={{ width: 0 }}
              animate={{ width: `${zone.actual_usage_score}%` }}
              transition={{ delay: index * 0.08 + 0.25, duration: 0.9, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
