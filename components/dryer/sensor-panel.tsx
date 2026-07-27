'use client'

import { Droplets, Scale, Thermometer, Wheat } from 'lucide-react'
import type { DryerState } from '@/hooks/use-dryer-simulation'
import { cn } from '@/lib/utils'

function ReadoutCard({
  icon,
  label,
  value,
  unit,
  sub,
  accent,
  barPct,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  sub: string
  accent: 'heat' | 'blue' | 'green' | 'amber'
  barPct: number
}) {
  const accentText = {
    heat: 'text-[oklch(0.68_0.2_40)]',
    blue: 'text-[oklch(0.7_0.12_230)]',
    green: 'text-primary',
    amber: 'text-warning',
  }[accent]
  const accentBar = {
    heat: 'bg-[oklch(0.68_0.2_40)]',
    blue: 'bg-[oklch(0.7_0.12_230)]',
    green: 'bg-primary',
    amber: 'bg-warning',
  }[accent]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={accentText}>{icon}</span>
        <span className="font-mono text-xs tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn('font-mono text-3xl font-bold tabular-nums', accentText)}>
          {value}
        </span>
        <span className="font-mono text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className={cn('h-full rounded-full transition-all duration-500', accentBar)}
          style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export function SensorPanel({ state }: { state: DryerState }) {
  const weightLossPct =
    ((state.initialWeight - state.weight) / state.initialWeight) * 100
  const dryProgress =
    ((28 - state.moisture) / (28 - state.targetMoisture)) * 100

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <ReadoutCard
        icon={<Thermometer className="size-4" aria-hidden="true" />}
        label="CHAMBER TEMP"
        value={state.chamberTemp.toFixed(1)}
        unit="°C"
        sub={`Setpoint ${state.targetTemp}°C · Ambient ${state.ambientTemp.toFixed(1)}°C`}
        accent="heat"
        barPct={(state.chamberTemp / 80) * 100}
      />
      <ReadoutCard
        icon={<Droplets className="size-4" aria-hidden="true" />}
        label="REL. HUMIDITY"
        value={state.humidity.toFixed(1)}
        unit="%RH"
        sub={`Exhaust ${state.exhaustOn ? 'venting' : 'idle'} · Ambient ${state.ambientHumidity}%`}
        accent="blue"
        barPct={state.humidity}
      />
      <ReadoutCard
        icon={<Scale className="size-4" aria-hidden="true" />}
        label="LOAD CELL (MA-8)"
        value={state.weight.toFixed(3)}
        unit="kg"
        sub={`Raw ${state.rawWeight.toFixed(3)} kg · water removed ${weightLossPct.toFixed(1)}% of ${state.initialWeight.toFixed(1)} kg`}
        accent="green"
        barPct={(state.weight / state.initialWeight) * 100}
      />
      <ReadoutCard
        icon={<Wheat className="size-4" aria-hidden="true" />}
        label="GRAIN MOISTURE"
        value={state.moisture.toFixed(1)}
        unit="%"
        sub={
          state.dryingRate !== null
            ? `Rate ${state.dryingRate.toFixed(1)}%/hr · target ${state.targetMoisture}% · ${Math.min(100, Math.max(0, dryProgress)).toFixed(0)}% done`
            : `Target ${state.targetMoisture}% · Progress ${Math.min(100, Math.max(0, dryProgress)).toFixed(0)}%`
        }
        accent="amber"
        barPct={dryProgress}
      />
    </div>
  )
}
