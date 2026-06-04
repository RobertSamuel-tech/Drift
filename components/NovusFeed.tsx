'use client'

import { motion } from 'framer-motion'
import type { NovusEvent } from '@/lib/drift-algorithm'

interface FeedEvent extends NovusEvent {
  count?: number
}

interface Props {
  events: NovusEvent[]
}

export default function NovusFeed({ events }: Props) {
  const feed = events as FeedEvent[]

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
      <div className="shrink-0 flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Novus Events
        </p>
        <span className="flex items-center gap-1.5">
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-[10px] font-medium text-emerald-500">Live</span>
        </span>
      </div>

      {feed.length === 0 ? (
        <p className="p-4 text-xs text-slate-600">No analytics events available.</p>
      ) : (
        <div className="flex-1 overflow-auto space-y-2 p-3">
          {feed.map((event, index) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="rounded-lg border border-slate-700/40 bg-slate-800/50 px-3 py-2.5 backdrop-blur-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                {index === 0 && (
                  <motion.span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <p className="text-sm font-medium text-slate-100">{event.name}</p>
              </div>
              <div className="flex gap-3">
                <span className="text-[11px] text-slate-500">
                  Count: <span className="font-mono text-slate-400">{event.count ?? '—'}</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Avg: <span className="font-mono text-slate-400">{event.avgPerSession}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
