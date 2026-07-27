'use client'

import { Cpu, OctagonMinus, Signal } from 'lucide-react'
import type { DryerState } from '@/hooks/use-dryer-simulation'
import { cn } from '@/lib/utils'

function formatSimTime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const MODE_STYLES: Record<DryerState['mode'], string> = {
  STANDBY: 'bg-muted text-muted-foreground',
  DRYING: 'bg-primary/15 text-primary',
  COMPLETE: 'bg-primary/15 text-primary',
  'E-STOP': 'bg-destructive/20 text-destructive',
  FAULT: 'bg-warning/15 text-warning',
}

export function StatusHeader({
  state,
  onEstop,
  onResetEstop,
}: {
  state: DryerState
  onEstop: () => void
  onResetEstop: () => void
}) {
  const estopped = state.mode === 'E-STOP'
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/15">
            <Cpu className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-wider">
              AGRIDRY CDS-01
            </h1>
            <p className="text-xs text-muted-foreground">
              IoT Crop Drying Control Unit · ESP-32
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3 md:gap-5">
          <span
            className={cn(
              'rounded-md px-3 py-1.5 font-mono text-xs font-bold tracking-widest',
              MODE_STYLES[state.mode]
            )}
          >
            {state.mode === 'DRYING' && (
              <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-primary align-middle" />
            )}
            {state.mode}
          </span>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-muted-foreground">RUN TIME</span>
            <span className="font-mono text-sm tabular-nums">
              {formatSimTime(state.simMinutes)}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5"
            aria-label={`GSM signal strength ${state.gsmSignal} of 4 bars`}
          >
            <Signal className="size-4 text-muted-foreground" aria-hidden="true" />
            <div className="flex items-end gap-0.5" aria-hidden="true">
              {[1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    'w-1 rounded-sm',
                    bar <= state.gsmSignal ? 'bg-primary' : 'bg-muted'
                  )}
                  style={{ height: `${4 + bar * 3}px` }}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-muted-foreground">GSM</span>
          </div>

          {estopped ? (
            <button
              type="button"
              onClick={onResetEstop}
              className="rounded-md border border-warning/50 bg-warning/10 px-4 py-2 font-mono text-xs font-bold tracking-wider text-warning transition-colors hover:bg-warning/20"
            >
              RESET E-STOP
            </button>
          ) : (
            <button
              type="button"
              onClick={onEstop}
              className="flex items-center gap-2 rounded-md border-2 border-destructive bg-destructive/15 px-4 py-2 font-mono text-xs font-bold tracking-wider text-destructive transition-colors hover:bg-destructive hover:text-white"
              aria-label="Emergency stop - cuts all outputs immediately"
            >
              <OctagonMinus className="size-4" aria-hidden="true" />
              E-STOP
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
