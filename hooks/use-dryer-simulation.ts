'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SystemMode = 'STANDBY' | 'DRYING' | 'COMPLETE' | 'E-STOP' | 'FAULT'

export interface CropPreset {
  id: string
  name: string
  targetMoisture: number
  targetTemp: number
  image: string
}

export const CROP_PRESETS: CropPreset[] = [
  { id: 'soyabean', name: 'Soyabean', targetMoisture: 13, targetTemp: 50, image: '/crops/soyabean.png' },
  { id: 'tur', name: 'Tur', targetMoisture: 12.5, targetTemp: 60, image: '/crops/tur.png' },
  { id: 'chili', name: 'Chili', targetMoisture: 10, targetTemp: 55, image: '/crops/chili.png' },
]

export const CUSTOM_CROP_IMAGE = '/crops/custom.png'

export interface LogEvent {
  id: number
  simTime: number
  level: 'info' | 'warn' | 'alarm' | 'sms'
  message: string
}

export interface HistoryPoint {
  t: number
  temp: number
  humidity: number
  weight: number
  moisture: number
}

export interface BatchRecord {
  id: number
  crop: string
  cropName: string
  finishedAt: number
  durationMin: number
  initialMoisture: number
  finalMoisture: number
  initialWeight: number
  finalWeight: number
  waterRemoved: number
  avgRate: number
  peakTemp: number
  energyKwh: number
  cost: number
}

export interface DryerState {
  mode: SystemMode
  simMinutes: number
  chamberTemp: number
  ambientTemp: number
  humidity: number
  ambientHumidity: number
  targetTemp: number
  moisture: number
  targetMoisture: number
  weight: number
  initialWeight: number
  heaterDuty: number
  ssrOn: boolean
  blowerOn: boolean
  exhaustOn: boolean
  exhaustAuto: boolean
  gsmSignal: number
  overTemp: boolean
  crop: string
  dryingRate: number | null
  rawWeight: number
  lastTareAt: number | null
  batchStartAt: number | null
  batchStartMoisture: number
  batchStartWeight: number
  energyWh: number
  peakTemp: number
  events: LogEvent[]
  history: HistoryPoint[]
}

const INITIAL_MOISTURE = 28
const TARGET_MOISTURE = 12
const INITIAL_WEIGHT = 5.0
const DRY_MASS = INITIAL_WEIGHT * (1 - INITIAL_MOISTURE / 100)
const OVER_TEMP_LIMIT = 70
const TICK_MS = 600 // 1 tick = 1 simulated minute

// Rated power draw for energy estimation (typical bench-scale build)
export const HEATER_RATED_W = 1000 // PTC heater
export const BLOWER_RATED_W = 60 // centrifugal blower
export const EXHAUST_RATED_W = 25 // exhaust fan
export const TARIFF_PER_KWH = 8 // ₹/kWh (domestic tariff estimate)

function initialState(): DryerState {
  return {
    mode: 'STANDBY',
    simMinutes: 0,
    chamberTemp: 29.4,
    ambientTemp: 29.4,
    humidity: 68,
    ambientHumidity: 68,
    targetTemp: 55,
    moisture: INITIAL_MOISTURE,
    targetMoisture: TARGET_MOISTURE,
    weight: INITIAL_WEIGHT,
    initialWeight: INITIAL_WEIGHT,
    heaterDuty: 0,
    ssrOn: false,
    blowerOn: false,
    exhaustOn: false,
    exhaustAuto: true,
    gsmSignal: 4,
    overTemp: false,
    crop: 'custom',
    dryingRate: null,
    rawWeight: INITIAL_WEIGHT,
    lastTareAt: 0,
    batchStartAt: null,
    batchStartMoisture: INITIAL_MOISTURE,
    batchStartWeight: INITIAL_WEIGHT,
    energyWh: 0,
    peakTemp: 29.4,
    events: [
      {
        id: 1,
        simTime: 0,
        level: 'info',
        message: 'ESP-32 boot OK · sensors initialized · load cell tared',
      },
      {
        id: 2,
        simTime: 0,
        level: 'info',
        message: 'GSM module registered on network (SIM ready)',
      },
    ],
    history: [],
  }
}

let eventId = 2

let batchRecordId = 0

