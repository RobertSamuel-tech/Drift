import { generateRoadmapReallocation } from './roadmap-reallocation'
import type { DriftZone } from './database.types'

function assert(cond: boolean, msg: string) {
  if (!cond) { console.error(`  ✗ FAIL: ${msg}`); process.exit(1) }
  console.log(`  ✓ ${msg}`)
}

function zone(
  name: string, score: number,
  priority: DriftZone['intended_priority'],
  dtype: DriftZone['drift_type'],
): DriftZone {
  return {
    id: name, project_id: 'p', feature_name: name,
    intended_priority: priority, actual_usage_score: score,
    drift_type: dtype, novus_event_name: null,
    position_x: 0, position_y: 0, color: null,
    created_at: '2025-01-01T00:00:00Z',
  }
}

console.log('\n=== generateRoadmapReallocation tests ===\n')

// empty zones → safe defaults
const t0 = generateRoadmapReallocation({ driftZones: [], correctionCards: [], concentrationScore: 0 })
assert(t0.remove.length === 0,  'empty: no remove actions')
assert(t0.invest.length === 0,  'empty: no invest actions')
assert(t0.improve.length === 0, 'empty: no improve actions')
assert(t0.summary.length > 0,   'empty: summary is non-empty')

// ghost with zero usage → REMOVE
const t1 = generateRoadmapReallocation({
  driftZones: [
    zone('Dashboard', 0,  'high',   'ghost'),
    zone('CSV Export', 80, 'low',   'underbuilt'),
    zone('Settings',  10, 'medium', 'overbuilt'),
  ],
  correctionCards: [],
  concentrationScore: 88,
})
assert(t1.remove.length === 1,               'ghost → remove')
assert(t1.remove[0].featureName === 'Dashboard', 'ghost remove: correct feature')
assert(t1.remove[0].confidence === 95,       'ghost/high priority: confidence 95')
assert(t1.invest.length === 1,               'underbuilt high-usage → invest')
assert(t1.invest[0].featureName === 'CSV Export', 'invest: correct feature')
assert(t1.summary.includes('Dashboard'),     'summary cites removed feature')
assert(t1.summary.includes('CSV Export'),    'summary cites invest feature')

// no feature should appear in two buckets
const t1Names = [
  ...t1.invest.map(a => a.featureName),
  ...t1.improve.map(a => a.featureName),
  ...t1.remove.map(a => a.featureName),
]
const t1Unique = new Set(t1Names)
assert(t1Names.length === t1Unique.size, 'no feature duplicated across buckets')

// usageScore > 50 → IMPROVE if not already invest
const t2 = generateRoadmapReallocation({
  driftZones: [
    zone('Reports',   55, 'medium', 'aligned'),
    zone('Analytics', 20, 'medium', 'aligned'),
  ],
  correctionCards: [],
  concentrationScore: 40,
})
// Reports is top 20% (1 of 2) and usage >= 60? 55 < 60, so not invest → improve
assert(t2.invest.length === 0,              'usage=55 does not qualify for invest (< 60)')
assert(t2.improve.length === 1,             'usage=55 qualifies for improve (> 50)')
assert(t2.improve[0].featureName === 'Reports', 'improve: correct feature')

// confidence clamped at 97
const t3 = generateRoadmapReallocation({
  driftZones: [ zone('Mega', 100, 'low', 'underbuilt') ],
  correctionCards: [],
  concentrationScore: 100,
})
assert(t3.invest[0].confidence <= 97, 'confidence clamped at 97')

// underbuilt → improve even with lower usage
const t4 = generateRoadmapReallocation({
  driftZones: [
    zone('HiddenGem', 30, 'low', 'underbuilt'),
    zone('BigFeature', 0, 'high', 'ghost'),
  ],
  correctionCards: [],
  concentrationScore: 0,
})
assert(t4.improve.some(a => a.featureName === 'HiddenGem'), 'underbuilt → improve')
assert(t4.remove.some(a => a.featureName === 'BigFeature'), 'ghost → remove')

// invest sorted before improve in recommended order (confidence-based)
const t5 = generateRoadmapReallocation({
  driftZones: [
    zone('TopFeature', 75, 'low',  'underbuilt'),
    zone('MidFeature', 60, 'high', 'aligned'),
  ],
  correctionCards: [],
  concentrationScore: 55,
})
// Both might be in invest; check that highest confidence comes first
if (t5.invest.length > 1) {
  assert(
    t5.invest[0].confidence >= t5.invest[1].confidence,
    'invest sorted by confidence DESC',
  )
}

console.log('\nAll tests passed ✓\n')
