import type { DriftZone } from './database.types'

const SPRINT_DAYS             = 10
const TEAM_SIZE               = 5
const ENGINEER_COST_PER_DAY   = 800

const SPRINT_WEIGHT: Record<string, number> = {
  high:   1,
  medium: 0.5,
  low:    0.25,
}

export interface WasteMetrics {
  wastedFeatures: number
  wastedSprints:  number
  wastedDays:     number
  estimatedCost:  number
}

export function calculateWasteMetrics(driftZones: DriftZone[]): WasteMetrics {
  const wasteZones = driftZones.filter(
    z => z.drift_type === 'ghost' || z.drift_type === 'overbuilt'
  )

  const wastedSprints  = wasteZones.reduce(
    (sum, z) => sum + (SPRINT_WEIGHT[z.intended_priority] ?? 0),
    0
  )
  const wastedDays     = wastedSprints * SPRINT_DAYS * TEAM_SIZE
  const estimatedCost  = Math.max(0, wastedDays * ENGINEER_COST_PER_DAY)

  return {
    wastedFeatures: wasteZones.length,
    wastedSprints,
    wastedDays,
    estimatedCost,
  }
}

export function getCostTheme(cost: number) {
  if (cost < 5000)   return { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' }
  if (cost <= 15000) return { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' }
  return               { text: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/10'    }
}

export function formatCost(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style:              'currency',
    currency:           'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
