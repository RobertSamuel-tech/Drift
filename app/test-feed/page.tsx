import NovusFeed from '@/components/NovusFeed'
import { DEMO_NOVUS_EVENTS } from '@/lib/demo-data'

export default function TestFeedPage() {
  return (
    <div className="mx-auto h-screen max-w-sm p-8">
      <NovusFeed events={DEMO_NOVUS_EVENTS} />
    </div>
  )
}
