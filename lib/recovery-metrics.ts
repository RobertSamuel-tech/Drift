// Drift Recovery Rate — single source of truth.
// Formula: (unique ghost features corrected / unique ghost features identified) * 100
//
// Identified = union of ghost features surfaced via ghost_feature_selected
//              plus those in ai_correction_applied (corrected implies identified).
// Corrected  = unique ghost features that received an ai_correction_applied event.
//
// Duplicate handling: both sets use Set<string>, so a feature selected or
// corrected multiple times counts only once. Rate can never exceed 100%.

import { getEvents } from './novus-session'

export interface RecoveryMetrics {
  hasData:          boolean
  identifiedGhosts: number   // unique ghost feature names surfaced
  correctedGhosts:  number   // unique ghost feature names corrected
  recoveryRate:     number   // 0–100, rounded integer
}

export function computeRecoveryMetrics(): RecoveryMetrics {
  const events = getEvents()

  const identified = new Set<string>()
  const corrected  = new Set<string>()

  for (const e of events) {
    const p         = e.properties
    const name      = String(p.featureName ?? '').trim()
    const driftType = String(p.driftType   ?? '').trim()

    if (!name || driftType !== 'ghost') continue

    if (e.event === 'ghost_feature_selected') {
      identified.add(name)
    }

    if (e.event === 'ai_correction_applied') {
      identified.add(name) // corrected → also identified
      corrected.add(name)
    }
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

export function recoveryRateColor(rate: number): string {
  if (rate > 60)  return 'text-emerald-400'
  if (rate >= 25) return 'text-amber-400'
  return 'text-red-400'
}
