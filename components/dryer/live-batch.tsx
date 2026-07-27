'use client'

import { Clock, Hourglass, IndianRupee, Scale, Zap } from 'lucide-react'
import { TARIFF_PER_KWH, type DryerState } from '@/hooks/use-dryer-simulation'

function formatDuration(mins: number) {
  const clamped = Math.max(0, Math.round(mins))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function LiveTile({
  icon,
  label,
  value,
  unit,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-secondary/50 p-3">
      <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest text-muted-foreground">
        <span className={accent ? 'text-primary' : 'text-muted-foreground'}>
          {icon}
        </span>
        {label}
      </span>
      <span className="font-mono text-xl font-bold tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

export function LiveBatch({ state }: { state: DryerState }) {
  const {
    batchStartAt,
    simMinutes,
    moisture,
    targetMoisture,
    dryingRate,
    energyWh,
    weight,
    rawWeight,
  } = state

  const elapsedMin = batchStartAt !== null ? simMinutes - batchStartAt : 0
  const energyKwh = energyWh / 1000
  const cost = energyKwh * TARIFF_PER_KWH

  const moistureGap = Math.max(0, moisture - targetMoisture)
  // dryingRate is %/hr → convert the remaining moisture gap into minutes
  const etaMin =
    dryingRate !== null && dryingRate > 0.05
      ? (moistureGap / dryingRate) * 60
      : null

  return (
    <section
      aria-label="Live batch telemetry"
      className="rounded-lg border border-primary/40 bg-card p-4"
    >
      <h2 className="flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-primary">
        <Hourglass className="size-4" aria-hidden="true" />
        LIVE BATCH · IN PROGRESS
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <LiveTile
          icon={<Hourglass className="size-3.5" aria-hidden="true" />}
          label="EST. TIME LEFT"
          value={etaMin !== null ? formatDuration(etaMin) : '—'}
          sub={
            etaMin !== null
              ? `to reach ${targetMoisture}% MC`
              : 'estimating rate…'
          }
          accent
        />
        <LiveTile
          icon={<Clock className="size-3.5" aria-hidden="true" />}
          label="ELAPSED"
          value={formatDuration(elapsedMin)}
          sub={`${moistureGap.toFixed(1)}% MC to go`}
        />
        <LiveTile
          icon={<Scale className="size-3.5" aria-hidden="true" />}
          label="LOAD CELL"
          value={weight.toFixed(3)}
          unit="kg"
          sub={`raw ${rawWeight.toFixed(3)} kg`}
        />
        <LiveTile
          icon={<Zap className="size-3.5" aria-hidden="true" />}
          label="ENERGY SO FAR"
          value={energyKwh.toFixed(2)}
          unit="kWh"
          sub={
            dryingRate !== null ? `rate ${dryingRate.toFixed(1)} %/hr` : undefined
          }
        />
        <LiveTile
          icon={<IndianRupee className="size-3.5" aria-hidden="true" />}
          label="COST SO FAR"
          value={`₹${cost.toFixed(1)}`}
          sub={`@ ₹${TARIFF_PER_KWH}/kWh`}
        />
      </div>
    </section>
  )
}
