import { calculateWasteMetrics } from './cost-analysis'
import type { DriftZone } from './database.types'

function assert(condition: boolean, message: string) {
  if (!condition) { console.error(`  ✗ FAIL: ${message}`); process.exit(1) }
  console.log(`  ✓ ${message}`)
}

function zone(drift_type: string, intended_priority: string): DriftZone {
  return {
    id:                 'test-id',
    project_id:         'test-project',
    feature_name:       `${drift_type} feature`,
    intended_priority:  intended_priority as DriftZone['intended_priority'],
    actual_usage_score: 0,
    drift_type:         drift_type as DriftZone['drift_type'],
    novus_event_name:   null,
    position_x:         0,
    position_y:         0,
    color:              null,
    created_at:         new Date().toISOString(),
  }
}

console.log('\n=== calculateWasteMetrics unit tests ===\n')

// no ghost/overbuilt → $0
const t1 = calculateWasteMetrics([zone('aligned', 'high'), zone('underbuilt', 'medium'), zone('misunderstood', 'low')])
assert(t1.estimatedCost   === 0, 'no ghost/overbuilt features → $0')
assert(t1.wastedFeatures  === 0, 'no ghost/overbuilt features → 0 wasted features')
assert(t1.wastedSprints   === 0, 'no ghost/overbuilt features → 0 sprints')

// single high-priority ghost: 1 sprint × 10 days × 5 engineers × $800 = $40,000
const t2 = calculateWasteMetrics([zone('ghost', 'high')])
assert(t2.wastedFeatures  === 1,     'ghost/high: 1 wasted feature')
assert(t2.wastedSprints   === 1,     'ghost/high: 1 sprint wasted')
assert(t2.wastedDays      === 50,    'ghost/high: 50 engineer-days')
assert(t2.estimatedCost   === 40000, 'ghost/high: $40,000')

// overbuilt medium: 0.5 sprint × 10 × 5 × $800 = $20,000
const t3 = calculateWasteMetrics([zone('overbuilt', 'medium')])
assert(t3.wastedSprints   === 0.5,   'overbuilt/medium: 0.5 sprints')
assert(t3.estimatedCost   === 20000, 'overbuilt/medium: $20,000')

// mixed: high(1) + medium(0.5) + low(0.25) = 1.75 sprints → $70,000
const t4 = calculateWasteMetrics([
  zone('ghost',    'high'),
  zone('overbuilt','medium'),
  zone('ghost',    'low'),
])
assert(t4.wastedFeatures  === 3,     'mixed: 3 wasted features')
assert(t4.wastedSprints   === 1.75,  'mixed: 1.75 sprints')
assert(t4.estimatedCost   === 70000, 'mixed: $70,000')

// estimatedCost never negative
const t5 = calculateWasteMetrics([])
assert(t5.estimatedCost >= 0, 'empty zones: cost is not negative')
assert(t5.estimatedCost === 0, 'empty zones: cost is $0')

// aligned/misunderstood/underbuilt are NOT waste
const t6 = calculateWasteMetrics([
  zone('aligned',      'high'),
  zone('misunderstood','medium'),
  zone('underbuilt',   'low'),
])
assert(t6.estimatedCost === 0, 'non-waste drift types → $0')

console.log('\nAll tests passed ✓\n')
