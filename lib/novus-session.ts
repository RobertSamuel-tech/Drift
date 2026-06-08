// Client-side event store for real telemetry accumulation.
// Every call to analytics.X() in lib/novus.ts writes here before forwarding to Pendo.
// NovusAnalyticsPanel reads and aggregates from this store — no fabricated data.

const EVENTS_KEY = 'drift_novus_telemetry'

export interface TelemetryEvent {
  event:      string
  properties: Record<string, unknown>
  ts:         number
}

export function storeEvent(event: string, properties: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    const raw    = sessionStorage.getItem(EVENTS_KEY)
    const events: TelemetryEvent[] = raw ? JSON.parse(raw) : []
    events.push({ event, properties, ts: Date.now() })
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  } catch { /* sessionStorage full or unavailable */ }
}

export function getEvents(): TelemetryEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(EVENTS_KEY)
    return raw ? (JSON.parse(raw) as TelemetryEvent[]) : []
  } catch { return [] }
}

export function clearEvents(): void {
  if (typeof window === 'undefined') return
  try { sessionStorage.removeItem(EVENTS_KEY) } catch { /* unavailable */ }
}

// Wipes all local telemetry: sessionStorage event log + any Pendo visitor state cached locally.
// Does NOT affect Novus/Pendo cloud records — those are permanent server-side.
export function resetTelemetry(): { eventsCleared: number; message: string } {
  if (typeof window === 'undefined') return { eventsCleared: 0, message: 'SSR — no-op' }
  const count = getEvents().length
  try { sessionStorage.removeItem(EVENTS_KEY) } catch { /* unavailable */ }
  // Clear any Pendo visitor-level local state if the SDK exposes it
  try {
    if (typeof window.pendo?.clearSession === 'function') {
      (window.pendo as unknown as { clearSession(): void }).clearSession()
    }
  } catch { /* pendo not loaded or no clearSession */ }
  return { eventsCleared: count, message: `Cleared ${count} local telemetry events. Novus cloud records are unaffected.` }
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export interface NovusLiveSignals {
  hasData:                 boolean
  mostClickedGhostFeature: { name: string; count: number } | null
  mostCorrectedFeature:    { name: string; count: number } | null
  mostViewedReport:        { projectId: string; count: number } | null
  totalAnalysesCompleted:  number
  totalGhostSessions:      number
  totalReportsGenerated:   number
}

export function aggregateSignals(): NovusLiveSignals {
  const events = getEvents()

  const ghostClicks:  Record<string, number> = {}
  const corrections:  Record<string, number> = {}
  const reportViews:  Record<string, number> = {}
  let totalAnalyses        = 0
  let totalGhostSessions   = 0
  let totalReportsGenerated = 0

  for (const e of events) {
    const p = e.properties
    switch (e.event) {
      case 'ghost_feature_selected': {
        const name = String(p.featureName ?? '')
        if (name) ghostClicks[name] = (ghostClicks[name] ?? 0) + 1
        break
      }
      case 'ai_correction_applied': {
        const name = String(p.featureName ?? '')
        if (name) corrections[name] = (corrections[name] ?? 0) + 1
        break
      }
      case 'report_viewed': {
        const pid = String(p.projectId ?? 'session')
        reportViews[pid] = (reportViews[pid] ?? 0) + 1
        totalReportsGenerated++   // saved reports fire report_viewed, not report_generated
        break
      }
      case 'spec_analysis_completed':
        totalAnalyses++
        break
      case 'ghost_mode_opened':
        totalGhostSessions++
        break
    }
  }

  const topGhost      = Object.entries(ghostClicks).sort((a, b) => b[1] - a[1])[0]
  const topCorrection = Object.entries(corrections).sort((a, b) => b[1] - a[1])[0]
  const topReport     = Object.entries(reportViews).sort((a, b) => b[1] - a[1])[0]

  const hasData =
    totalAnalyses > 0 || totalGhostSessions > 0 || totalReportsGenerated > 0 ||
    topGhost !== undefined || topCorrection !== undefined || topReport !== undefined

  return {
    hasData,
    mostClickedGhostFeature: topGhost      ? { name: topGhost[0],      count: topGhost[1]      } : null,
    mostCorrectedFeature:    topCorrection  ? { name: topCorrection[0], count: topCorrection[1] } : null,
    mostViewedReport:        topReport      ? { projectId: topReport[0], count: topReport[1]    } : null,
    totalAnalysesCompleted:  totalAnalyses,
    totalGhostSessions,
    totalReportsGenerated,
  }
}
