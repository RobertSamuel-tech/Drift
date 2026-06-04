import { getLifecycleStage, buildFeatureLifecycle, STAGE_ORDER } from './feature-lifecycle'
import type { Project, DriftZone } from './database.types'

function assert(condition: boolean, message: string) {
  if (!condition) { console.error(`  ✗ FAIL: ${message}`); process.exit(1) }
  console.log(`  ✓ ${message}`)
}

function zone(name: string, score: number, priority = 'high'): DriftZone {
  return {
    id: name, project_id: 'test', feature_name: name,
    intended_priority: priority as DriftZone['intended_priority'],
    actual_usage_score: score,
    drift_type: score === 0 ? 'ghost' : 'aligned' as DriftZone['drift_type'],
    novus_event_name: null, position_x: 0, position_y: 0, color: null,
    created_at: '2025-01-01T00:00:00Z',
  }
}

const project: Project = {
  id: 'p1', user_id: 'u1', name: 'Test', novus_project_id: null,
  spec_source: 'manual', spec_content: null, spec_url: null,
  drift_score: 50, last_analyzed: '2025-06-06T00:00:00Z',
  created_at: '2025-06-04T00:00:00Z',
}

console.log('\n=== getLifecycleStage tests ===\n')

assert(getLifecycleStage(0)   === 'Ghost',            'score 0 → Ghost')
assert(getLifecycleStage(1)   === 'Ignored',          'score 1 → Ignored')
assert(getLifecycleStage(19)  === 'Ignored',          'score 19 → Ignored')
assert(getLifecycleStage(20)  === 'Partial Adoption', 'score 20 → Partial Adoption')
assert(getLifecycleStage(59)  === 'Partial Adoption', 'score 59 → Partial Adoption')
assert(getLifecycleStage(60)  === 'Core Product',     'score 60 → Core Product')
assert(getLifecycleStage(100) === 'Core Product',     'score 100 → Core Product')

console.log('\n=== buildFeatureLifecycle sorting tests ===\n')

const zones = [
  zone('Core',    80),
  zone('Ghost',    0),
  zone('Partial', 40),
  zone('Ignored', 10),
]

const result = buildFeatureLifecycle(project, zones)

assert(result[0].lifecycleStage === 'Ghost',            'Ghost features appear first')
assert(result[1].lifecycleStage === 'Ignored',          'Ignored features appear second')
assert(result[2].lifecycleStage === 'Partial Adoption', 'Partial Adoption third')
assert(result[3].lifecycleStage === 'Core Product',     'Core Product last')
assert(result[0].featureName    === 'Ghost',            'Ghost feature name is correct')
assert(result[3].featureName    === 'Core',             'Core feature name is correct')

assert(result[0].analyzedAt === '2025-06-06T00:00:00Z', 'analyzedAt uses last_analyzed')
assert(result[0].createdAt  === '2025-06-04T00:00:00Z', 'createdAt uses project.created_at')

console.log('\n=== STAGE_ORDER integrity ===\n')

assert(STAGE_ORDER['Ghost']            < STAGE_ORDER['Ignored'],          'Ghost < Ignored')
assert(STAGE_ORDER['Ignored']          < STAGE_ORDER['Partial Adoption'],  'Ignored < Partial Adoption')
assert(STAGE_ORDER['Partial Adoption'] < STAGE_ORDER['Core Product'],      'Partial Adoption < Core Product')

console.log('\n=== edge cases ===\n')

const empty = buildFeatureLifecycle(project, [])
assert(empty.length === 0, 'empty zones returns empty array')

const allGhost = buildFeatureLifecycle(project, [zone('A', 0), zone('B', 0)])
assert(allGhost.every(i => i.lifecycleStage === 'Ghost'), 'all ghost zones remain ghost')
assert(allGhost.length === 2, 'all ghost zones: correct count')

console.log('\nAll tests passed ✓\n')
