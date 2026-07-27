'use client'

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download } from 'lucide-react'
import type { HistoryPoint } from '@/hooks/use-dryer-simulation'

function exportCsv(history: HistoryPoint[]) {
  const header = 'time_min,chamber_temp_c,humidity_rh,weight_kg,moisture_pct'
  const rows = history.map(
    (p) => `${p.t},${p.temp},${p.humidity},${p.weight},${p.moisture}`
  )
  const blob = new Blob([[header, ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `agridry-batch-log-${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const AXIS = 'oklch(0.55 0.01 240)'
const GRID = 'oklch(1 0 0 / 8%)'

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-2 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="h-44">{children}</div>
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: 'oklch(0.2 0.006 240)',
  border: '1px solid oklch(1 0 0 / 12%)',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'monospace',
}

export function TrendCharts({ history }: { history: HistoryPoint[] }) {
  const data = history.length > 0 ? history : [{ t: 0, temp: 29, humidity: 68, weight: 5, moisture: 28 }]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => exportCsv(history)}
          disabled={history.length === 0}
          className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="size-3.5" aria-hidden="true" />
          EXPORT CSV ({history.length} SAMPLES)
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
      <ChartCard title="TEMP & HUMIDITY TREND">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="t"
              stroke={AXIS}
              fontSize={10}
              tickLine={false}
              tickFormatter={(v: number) => `${v}m`}
            />
            <YAxis stroke={AXIS} fontSize={10} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v) => `t = ${v} min`}
            />
            <Line
              type="monotone"
              dataKey="temp"
              name="Temp (°C)"
              stroke="oklch(0.68 0.2 40)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity (%RH)"
              stroke="oklch(0.7 0.12 230)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="WEIGHT & MOISTURE TREND">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="t"
              stroke={AXIS}
              fontSize={10}
              tickLine={false}
              tickFormatter={(v: number) => `${v}m`}
            />
            <YAxis
              yAxisId="w"
              stroke={AXIS}
              fontSize={10}
              tickLine={false}
              domain={[3.5, 5.2]}
            />
            <YAxis
              yAxisId="m"
              orientation="right"
              stroke={AXIS}
              fontSize={10}
              tickLine={false}
              domain={[0, 30]}
              hide
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v) => `t = ${v} min`}
            />
            <Line
              yAxisId="w"
              type="monotone"
              dataKey="weight"
              name="Weight (kg)"
              stroke="oklch(0.78 0.17 155)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="m"
              type="monotone"
              dataKey="moisture"
              name="Moisture (%)"
              stroke="oklch(0.8 0.16 80)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      </div>
    </div>
  )
}
