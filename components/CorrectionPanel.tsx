'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { analytics } from '@/lib/novus'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Loader2, AlertCircle, CheckCircle2, Zap, ArrowRight } from 'lucide-react'
import type { DriftZone, CorrectionCard } from '@/lib/database.types'

const PRIORITY_ORDER: Record<CorrectionCard['priority'], number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}
const priorityBadge: Record<CorrectionCard['priority'], string> = {
  critical: 'bg-red-500/15    text-red-400    ring-1 ring-inset ring-red-500/25',
  high:     'bg-amber-500/15  text-amber-400  ring-1 ring-inset ring-amber-500/25',
  medium:   'bg-blue-500/15   text-blue-400   ring-1 ring-inset ring-blue-500/25',
  low:      'bg-slate-700/50  text-slate-400  ring-1 ring-inset ring-slate-600/40',
}
const driftBadge: Record<string, string> = {
  ghost:         'bg-slate-500/15  text-slate-400',
  overbuilt:     'bg-red-500/15    text-red-400',
  underbuilt:    'bg-amber-500/15  text-amber-400',
  misunderstood: 'bg-violet-500/15 text-violet-400',
  aligned:       'bg-emerald-500/15 text-emerald-400',
}

function beforeState(zone: DriftZone): string {
  const u = zone.actual_usage_score
  switch (zone.drift_type) {
    case 'ghost':         return `Built as a priority but has ${u}/100 usage — users never found it.`
    case 'overbuilt':     return `Heavy investment, but only ${u}/100 usage. Most users skip it entirely.`
    case 'underbuilt':    return `${u}/100 usage despite being low-priority. Users want more of this.`
    case 'misunderstood': return `${u}/100 usage but not in the way the spec intended.`
    default:              return `Usage ${u}/100 diverges from intended behavior.`
  }
}

interface Props {
  zone: DriftZone | null
  isOpen: boolean
  onClose: () => void
}

export default function CorrectionPanel({ zone, isOpen, onClose }: Props) {
  const [cards, setCards]     = useState<CorrectionCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setCards([])
    setError(null)
    setLoading(false)
    if (!isOpen || !zone || zone.drift_type === 'aligned') return

    let cancelled = false
    setLoading(true)

    fetch('/api/correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zones: [zone] }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.error) { setError(data.error); return }
        const mapped: CorrectionCard[] = (data.cards ?? []).map(
          (c: Record<string, unknown>, i: number) => ({
            id:                `card-${zone.id}-${i}`,
            project_id:        zone.project_id,
            drift_zone_id:     zone.id,
            title:             String(c.title ?? ''),
            user_story:        String(c.user_story ?? '') || null,
            copy_rewrite:      String(c.copy_rewrite ?? '') || null,
            mockup_suggestion: String(c.mockup_suggestion ?? '') || null,
            priority:          (c.priority as CorrectionCard['priority']) ?? 'medium',
            ai_generated:      Boolean(c.ai_generated ?? true),
            created_at:        new Date().toISOString(),
          })
        )
        setCards(mapped.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]))
        if (mapped.length > 0 && zone) {
          analytics.aiCorrectionApplied({
            featureName: zone.feature_name,
            driftType:   zone.drift_type,
            cardsCount:  mapped.length,
          })

          // Persist to DB for saved analyses (project_id is a real UUID, not 'analyze'/'session')
          const isRealProject = zone.project_id !== 'analyze' && zone.project_id !== 'session'
          if (zone.drift_type === 'ghost' && isRealProject) {
            fetch('/api/recovery', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id:   zone.project_id,
                feature_name: zone.feature_name,
                drift_type:   zone.drift_type,
                event_type:   'corrected',
              }),
            }).catch(() => { /* non-blocking */ })
          }
        }
      })
      .catch(() => { if (!cancelled) setError('Could not reach /api/correct') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [isOpen, zone?.id])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent aria-describedby={undefined} className="flex flex-col overflow-hidden border-l border-slate-800 bg-slate-900 p-0 shadow-2xl shadow-black/50">

        <SheetHeader className="shrink-0 border-b border-slate-800/80 px-6 py-5">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="min-w-0">
              <SheetTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Correction Card
              </SheetTitle>
              {zone && (
                <p className="mt-1 truncate text-base font-bold text-white">{zone.feature_name}</p>
              )}
            </div>
            {zone && (
              <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${driftBadge[zone.drift_type] ?? ''}`}>
                {zone.drift_type}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">

          {zone && (
            <div className="border-b border-slate-800/60 px-6 py-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Why?</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['Intended Priority', zone.intended_priority],
                  ['Actual Usage',      `${zone.actual_usage_score} / 100`],
                  ['Drift Type',        zone.drift_type],
                  ['Novus Event',       zone.novus_event_name ?? '—'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</p>
                    <p className="mt-0.5 text-xs font-medium capitalize text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {zone?.drift_type === 'aligned' && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-500/60" />
              <p className="text-sm font-semibold text-slate-300">This feature is aligned with user behavior.</p>
              <p className="mt-1 text-xs text-slate-600">No correction needed.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-sm text-slate-500">Generating AI corrections…</p>
            </div>
          )}

          {error && (
            <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {!loading && !error && zone?.drift_type !== 'aligned' && cards.length > 0 && (
            <div className="space-y-4 p-4">
              {cards.map(card => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 shadow-lg shadow-black/20"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <p className="text-sm font-bold leading-snug text-white">{card.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityBadge[card.priority]}`}>
                      {card.priority}
                    </span>
                  </div>

                  {zone && (
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-2.5">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-red-500/60">Before</p>
                        <p className="text-[11px] leading-relaxed text-slate-400">{beforeState(zone)}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-emerald-500/60">After</p>
                        <p className="text-[11px] leading-relaxed text-slate-300">{card.mockup_suggestion ?? '—'}</p>
                      </div>
                    </div>
                  )}

                  {card.user_story && (
                    <p className="mb-2 text-xs leading-relaxed text-slate-400">{card.user_story}</p>
                  )}

                  {card.copy_rewrite && (
                    <div className="mb-3 flex items-start gap-1.5 rounded-lg border border-slate-700/40 bg-slate-900/60 px-3 py-2">
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">Copy Rewrite</p>
                        <p className="text-xs text-slate-300">{card.copy_rewrite}</p>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-violet-400" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-violet-400/80">Founder Action</p>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed text-violet-200">
                      {card.copy_rewrite ?? card.title}.
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
