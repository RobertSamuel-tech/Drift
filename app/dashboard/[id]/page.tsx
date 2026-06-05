import { redirect } from 'next/navigation'

export default function DashboardProjectPage({ params }: { params: { id: string } }) {
  redirect(`/ghost/${params.id}`)
}
