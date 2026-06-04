'use client'

import { motion } from 'framer-motion'
import type { NovusEvent } from '@/lib/drift-algorithm'
import { spring } from '@/components/ui/drift-theme'

interface FeedEvent extends NovusEvent {
  count?: number
}

interface Props {
  events: NovusEvent[]
}

export default function NovusFeed({ events }: Props) {
  const feed = events as FeedEvent[]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60 shadow-xl shadow-black/30 backdrop-blur-md">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Novus Events
        </p>

        {/* Live indicator — clean ping pattern used by Linear/Vercel */}
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          </span>
          <span className="text-[10px] font-semibold text-emerald-500">Live</span>
        </span>
      </div>

      {/* Event list */}
      {feed.length === 0 ? (
        <p className="p-4 text-xs text-slate-600">No analytics events available.</p>
      ) : (
        <div className="flex-1 space-y-2 overflow-auto p-3">
          {feed.map((event, index) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3, ...spring.gentle }}
              className={[
                'relative overflow-hidden rounded-xl border px-3 py-2.5',
                'backdrop-blur-sm',
                event.avgPerSession > 0
                  ? 'border-slate-700/40 bg-slate-800/50'
                  : 'border-slate-800/40 bg-slate-900/40',
              ].join(' ')}
            >
              {/* Active event — subtle left accent line */}
              {event.avgPerSession > 0 && (
                <div className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-emerald-500/50" />
              )}

              <div className="mb-1 flex items-center gap-2">
                {index === 0 && event.avgPerSession > 0 && (
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                )}
                <p className={`text-sm font-semibold leading-tight ${event.avgPerSession > 0 ? 'text-slate-100' : 'text-slate-500'}`}>
                  {event.name}
                </p>
              </div>

              <div className="flex gap-3 pl-0.5">
                <span className="text-[11px] text-slate-600">
                  Count:{' '}
                  <span className={`font-mono font-medium ${event.count ? 'text-slate-400' : 'text-slate-600'}`}>
                    {event.count ?? '—'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-600">
                  Avg:{' '}
                  <span className={`font-mono font-medium ${event.avgPerSession > 0 ? 'text-slate-400' : 'text-slate-600'}`}>
                    {event.avgPerSession}
                  </span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
