import DriftScore from '@/components/DriftScore'

export default function TestScorePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <DriftScore score={44} />
    </div>
  )
}
