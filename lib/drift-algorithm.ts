export interface SpecFeature {
  name: string
  priority: 'high' | 'medium' | 'low'
  mentions: number
}

export interface NovusEvent {
  name: string
  avgPerSession: number
}

export function extractFeaturesFromSpec(specText: string): SpecFeature[] {
  const lines = specText.split('\n')
  const features: SpecFeature[] = []
  const index = new Map<string, number>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const upper = trimmed.toUpperCase()
    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (upper.includes('MUST HAVE') || upper.includes('MVP') || upper.includes('CRITICAL')) {
      priority = 'high'
    } else if (upper.includes('NICE TO HAVE') || upper.includes('FUTURE') || upper.includes('V2')) {
      priority = 'low'
    }

    const match =
      trimmed.match(/(?:Feature|Button|Page|Dashboard):\s*(.+)/i) ||
      trimmed.match(/^[-*•]\s+(.+)/)

    if (!match) continue

    const name = match[1].trim()
    const key = name.toLowerCase()
    const existing = index.get(key)

    if (existing !== undefined) {
      features[existing].mentions++
    } else {
      index.set(key, features.length)
      features.push({ name, priority, mentions: 1 })
    }
  }

  return features
}

export function calculateDriftScore(
  specFeatures: SpecFeature[],
  novusEvents: NovusEvent[]
): number {
  if (specFeatures.length === 0) return 100

  const weights = { high: 3, medium: 2, low: 1 }
  const expected = { high: 80, medium: 50, low: 20 }

  let totalDrift = 0
  let maxDrift = 0

  for (const feature of specFeatures) {
    const lower = feature.name.toLowerCase()
    const event =
      novusEvents.find(e => e.name === feature.name) ||
      novusEvents.find(e =>
        e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase())
      )

    const usageScore = event ? Math.min(event.avgPerSession * 10, 100) : 0
    const weight = weights[feature.priority]
    totalDrift += Math.abs(expected[feature.priority] - usageScore) * weight
    maxDrift += 100 * weight
  }

  return Math.round(100 - (totalDrift / maxDrift) * 100)
}

export function classifyDriftType(feature: SpecFeature, usageScore: number): string {
  if (usageScore === 0 && feature.priority === 'high') return 'ghost'
  if (usageScore < 20 && feature.priority === 'high') return 'overbuilt'
  if (usageScore > 80 && feature.priority === 'low') return 'underbuilt'
  if (usageScore > 50 && feature.priority === 'medium') return 'misunderstood'
  return 'aligned'
}

export function getDriftColor(driftType: string): string {
  const map: Record<string, string> = {
    ghost:         '#6b7280',
    overbuilt:     '#ef4444',
    underbuilt:    '#f59e0b',
    misunderstood: '#a855f7',
    aligned:       '#10b981',
  }
  return map[driftType] ?? '#6b7280'
}
