import type { DriftZone } from '@/lib/database.types'

interface Props {
  content: string
  highlightedZones: DriftZone[]
}

export default function SpecViewer({ content, highlightedZones }: Props) {
  const lines = content.split('\n')

  return (
    <div className="flex h-full flex-col overflow-auto bg-slate-900/80">
      <div className="shrink-0 border-b border-slate-800/80 px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Product Spec
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="font-mono text-[13px] leading-relaxed text-slate-300">
          {lines.map((line, i) => {
            const match = highlightedZones.find(z =>
              line.toLowerCase().includes(z.feature_name.toLowerCase())
            )
            const color = match?.color ?? null

            return (
              <div
                key={i}
                className={`my-px whitespace-pre px-3 py-0.5${color ? ' rounded-sm' : ''}`}
                style={
                  color
                    ? { borderLeft: `3px solid ${color}`, backgroundColor: `${color}18` }
                    : { borderLeft: '3px solid transparent' }
                }
              >
                {line || ' '}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