export function useDryerSimulation() {
  const [state, setState] = useState<DryerState>(initialState)
  const [completedBatches, setCompletedBatches] = useState<BatchRecord[]>([])
  const stateRef = useRef(state)
  stateRef.current = state
  // Moving-average buffer for the simulated HX711 raw samples (blower vibration noise)
  const rawBufferRef = useRef<number[]>([])

  const pushEvent = useCallback(
    (level: LogEvent['level'], message: string) => {
      setState((s) => ({
        ...s,
        events: [
          { id: ++eventId, simTime: s.simMinutes, level, message },
          ...s.events,
        ].slice(0, 60),
      }))
    },
    []
  )

  // Main simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => {
        const jitter = (mag: number) => (Math.random() - 0.5) * mag

        if (s.mode !== 'DRYING' && s.mode !== 'FAULT') {
          // Passive cool-down toward ambient
          const cooled =
            s.chamberTemp + (s.ambientTemp - s.chamberTemp) * 0.04 + jitter(0.1)
          const hum =
            s.humidity + (s.ambientHumidity - s.humidity) * 0.03 + jitter(0.3)
          return {
            ...s,
            chamberTemp: cooled,
            humidity: Math.min(99, Math.max(10, hum)),
            heaterDuty: 0,
            ssrOn: false,
            dryingRate: null,
            rawWeight: s.weight + jitter(0.003),
            gsmSignal: Math.random() < 0.05 ? 3 : 4,
          }
        }

        const simMinutes = s.simMinutes + 1

        // --- SSR / PTC heater control (P-controller on target temp) ---
        let heaterDuty = 0
        if (s.mode === 'DRYING' && !s.overTemp) {
          heaterDuty = Math.min(
            100,
            Math.max(0, (s.targetTemp - s.chamberTemp) * 22)
          )
        }
        const ssrOn = heaterDuty > 2

        // --- Thermal model ---
        const airflowLoss = (s.blowerOn ? 0.10 : 0) + (s.exhaustOn ? 0.06 : 0)
        let chamberTemp =
          s.chamberTemp +
          (heaterDuty / 100) * 2.1 -
          (s.chamberTemp - s.ambientTemp) * (0.055 + airflowLoss * 0.35) +
          jitter(0.25)

        // --- Evaporation / drying model ---
        const tempFactor = Math.max(0, chamberTemp - 32) / 28
        const airflowFactor = s.blowerOn ? 1 : 0.25
        const moistureFactor = Math.max(0, s.moisture - 6) / INITIAL_MOISTURE
        const evap = 0.11 * tempFactor * airflowFactor * moistureFactor
        const moisture = Math.max(5, s.moisture - evap)

        // --- HX711 load cell: raw sample with vibration noise + 8-sample MA filter ---
        const trueWeight = DRY_MASS / (1 - moisture / 100)
        const vibrationNoise = s.blowerOn ? jitter(0.035) : jitter(0.004)
        const rawWeight = trueWeight + vibrationNoise
        const buf = rawBufferRef.current
        buf.push(rawWeight)
        if (buf.length > 8) buf.shift()
        const weight = buf.reduce((a, b) => a + b, 0) / buf.length

        // --- Drying rate (%/hour moisture loss over a 12-min window) ---
        let dryingRate: number | null = s.dryingRate
        const windowPoint = s.history[s.history.length - 12]
        if (windowPoint) {
          dryingRate = (windowPoint.moisture - moisture) * (60 / 12)
        }

        // --- Humidity model ---
        let humidity =
          s.humidity +
          evap * 55 -
          (s.exhaustOn
            ? (s.humidity - s.ambientHumidity * 0.55) * 0.12
            : (s.humidity - s.ambientHumidity) * 0.015) +
          jitter(0.6)
        humidity = Math.min(99, Math.max(12, humidity))

        // --- Auto exhaust logic ---
        let exhaustOn = s.exhaustOn
        if (s.exhaustAuto && s.mode === 'DRYING') {
          if (humidity > 62) exhaustOn = true
          else if (humidity < 46) exhaustOn = false
        }

        // --- Safety: over-temperature ---
        let overTemp = s.overTemp
        let mode: SystemMode = s.mode
        if (chamberTemp >= OVER_TEMP_LIMIT && !overTemp) {
          overTemp = true
          mode = 'FAULT'
        }
        if (overTemp) {
          heaterDuty = 0
          chamberTemp -= 0.4
          if (chamberTemp < s.targetTemp - 5) {
            overTemp = false
            mode = 'DRYING'
          }
        }

        // --- Completion ---
        if (mode === 'DRYING' && moisture <= s.targetMoisture) {
          mode = 'COMPLETE'
        }

        // --- Energy accumulation (Wh per simulated minute) ---
        const loadW =
          (heaterDuty / 100) * HEATER_RATED_W +
          (s.blowerOn ? BLOWER_RATED_W : 0) +
          (exhaustOn ? EXHAUST_RATED_W : 0)
        const energyWh = s.energyWh + loadW / 60
        const peakTemp = Math.max(s.peakTemp, chamberTemp)

        const point: HistoryPoint = {
          t: simMinutes,
          temp: Number(chamberTemp.toFixed(1)),
          humidity: Number(humidity.toFixed(1)),
          weight: Number(weight.toFixed(3)),
          moisture: Number(moisture.toFixed(1)),
        }

        return {
          ...s,
          mode,
          simMinutes,
          chamberTemp,
          humidity,
          heaterDuty,
          ssrOn,
          exhaustOn,
          moisture,
          weight,
          rawWeight,
          dryingRate,
          overTemp,
          energyWh,
          peakTemp,
          gsmSignal: Math.random() < 0.06 ? 3 : 4,
          history: [...s.history, point].slice(-240),
        }
      })
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [])

  // Event side-effects on mode transitions
  const prevMode = useRef<SystemMode>('STANDBY')
  const prevOverTemp = useRef(false)
  useEffect(() => {
    if (state.mode !== prevMode.current) {
      if (state.mode === 'COMPLETE') {
        const s = state
        const durationMin =
          s.batchStartAt !== null ? s.simMinutes - s.batchStartAt : 0
        const durationHr = Math.max(durationMin / 60, 1 / 60)
        const waterRemoved = Math.max(0, s.batchStartWeight - s.weight)
        const moistureDrop = Math.max(0, s.batchStartMoisture - s.moisture)
        const energyKwh = s.energyWh / 1000
        const cropName =
          CROP_PRESETS.find((p) => p.id === s.crop)?.name ?? 'Custom setpoints'
        setCompletedBatches((prev) =>
          [
            {
              id: ++batchRecordId,
              crop: s.crop,
              cropName,
              finishedAt: Date.now(),
              durationMin,
              initialMoisture: s.batchStartMoisture,
              finalMoisture: s.moisture,
              initialWeight: s.batchStartWeight,
              finalWeight: s.weight,
              waterRemoved,
              avgRate: moistureDrop / durationHr,
              peakTemp: s.peakTemp,
              energyKwh,
              cost: energyKwh * TARIFF_PER_KWH,
            },
            ...prev,
          ].slice(0, 20)
        )
        pushEvent(
          'info',
          `Target moisture ${state.targetMoisture}% reached · heater OFF · cool-down`
        )
        pushEvent(
          'sms',
          'SMS → +91-XXXXX: "AgriDry: Batch complete. Final weight ' +
            state.weight.toFixed(2) +
            ' kg, moisture ' +
            state.moisture.toFixed(1) +
            '%."'
        )
      }
      if (state.mode === 'FAULT') {
        pushEvent('alarm', `OVER-TEMP ${OVER_TEMP_LIMIT}°C · SSR interlocked OFF`)
        pushEvent('sms', 'SMS → +91-XXXXX: "AgriDry ALERT: Over-temperature fault!"')
      }
      prevMode.current = state.mode
    }
    if (state.overTemp !== prevOverTemp.current) {
      if (!state.overTemp && state.mode === 'DRYING') {
        pushEvent('info', 'Temperature back in range · SSR re-enabled')
      }
      prevOverTemp.current = state.overTemp
    }
  }, [state.mode, state.overTemp, state.weight, pushEvent])

  // --- Actions ---
  const startDrying = useCallback(() => {
    const s = stateRef.current
    if (s.mode === 'E-STOP') return
    setState((prev) => {
      const freshBatch = prev.batchStartAt === null || prev.mode === 'COMPLETE'
      return {
        ...prev,
        mode: 'DRYING',
        blowerOn: true,
        overTemp: false,
        batchStartAt: freshBatch ? prev.simMinutes : prev.batchStartAt,
        batchStartMoisture: freshBatch ? prev.moisture : prev.batchStartMoisture,
        batchStartWeight: freshBatch ? prev.weight : prev.batchStartWeight,
        energyWh: freshBatch ? 0 : prev.energyWh,
        peakTemp: freshBatch ? prev.chamberTemp : prev.peakTemp,
      }
    })
    pushEvent('info', `Drying started · setpoint ${s.targetTemp}°C · blower ON`)
    pushEvent('sms', 'SMS → +91-XXXXX: "AgriDry: Drying cycle started."')
  }, [pushEvent])

  const stopDrying = useCallback(() => {
    setState((prev) => ({ ...prev, mode: 'STANDBY', blowerOn: false, exhaustOn: false }))
    pushEvent('warn', 'Drying stopped by operator · outputs OFF')
  }, [pushEvent])

  const setTargetTemp = useCallback((t: number) => {
    setState((prev) => ({ ...prev, targetTemp: t, crop: 'custom' }))
  }, [])

  const setTargetMoisture = useCallback((m: number) => {
    setState((prev) => {
      // If raising the target above current moisture mid-run, complete immediately
      let mode = prev.mode
      if (prev.mode === 'COMPLETE' && m < prev.moisture) {
        // Lowered target below current level → resume drying
        mode = 'DRYING'
      }
      return { ...prev, targetMoisture: m, mode, crop: 'custom' }
    })
  }, [])

  const applyCropPreset = useCallback(
    (id: string) => {
      const preset = CROP_PRESETS.find((p) => p.id === id)
      if (!preset) {
        setState((prev) => ({ ...prev, crop: 'custom' }))
        return
      }
      setState((prev) => {
        let mode = prev.mode
        if (prev.mode === 'COMPLETE' && preset.targetMoisture < prev.moisture) {
          mode = 'DRYING'
        }
        return {
          ...prev,
          crop: preset.id,
          targetTemp: preset.targetTemp,
          targetMoisture: preset.targetMoisture,
          mode,
        }
      })
      pushEvent(
        'info',
        `Crop preset: ${preset.name} · setpoint ${preset.targetTemp}°C · cutoff ${preset.targetMoisture}%`
      )
    },
    [pushEvent]
  )

  const tareLoadCell = useCallback(() => {
    const s = stateRef.current
    if (s.mode === 'DRYING' || s.mode === 'FAULT') return
    rawBufferRef.current = []
    setState((prev) => ({ ...prev, lastTareAt: prev.simMinutes }))
    pushEvent('info', 'HX711 tare: zero offset captured · MA filter buffer flushed')
    pushEvent('info', 'Calibration factor loaded from NVS (known-mass method)')
  }, [pushEvent])

  const toggleBlower = useCallback(() => {
    setState((prev) => {
      return { ...prev, blowerOn: !prev.blowerOn }
    })
    pushEvent(
      'info',
      `Centrifugal blower ${stateRef.current.blowerOn ? 'OFF' : 'ON'} (manual)`
    )
  }, [pushEvent])

  const toggleExhaust = useCallback(() => {
    setState((prev) => ({
      ...prev,
      exhaustOn: !prev.exhaustOn,
      exhaustAuto: false,
    }))
    pushEvent(
      'info',
      `Exhaust fan ${stateRef.current.exhaustOn ? 'OFF' : 'ON'} (manual override)`
    )
  }, [pushEvent])

  const setExhaustAuto = useCallback(() => {
    setState((prev) => ({ ...prev, exhaustAuto: true }))
    pushEvent('info', 'Exhaust fan returned to AUTO (humidity-controlled)')
  }, [pushEvent])

  const triggerEstop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: 'E-STOP',
      blowerOn: false,
      exhaustOn: false,
      heaterDuty: 0,
      ssrOn: false,
    }))
    pushEvent('alarm', 'EMERGENCY STOP pressed · ALL OUTPUTS CUT')
    pushEvent('sms', 'SMS → +91-XXXXX: "AgriDry ALERT: Emergency stop activated!"')
  }, [pushEvent])

  const resetEstop = useCallback(() => {
    setState((prev) => ({ ...prev, mode: 'STANDBY', overTemp: false }))
    pushEvent('info', 'E-Stop released · system reset to STANDBY')
  }, [pushEvent])

  const resetBatch = useCallback(() => {
    eventId = 2
    rawBufferRef.current = []
    setState(initialState())
  }, [])

  const clearHistory = useCallback(() => {
    setCompletedBatches([])
  }, [])

  return {
    state,
    completedBatches,
    actions: {
      startDrying,
      stopDrying,
      setTargetTemp,
      setTargetMoisture,
      applyCropPreset,
      tareLoadCell,
      toggleBlower,
      toggleExhaust,
      setExhaustAuto,
      triggerEstop,
      resetEstop,
      resetBatch,
      clearHistory,
    },
  }
}
