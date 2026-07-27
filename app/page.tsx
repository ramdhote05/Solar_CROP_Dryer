'use client'

import { BatchHistory } from '@/components/dryer/batch-history'
import { BatchSummary } from '@/components/dryer/batch-summary'
import { ChamberSchematic } from '@/components/dryer/chamber-schematic'
import { ControlPanel } from '@/components/dryer/control-panel'
import { EventLog } from '@/components/dryer/event-log'
import { LiveBatch } from '@/components/dryer/live-batch'
import { SensorPanel } from '@/components/dryer/sensor-panel'
import { StatusHeader } from '@/components/dryer/status-header'
import { TrendCharts } from '@/components/dryer/trend-charts'
import { useDryerSimulation } from '@/hooks/use-dryer-simulation'

export default function Page() {
  const { state, completedBatches, actions } = useDryerSimulation()

  return (
    <div className="min-h-svh">
      <StatusHeader
        state={state}
        onEstop={actions.triggerEstop}
        onResetEstop={actions.resetEstop}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
        {state.mode === 'E-STOP' && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 font-mono text-sm font-bold tracking-wider text-destructive"
          >
            EMERGENCY STOP ACTIVE — HEATER, BLOWER AND EXHAUST DE-ENERGIZED.
            RESET TO CONTINUE.
          </div>
        )}
        {state.mode === 'DRYING' &&
          state.dryingRate !== null &&
          state.dryingRate < 0.6 && (
            <div
              role="alert"
              className="rounded-md border border-warning/50 bg-warning/10 px-4 py-3 font-mono text-sm font-bold tracking-wider text-warning"
            >
              DRYING STALLED — RATE {state.dryingRate.toFixed(1)}%/HR. CHECK
              BLOWER AIRFLOW AND HEATER OUTPUT.
            </div>
          )}
        {state.mode === 'COMPLETE' && (
          <div
            role="status"
            className="rounded-md border border-primary/50 bg-primary/10 px-4 py-3 font-mono text-sm font-bold tracking-wider text-primary"
          >
            BATCH COMPLETE — TARGET MOISTURE {state.targetMoisture}% REACHED.
            FINAL WEIGHT {state.weight.toFixed(2)} kg. START A NEW BATCH TO RUN
            AGAIN.
          </div>
        )}
        {state.mode === 'COMPLETE' && <BatchSummary state={state} />}

        {(state.mode === 'DRYING' || state.mode === 'FAULT') && (
          <LiveBatch state={state} />
        )}

        <SensorPanel state={state} />

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <ChamberSchematic state={state} />
            <TrendCharts history={state.history} />
          </div>
          <div className="flex flex-col gap-4">
            <ControlPanel state={state} actions={actions} />
            <EventLog events={state.events} />
          </div>
        </div>

        <BatchHistory
          batches={completedBatches}
          onClear={actions.clearHistory}
        />

        <footer className="pb-4 text-center font-mono text-xs text-muted-foreground">
          SIMULATED WORKING MODEL · 1 TICK = 1 PROCESS MINUTE · ESP-32 · PTC
          HEATER · SSR · GSM · HX711 LOAD CELL
        </footer>
      </main>
    </div>
  )
}
