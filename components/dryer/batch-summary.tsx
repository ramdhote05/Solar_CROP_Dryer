'use client'

import {
  ClipboardList,
  Clock,
  Download,
  Droplets,
  Gauge,
  IndianRupee,
  Thermometer,
  Zap,
} from 'lucide-react'
import {
  CROP_PRESETS,
  TARIFF_PER_KWH,
  type DryerState,
} from '@/hooks/use-dryer-simulation'

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function StatTile({
  icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-secondary/50 p-3">
      <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span className="font-mono text-xl font-bold text-foreground">
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

export function BatchSummary({ state }: { state: DryerState }) {
  const {
    batchStartAt,
    batchStartMoisture,
    batchStartWeight,
    simMinutes,
    moisture,
    weight,
    energyWh,
    peakTemp,
    crop,
    targetMoisture,
  } = state

  const durationMin = batchStartAt !== null ? simMinutes - batchStartAt : 0
  const durationHr = Math.max(durationMin / 60, 1 / 60)
  const waterRemoved = Math.max(0, batchStartWeight - weight)
  const moistureDrop = Math.max(0, batchStartMoisture - moisture)
  const avgRate = moistureDrop / durationHr
  const energyKwh = energyWh / 1000
  const cost = energyKwh * TARIFF_PER_KWH
  const energyPerKgWater =
    waterRemoved > 0.001 ? energyKwh / waterRemoved : null
  const cropName =
    CROP_PRESETS.find((p) => p.id === crop)?.name ?? 'Custom setpoints'

  const downloadReport = () => {
    const lines = [
      'AgriDry — Batch Summary Report',
      '================================',
      `Crop profile:        ${cropName}`,
      `Drying time:         ${formatDuration(durationMin)} (${durationMin} min)`,
      `Initial moisture:    ${batchStartMoisture.toFixed(1)} %`,
      `Final moisture:      ${moisture.toFixed(1)} % (target ${targetMoisture} %)`,
      `Initial weight:      ${batchStartWeight.toFixed(3)} kg`,
      `Final weight:        ${weight.toFixed(3)} kg`,
      `Water removed:       ${waterRemoved.toFixed(3)} kg`,
      `Avg drying rate:     ${avgRate.toFixed(2)} %/hr`,
      `Peak chamber temp:   ${peakTemp.toFixed(1)} °C`,
      `Energy consumed:     ${energyKwh.toFixed(2)} kWh`,
      energyPerKgWater !== null
        ? `Specific energy:     ${energyPerKgWater.toFixed(2)} kWh/kg water`
        : '',
      `Est. cost:           Rs ${cost.toFixed(2)} @ Rs ${TARIFF_PER_KWH}/kWh`,
    ].filter(Boolean)
    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agridry-batch-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section
      aria-label="Batch summary report"
      className="rounded-lg border border-primary/40 bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-primary">
          <ClipboardList className="size-4" aria-hidden="true" />
          BATCH SUMMARY REPORT · {cropName.toUpperCase()}
        </h2>
        <button
          type="button"
          onClick={downloadReport}
          className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors hover:bg-muted"
        >
          <Download className="size-3.5" aria-hidden="true" />
          DOWNLOAD REPORT
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile
          icon={<Clock className="size-3.5" aria-hidden="true" />}
          label="DRYING TIME"
          value={formatDuration(durationMin)}
        />
        <StatTile
          icon={<Droplets className="size-3.5" aria-hidden="true" />}
          label="WATER REMOVED"
          value={waterRemoved.toFixed(2)}
          unit="kg"
          sub={`${batchStartWeight.toFixed(2)} → ${weight.toFixed(2)} kg`}
        />
        <StatTile
          icon={<Gauge className="size-3.5" aria-hidden="true" />}
          label="AVG DRY RATE"
          value={avgRate.toFixed(1)}
          unit="%/hr"
          sub={`${batchStartMoisture.toFixed(1)} → ${moisture.toFixed(1)}% MC`}
        />
        <StatTile
          icon={<Thermometer className="size-3.5" aria-hidden="true" />}
          label="PEAK TEMP"
          value={peakTemp.toFixed(1)}
          unit="°C"
        />
        <StatTile
          icon={<Zap className="size-3.5" aria-hidden="true" />}
          label="ENERGY"
          value={energyKwh.toFixed(2)}
          unit="kWh"
          sub={
            energyPerKgWater !== null
              ? `${energyPerKgWater.toFixed(1)} kWh/kg water`
              : undefined
          }
        />
        <StatTile
          icon={<IndianRupee className="size-3.5" aria-hidden="true" />}
          label="EST. COST"
          value={`₹${cost.toFixed(1)}`}
          sub={`@ ₹${TARIFF_PER_KWH}/kWh`}
        />
      </div>
    </section>
  )
}
