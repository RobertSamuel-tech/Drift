const NOVUS_API_URL = process.env.NOVUS_API_URL ?? 'https://api.novus.ai'
const NOVUS_API_KEY = process.env.NOVUS_API_KEY ?? ''

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!NOVUS_API_KEY) return
  await fetch(`${NOVUS_API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NOVUS_API_KEY}`,
    },
    body: JSON.stringify({ event: eventName, properties }),
  })
}

export async function getNovusEvents(
  projectId: string
): Promise<Record<string, unknown>[] | null> {
  if (!NOVUS_API_KEY) return null
  const res = await fetch(`${NOVUS_API_URL}/projects/${projectId}/events`, {
    headers: { Authorization: `Bearer ${NOVUS_API_KEY}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}
