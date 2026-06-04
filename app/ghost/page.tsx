import GhostMode from '@/components/GhostMode'
import { DEMO_PROJECT, DEMO_NOVUS_EVENTS, DEMO_ZONES } from '@/lib/demo-data'

export default function GhostPage() {
  return (
    <GhostMode
      project={DEMO_PROJECT}
      specContent={DEMO_PROJECT.spec_content ?? ''}
      novusData={DEMO_NOVUS_EVENTS}
      driftZones={DEMO_ZONES}
    />
  )
}
