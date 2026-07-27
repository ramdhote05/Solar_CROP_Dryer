'use client'

import { CircleAlert, Info, MessageSquareText, TriangleAlert } from 'lucide-react'
import type { LogEvent } from '@/hooks/use-dryer-simulation'
import { cn } from '@/lib/utils'

const LEVEL_META = {
  info: { icon: Info, className: 'text-muted-foreground' },
  warn: { icon: TriangleAlert, className: 'text-warning' },
  alarm: { icon: CircleAlert, className: 'text-destructive' },
  sms: { icon: MessageSquareText, className: 'text-[oklch(0.7_0.12_230)]' },
} as const

function formatSimTime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function EventLog({ events }: { events: LogEvent[] }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
        EVENT LOG · GSM SMS ALERTS
      </h2>
      <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1 lg:max-h-none lg:flex-1">
        {events.map((e) => {
          const meta = LEVEL_META[e.level]
          const Icon = meta.icon
          return (
            <li
              key={e.id}
              className={cn(
                'flex items-start gap-2 rounded-md px-2 py-1.5 text-xs leading-relaxed',
                e.level === 'alarm' && 'bg-destructive/10',
                e.level === 'sms' && 'bg-[oklch(0.7_0.12_230)]/5'
              )}
            >
              <Icon
                className={cn('mt-0.5 size-3.5 shrink-0', meta.className)}
                aria-hidden="true"
              />
              <span className="font-mono tabular-nums text-muted-foreground">
                {formatSimTime(e.simTime)}
              </span>
              <span className={cn(e.level === 'alarm' ? 'text-destructive' : 'text-foreground/90')}>
                {e.message}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
