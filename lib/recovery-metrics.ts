// Drift Recovery Rate — computation layer.
//
// Three data sources depending on context:
//   computeRecoveryMetrics()    — session storage  (Ghost Mode, real-time)
//   fetchProjectRecovery(id)    — Supabase DB       (Report page, per-project)
//   fetchGlobalRecovery()       — Supabase DB       (Dashboard, all projects)
//
// Formula: (unique corrected ghosts / unique identified ghosts) × 100
//
// Duplicate handling: Sets deduplicate feature names so a feature
// corrected or selected N times still counts as 1.

import { getEvents } from './novus-session'
import type { RecoveryResult } from '@/app/api/recovery/route'

export type { RecoveryResult }

export interface RecoveryMetrics {
  hasData:          boolean
  identifiedGhosts: number
  correctedGhosts:  number
  recoveryRate:     number
}

export function recoveryRateColor(rate: number): string {
  if (rate > 60)  return 'text-emerald-400'
  if (rate >= 25) return 'text-amber-400'
  return 'text-red-400'
}

// ─── Session-scoped (Ghost Mode) ─────────────────────────────────────────────

export function computeRecoveryMetrics(): RecoveryMetrics {
  const events = getEvents()

  const identified = new Set<string>()
  const corrected  = new Set<string>()

  for (const e of events) {
    const p         = e.properties
    const name      = String(p.featureName ?? '').trim()
    const driftType = String(p.driftType   ?? '').trim()

    if (!name || driftType !== 'ghost') continue

    if (e.event === 'ghost_feature_selected') identified.add(name)
    if (e.event === 'ai_correction_applied')  { identified.add(name); corrected.add(name) }
  }

  const identifiedCount = identified.size
  const correctedCount  = corrected.size

  return {
    hasData:          identifiedCount > 0,
    identifiedGhosts: identifiedCount,
    correctedGhosts:  correctedCount,
    recoveryRate:     identifiedCount > 0
      ? Math.round((correctedCount / identifiedCount) * 100)
      : 0,
  }
}

// ─── Database-scoped (Dashboard + Report) ────────────────────────────────────

async function fetchRecovery(projectId?: string): Promise<RecoveryMetrics | null> {
  try {
    const url = projectId
      ? `/api/recovery?project_id=${encodeURIComponent(projectId)}`
      : '/api/recovery'

    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) return null

    const data: RecoveryResult = await res.json()
    return {
      hasData:          data.hasData,
      identifiedGhosts: data.identifiedGhosts ?? 0,
      correctedGhosts:  data.correctedGhosts  ?? 0,
      recoveryRate:     data.recoveryRate      ?? 0,
    }
  } catch {
    return null
  }
}

export function fetchProjectRecovery(projectId: string): Promise<RecoveryMetrics | null> {
  return fetchRecovery(projectId)
}

export function fetchGlobalRecovery(): Promise<RecoveryMetrics | null> {
  return fetchRecovery()
}
