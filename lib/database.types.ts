export interface Profile {
  id: string
  email: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  novus_project_id: string | null
  spec_source: 'github' | 'manual' | 'demo'
  spec_content: string | null
  spec_url: string | null
  drift_score: number
  last_analyzed: string | null
  created_at: string
}

export interface DriftZone {
  id: string
  project_id: string
  feature_name: string
  intended_priority: 'high' | 'medium' | 'low'
  actual_usage_score: number
  drift_type: 'overbuilt' | 'underbuilt' | 'misunderstood' | 'ghost' | 'aligned'
  novus_event_name: string | null
  position_x: number | null
  position_y: number | null
  color: string | null
  created_at: string
}

export interface CorrectionCard {
  id: string
  project_id: string
  drift_zone_id: string | null
  title: string
  user_story: string | null
  copy_rewrite: string | null
  mockup_suggestion: string | null
  priority: 'critical' | 'high' | 'medium' | 'low'
  ai_generated: boolean
  created_at: string
}

export type Database = {
  profiles: Profile
  projects: Project
  drift_zones: DriftZone
  correction_cards: CorrectionCard
}
