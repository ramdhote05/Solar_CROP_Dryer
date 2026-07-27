'use client'

import { History, Trash2 } from 'lucide-react'
import type { BatchRecord } from '@/hooks/use-dryer-simulation'

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BatchHistory({
  batches,
  onClear,
}: {
  batches: BatchRecord[]
  onClear: () => void
}) {
  if (batches.length === 0) return null

  const totalEnergy = batches.reduce((a, b) => a + b.energyKwh, 0)
  const totalCost = batches.reduce((a, b) => a + b.cost, 0)
  const totalWater = batches.reduce((a, b) => a + b.waterRemoved, 0)

  return (
    <section
      aria-label="Completed batch history"
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
          <History className="size-4 text-primary" aria-hidden="true" />
          BATCH HISTORY · {batches.length} RUN{batches.length > 1 ? 'S' : ''}
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors hover:bg-muted"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          CLEAR
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">#</th>
              <th className="py-2 pr-3 font-semibold">Crop</th>
              <th className="py-2 pr-3 font-semibold">Done</th>
              <th className="py-2 pr-3 font-semibold">Time</th>
              <th className="py-2 pr-3 font-semibold">Moisture</th>
              <th className="py-2 pr-3 font-semibold">Water</th>
              <th className="py-2 pr-3 font-semibold">Rate</th>
              <th className="py-2 pr-3 font-semibold">Peak</th>
              <th className="py-2 pr-3 font-semibold">Energy</th>
              <th className="py-2 pr-0 font-semibold">Cost</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs tabular-nums">
            {batches.map((b, i) => (
              <tr
                key={b.id}
                className="border-b border-border/50 last:border-0"
              >
                <td className="py-2 pr-3 text-muted-foreground">
                  {batches.length - i}
                </td>
                <td className="py-2 pr-3 font-sans font-medium text-foreground">
                  {b.cropName}
                </td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {formatClock(b.finishedAt)}
                </td>
                <td className="py-2 pr-3">{formatDuration(b.durationMin)}</td>
                <td className="py-2 pr-3">
                  {b.initialMoisture.toFixed(1)}→{b.finalMoisture.toFixed(1)}%
                </td>
                <td className="py-2 pr-3">{b.waterRemoved.toFixed(2)} kg</td>
                <td className="py-2 pr-3">{b.avgRate.toFixed(1)} %/hr</td>
                <td className="py-2 pr-3">{b.peakTemp.toFixed(1)}°C</td>
                <td className="py-2 pr-3">{b.energyKwh.toFixed(2)} kWh</td>
                <td className="py-2 pr-0">₹{b.cost.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-mono text-xs font-bold tabular-nums text-foreground">
              <td className="py-2 pr-3" colSpan={5}>
                TOTAL
              </td>
              <td className="py-2 pr-3">{totalWater.toFixed(2)} kg</td>
              <td className="py-2 pr-3" />
              <td className="py-2 pr-3" />
              <td className="py-2 pr-3">{totalEnergy.toFixed(2)} kWh</td>
              <td className="py-2 pr-0">₹{totalCost.toFixed(1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
