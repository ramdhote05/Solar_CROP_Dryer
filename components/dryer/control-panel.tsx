'use client'

import { Fan, Flame, Play, RotateCcw, Scale, Square, Wheat, Wind } from 'lucide-react'
import {
  CROP_PRESETS,
  CUSTOM_CROP_IMAGE,
  type DryerState,
} from '@/hooks/use-dryer-simulation'
import { cn } from '@/lib/utils'

function Toggle({
  label,
  icon,
  on,
  disabled,
  onClick,
  detail,
}: {
  label: string
  icon: React.ReactNode
  on: boolean
  disabled?: boolean
  onClick: () => void
  detail: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={cn(
        'flex items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        on
          ? 'border-primary/50 bg-primary/10'
          : 'border-border bg-secondary hover:bg-muted'
      )}
    >
      <span className="flex items-center gap-2.5">
        <span className={on ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <span>
          <span className="block text-sm font-medium">{label}</span>
          <span className="block text-xs text-muted-foreground">{detail}</span>
        </span>
      </span>
      <span
        className={cn(
          'rounded px-2 py-0.5 font-mono text-xs font-bold',
          on ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        {on ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

export function ControlPanel({
  state,
  actions,
}: {
  state: DryerState
  actions: {
    startDrying: () => void
    stopDrying: () => void
    setTargetTemp: (t: number) => void
    setTargetMoisture: (m: number) => void
    applyCropPreset: (id: string) => void
    tareLoadCell: () => void
    toggleBlower: () => void
    toggleExhaust: () => void
    setExhaustAuto: () => void
    resetBatch: () => void
  }
}) {
  const estopped = state.mode === 'E-STOP'
  const drying = state.mode === 'DRYING' || state.mode === 'FAULT'
  const selectedCrop = CROP_PRESETS.find((p) => p.id === state.crop) ?? null

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <h2 className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
        OPERATOR CONTROLS
      </h2>

      {/* Crop preset */}
      <div className="overflow-hidden rounded-md border border-border bg-secondary/50">
        <div className="relative h-28 w-full">
          <img
            key={selectedCrop?.id ?? 'custom'}
            src={selectedCrop?.image ?? CUSTOM_CROP_IMAGE}
            alt={
              selectedCrop
                ? `${selectedCrop.name} on the drying tray`
                : 'Mixed grains on the drying tray'
            }
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-foreground backdrop-blur-sm">
            {selectedCrop ? selectedCrop.name.toUpperCase() : 'CUSTOM BATCH'}
          </span>
        </div>
        <div className="p-3">
        <label
          htmlFor="crop-preset"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Wheat className="size-4 text-primary" aria-hidden="true" />
          Crop preset
        </label>
        <select
          id="crop-preset"
          value={state.crop}
          disabled={estopped}
          onChange={(e) => actions.applyCropPreset(e.target.value)}
          className="mt-2 w-full rounded-md border border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <option value="custom">Custom (manual setpoints)</option>
          {CROP_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.targetMoisture}% MC · {p.targetTemp}°C
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Auto-sets safe storage moisture cutoff &amp; drying temperature ·
          adjusting a slider switches to Custom
        </p>
        </div>
      </div>

      {/* Start / Stop / Reset */}
      <div className="grid grid-cols-2 gap-2">
        {drying ? (
          <button
            type="button"
            onClick={actions.stopDrying}
            className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-mono text-sm font-bold tracking-wider text-secondary-foreground transition-colors hover:bg-muted"
          >
            <Square className="size-4" aria-hidden="true" />
            STOP
          </button>
        ) : (
          <button
            type="button"
            onClick={actions.startDrying}
            disabled={estopped || state.mode === 'COMPLETE'}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-mono text-sm font-bold tracking-wider text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="size-4" aria-hidden="true" />
            START DRYING
          </button>
        )}
        <button
          type="button"
          onClick={actions.resetBatch}
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-3 font-mono text-sm font-bold tracking-wider transition-colors hover:bg-muted"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          NEW BATCH
        </button>
      </div>

      {/* Temperature setpoint */}
      <div className="rounded-md border border-border bg-secondary/50 p-3">
        <div className="flex items-center justify-between">
          <label htmlFor="setpoint" className="text-sm font-medium">
            Drying setpoint
          </label>
          <span className="font-mono text-lg font-bold tabular-nums text-[oklch(0.68_0.2_40)]">
            {state.targetTemp}°C
          </span>
        </div>
        <input
          id="setpoint"
          type="range"
          min={40}
          max={65}
          step={1}
          value={state.targetTemp}
          disabled={estopped}
          onChange={(e) => actions.setTargetTemp(Number(e.target.value))}
          className="mt-2 w-full accent-[oklch(0.68_0.2_40)]"
        />
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>40°C</span>
          <span>Safety cutoff: 70°C</span>
          <span>65°C</span>
        </div>
      </div>

      {/* Moisture cutoff setpoint */}
      <div className="rounded-md border border-border bg-secondary/50 p-3">
        <div className="flex items-center justify-between">
          <label htmlFor="moisture-setpoint" className="text-sm font-medium">
            Moisture cutoff
          </label>
          <span className="font-mono text-lg font-bold tabular-nums text-[oklch(0.75_0.13_200)]">
            {state.targetMoisture.toFixed(1)}%
          </span>
        </div>
        <input
          id="moisture-setpoint"
          type="range"
          min={6}
          max={20}
          step={0.5}
          value={state.targetMoisture}
          disabled={estopped}
          onChange={(e) => actions.setTargetMoisture(Number(e.target.value))}
          className="mt-2 w-full accent-[oklch(0.75_0.13_200)]"
        />
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>6%</span>
          <span>Auto-stop when grain reaches target</span>
          <span>20%</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Current grain moisture:{' '}
          <span className="font-mono font-bold text-foreground">
            {state.moisture.toFixed(1)}%
          </span>{' '}
          · heater &amp; cycle stop automatically at cutoff
        </p>
      </div>

      {/* SSR / heater duty */}
      <div className="rounded-md border border-border bg-secondary/50 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Flame
              className={cn(
                'size-4',
                state.ssrOn ? 'text-[oklch(0.68_0.2_40)]' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            SSR → PTC Heater duty
          </span>
          <span className="font-mono text-sm font-bold tabular-nums">
            {state.heaterDuty.toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[oklch(0.68_0.2_40)] transition-all duration-500"
            style={{ width: `${state.heaterDuty}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          ESP-32 PWM via solid-state relay · {state.ssrOn ? 'conducting' : 'open'}
        </p>
      </div>

      {/* Fans */}
      <div className="flex flex-col gap-2">
        <Toggle
          label="Centrifugal blower"
          icon={<Fan className="size-4" aria-hidden="true" />}
          on={state.blowerOn}
          disabled={estopped}
          onClick={actions.toggleBlower}
          detail="Pushes heated air through the crop bed"
        />
        <Toggle
          label="Exhaust fan"
          icon={<Wind className="size-4" aria-hidden="true" />}
          on={state.exhaustOn}
          disabled={estopped}
          onClick={actions.toggleExhaust}
          detail={
            state.exhaustAuto
              ? 'AUTO · vents when humidity > 62%RH'
              : 'MANUAL override active'
          }
        />
        {!state.exhaustAuto && (
          <button
            type="button"
            onClick={actions.setExhaustAuto}
            className="self-end font-mono text-xs text-primary underline-offset-2 hover:underline"
          >
            Return exhaust to AUTO
          </button>
        )}
      </div>

      {/* Load cell tare / calibrate */}
      <div className="rounded-md border border-border bg-secondary/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Scale className="size-4 text-primary" aria-hidden="true" />
            Load cell (HX711)
          </span>
          <button
            type="button"
            onClick={actions.tareLoadCell}
            disabled={drying || estopped}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            TARE / CALIBRATE
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {drying
            ? 'Tare locked while drying — stop the cycle first'
            : 'Zero the scale with an empty tray before loading crop'}
          {' · '}8-sample moving average filters blower vibration
          {state.lastTareAt !== null && (
            <>
              {' · '}last tared at{' '}
              <span className="font-mono text-foreground">
                t={state.lastTareAt}m
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
