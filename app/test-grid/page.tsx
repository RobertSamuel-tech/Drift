import DriftGrid from '@/components/DriftGrid'
import { DEMO_ZONES } from '@/lib/demo-data'

export default function TestGridPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <DriftGrid zones={DEMO_ZONES} />
    </div>
  )
}
