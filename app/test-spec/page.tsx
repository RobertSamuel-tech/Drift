import SpecViewer from '@/components/SpecViewer'
import { DEMO_PROJECT, DEMO_ZONES } from '@/lib/demo-data'

export default function TestSpecPage() {
  return (
    <div className="h-screen">
      <SpecViewer
        content={DEMO_PROJECT.spec_content ?? ''}
        highlightedZones={DEMO_ZONES}
      />
    </div>
  )
}
