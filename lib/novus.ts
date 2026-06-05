// Single analytics abstraction layer — all events route through pendo.track().
// Every event is also written to sessionStorage via storeEvent() so the
// NovusAnalyticsPanel can display real telemetry without a read-capable API key.

import { storeEvent } from './novus-session'

declare global {
  interface Window {
    pendo?: {
      initialize(options: Record<string, unknown>): void
      track(eventName: string, properties?: Record<string, unknown>): void
    }
  }
}

function track(event: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  storeEvent(event, properties)                          // always capture to session store
  if (typeof window.pendo?.track !== 'function') return
  try { window.pendo.track(event, properties) } catch { /* never surface tracking errors */ }
}

// ─── Analytics events ─────────────────────────────────────────────────────────

export const analytics = {

  analysisStarted(): void {
    track('analysis_started')
  },

  analysisCompleted(props: { score: number; featuresFound: number; driftTypes: string[] }): void {
    track('analysis_completed', props)
  },

  specPasted(): void {
    track('spec_pasted')
  },

  ghostModeOpened(props: { projectId: string; source: 'analyze' | 'archive' | 'report' }): void {
    track('ghost_mode_opened', props)
  },

  reportViewed(props: { projectId: string; score: number }): void {
    track('report_viewed', props)
  },

  reportGenerated(props: { score: number; featuresFound: number }): void {
    track('report_generated', props)
  },

  reportExported(props: { projectName: string; score: number }): void {
    track('report_exported', props)
  },

  analysisSaved(props: { projectId: string; score: number }): void {
    track('analysis_saved', props)
  },

  archiveOpened(): void {
    track('archive_opened')
  },

  ghostFeatureSelected(props: { featureName: string; driftType: string }): void {
    track('ghost_feature_selected', props)
  },

  aiCorrectionApplied(props: { featureName: string; driftType: string; cardsCount: number }): void {
    track('ai_correction_applied', props)
  },

}

// ─── Novus data utility (server-side) ────────────────────────────────────────

const NOVUS_API_URL = process.env.NOVUS_API_URL ?? 'https://api.novus.ai'
const NOVUS_API_KEY = process.env.NOVUS_API_KEY ?? ''

export async function getNovusEvents(
  projectId: string
): Promise<Record<string, unknown>[] | null> {
  if (!NOVUS_API_KEY) return null
  const res = await fetch(`${NOVUS_API_URL}/projects/${projectId}/events`, {
    headers: { Authorization: `Bearer ${NOVUS_API_KEY}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}
