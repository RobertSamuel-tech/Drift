import { buildRealityMap } from './reality-map'
import type { DriftZone } from './database.types'

function assert(cond: boolean, msg: string) {
  if (!cond) { console.error(`  ✗ FAIL: ${msg}`); process.exit(1) }
  console.log(`  ✓ ${msg}`)
}

function zone(name: string, score: number, priority: string, dtype: string): DriftZone {
  return {
    id: name, project_id: 'p', feature_name: name,
    intended_priority: priority as DriftZone['intended_priority'],
    actual_usage_score: score,
    drift_type: dtype as DriftZone['drift_type'],
    novus_event_name: null, position_x: 0, position_y: 0, color: null,
    created_at: '2025-01-01T00:00:00Z',
  }
}

console.log('\n=== buildRealityMap tests ===\n')

// empty → safe defaults
const t0 = buildRealityMap([])
assert(t0.intendedFeatures.length  === 0, 'empty: intendedFeatures is empty')
assert(t0.actualFeatures.length    === 0, 'empty: actualFeatures is empty')
assert(t0.concentrationScore       === 0, 'empty: concentrationScore is 0')
assert(t0.dominantFeature          === '—', 'empty: dominantFeature is —')

// intendedFeatures sorted by priority (high first)
const zones = [
  zone('LowF',    10, 'low',    'aligned'),
  zone('HighF',   80, 'high',   'ghost'),
  zone('MedF',    40, 'medium', 'misunderstood'),
]
const t1 = buildRealityMap(zones)
assert(t1.intendedFeatures[0].name === 'HighF', 'intended: high priority first')
assert(t1.intendedFeatures[1].name === 'MedF',  'intended: medium priority second')
assert(t1.intendedFeatures[2].name === 'LowF',  'intended: low priority last')

// actualFeatures sorted by usageScore DESC
assert(t1.actualFeatures[0].name  === 'HighF', 'actual: highest usage first (80)')
assert(t1.actualFeatures[1].name  === 'MedF',  'actual: second highest (40)')
assert(t1.actualFeatures[2].name  === 'LowF',  'actual: lowest usage last (10)')

// concentrationScore: 80 / (80+40+10) = 80/130 ≈ 62%
assert(t1.concentrationScore === 62, 'concentrationScore: 80/130 = 62%')
assert(t1.dominantFeature    === 'HighF', 'dominantFeature is highest usage feature')

// concentration > 70 → single-feature product message
const t2 = buildRealityMap([
  zone('CSV',   380, 'low',  'underbuilt'),
  zone('Other',  50, 'high', 'ghost'),
])
// 380/430 = 88%
assert(t2.concentrationScore    === 88, 'concentrationScore: 380/430 = 88%')
assert(t2.dominantFeature       === 'CSV', 'dominant: CSV (380)')
assert(t2.realitySummary.includes('single-feature'), 'summary > 70%: single-feature message')

// concentration > 50 message
const t3 = buildRealityMap([
  zone('A', 60, 'high', 'aligned'),
  zone('B', 40, 'low',  'aligned'),
])
// 60/100 = 60%
assert(t3.concentrationScore === 60, '60/100 = 60%')
assert(t3.realitySummary.includes('small portion'), 'summary > 50%: small portion message')

// all zero → concentrationScore 0, distributed message
const t4 = buildRealityMap([zone('X', 0, 'high', 'ghost'), zone('Y', 0, 'medium', 'ghost')])
assert(t4.concentrationScore   === 0,   'all zero: concentrationScore 0')
assert(t4.dominantFeature      === '—', 'all zero: dominantFeature is —')
assert(t4.realitySummary.includes('No measurable'), 'all zero: no activity message')

// distributed message
const t5 = buildRealityMap([zone('A', 30,'high','aligned'), zone('B', 25,'medium','aligned'), zone('C', 25,'low','aligned')])
// 30/80 = 37%
assert(t5.concentrationScore < 50, 'distributed: concentrationScore < 50')
assert(t5.realitySummary.includes('distributed'), 'distributed: distributed message')

console.log('\nAll tests passed ✓\n')
