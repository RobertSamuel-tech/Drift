import type { DriftZone } from './database.types'

export interface AnalysisSession {
  spec:          string
  projectName:   string
  score:         number
  zones:         DriftZone[]
  featuresFound: number
  createdAt:     string
}

const KEY = 'drift_analysis_session'

export function setSession(s: AnalysisSession): void {
  if (typeof window === 'undefined') return
  try { sessionStorage.setItem(KEY, JSON.stringify(s)) } catch { /* quota exceeded */ }
}

export function getSession(): AnalysisSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AnalysisSession) : null
  } catch { return null }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}
