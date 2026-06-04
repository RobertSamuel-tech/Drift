'use client'

import { motion } from 'framer-motion'
import type { DriftZone } from '@/lib/database.types'

interface Props {
  zones: DriftZone[]
  onZoneClick?: (zone: DriftZone) => void
}

const priorityBadge: Record<string, string> = {
  high:   'bg-red-500/15   text-red-400   ring-1 ring-inset ring-red-500/25',
  medium: 'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25',
  low:    'bg-slate-700/60 text-slate-400 ring-1 ring-inset ring-slate-600/40',
}

export default function DriftGrid({ zones, onZoneClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {zones.map((zone, index) => (
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onZoneClick?.(zone)}
          className={[
            'group relative cursor-pointer overflow-hidden rounded-xl border-2 p-4',
            'bg-slate-800/40 backdrop-blur-sm',
            'shadow-lg shadow-black/30 transition-shadow duration-200',
            'hover:shadow-xl hover:shadow-black/40',
            zone.drift_type === 'ghost' ? 'border-dashed' : '',
          ].join(' ')}
          style={{ borderColor: zone.color ?? '#6b7280' }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5 transition-opacity duration-200 group-hover:opacity-10"
            style={{ background: `radial-gradient(circle at top right, ${zone.color ?? '#6b7280'}, transparent 70%)` }}
          />

          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight text-white">
              {zone.feature_name}
            </p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityBadge[zone.intended_priority]}`}>
              {zone.intended_priority}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium capitalize text-slate-400">
              {zone.drift_type}
            </span>
            <span className="font-mono text-xs text-slate-300">
              {zone.actual_usage_score}
              <span className="text-slate-600">/100</span>
            </span>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-700/60">
            <motion.div
              className="h-full rounded-full"
              style={{ background: zone.color ?? '#6b7280' }}
              initial={{ width: 0 }}
              animate={{ width: `${zone.actual_usage_score}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
