import { getDriftColor } from './drift-algorithm'
import type { NovusEvent } from './drift-algorithm'
import type { Project, DriftZone } from './database.types'

interface DemoNovusEvent extends NovusEvent {
  count: number
}

export const DEMO_PROJECT_ID = '00000000-0000-0000-0000-000000000001'

export const DEMO_PROJECT: Project = {
  id: '00000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000000',
  name: 'TaskFlow Pro',
  novus_project_id: null,
  spec_source: 'demo',
  spec_url: null,
  drift_score: 44,
  last_analyzed: null,
  created_at: '2025-01-01T00:00:00Z',
  spec_content: `# TaskFlow Pro

## MVP Features

* Dashboard with task overview (MUST HAVE)
* CSV export for reporting (MUST HAVE)
* Team collaboration workspace (MUST HAVE)
* Dark mode toggle (NICE TO HAVE)
* Custom emoji reactions (NICE TO HAVE)`,
}

export const DEMO_NOVUS_EVENTS: DemoNovusEvent[] = [
  { name: 'Dashboard',      count: 0,   avgPerSession: 0 },
  { name: 'Kanban Board',   count: 12,  avgPerSession: 1 },
  { name: 'CSV Export',     count: 240, avgPerSession: 6 },
  { name: 'Dark Mode',      count: 0,   avgPerSession: 0 },
  { name: 'Team Workspace', count: 380, avgPerSession: 9 },
]

export const DEMO_ZONES: DriftZone[] = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    project_id: '00000000-0000-0000-0000-000000000001',
    feature_name: 'Dashboard',
    intended_priority: 'high',
    actual_usage_score: 0,
    drift_type: 'ghost',
    novus_event_name: 'Dashboard',
    position_x: 0,
    position_y: 0,
    color: getDriftColor('ghost'),
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    project_id: '00000000-0000-0000-0000-000000000001',
    feature_name: 'Kanban Board',
    intended_priority: 'high',
    actual_usage_score: 10,
    drift_type: 'overbuilt',
    novus_event_name: 'Kanban Board',
    position_x: 1,
    position_y: 0,
    color: getDriftColor('overbuilt'),
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    project_id: '00000000-0000-0000-0000-000000000001',
    feature_name: 'CSV Export',
    intended_priority: 'medium',
    actual_usage_score: 60,
    drift_type: 'misunderstood',
    novus_event_name: 'CSV Export',
    position_x: 2,
    position_y: 0,
    color: getDriftColor('misunderstood'),
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    project_id: '00000000-0000-0000-0000-000000000001',
    feature_name: 'Dark Mode',
    intended_priority: 'low',
    actual_usage_score: 0,
    drift_type: 'aligned',
    novus_event_name: 'Dark Mode',
    position_x: 3,
    position_y: 0,
    color: getDriftColor('aligned'),
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000005',
    project_id: '00000000-0000-0000-0000-000000000001',
    feature_name: 'Team Workspace',
    intended_priority: 'low',
    actual_usage_score: 90,
    drift_type: 'underbuilt',
    novus_event_name: 'Team Workspace',
    position_x: 4,
    position_y: 0,
    color: getDriftColor('underbuilt'),
    created_at: '2025-01-01T00:00:00Z',
  },
]
