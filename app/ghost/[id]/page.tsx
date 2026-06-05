import { notFound } from 'next/navigation'
import GhostMode from '@/components/GhostMode'
import { createAdminClient } from '@/lib/supabase'
import { DEMO_NOVUS_EVENTS } from '@/lib/demo-data'
import type { Project, DriftZone } from '@/lib/database.types'

export default async function GhostProjectPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const { data: rawZones } = await supabase
    .from('drift_zones')
    .select('*')
    .eq('project_id', params.id)
    .order('position_y', { ascending: true })
    .order('position_x', { ascending: true })

  const driftZones: DriftZone[] = (rawZones ?? []).map(z => ({
    ...z,
    drift_type:        z.drift_type        as DriftZone['drift_type'],
    intended_priority: z.intended_priority as DriftZone['intended_priority'],
  }))

  return (
    <GhostMode
      project={project as Project}
      specContent={project.spec_content ?? ''}
      novusData={DEMO_NOVUS_EVENTS}
      driftZones={driftZones}
    />
  )
}
