'use client'

import type { DryerState } from '@/hooks/use-dryer-simulation'

function FanBlades({
  cx,
  cy,
  r,
  spinning,
  speed,
  color,
}: {
  cx: number
  cy: number
  r: number
  spinning: boolean
  speed: number
  color: string
}) {
  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: spinning ? `dryer-spin ${speed}s linear infinite` : 'none',
      }}
    >
      {[0, 90, 180, 270].map((a) => (
        <path
          key={a}
          d={`M ${cx} ${cy} L ${cx + r * Math.cos((a * Math.PI) / 180)} ${
            cy + r * Math.sin((a * Math.PI) / 180)
          }`}
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  )
}

export function ChamberSchematic({ state }: { state: DryerState }) {
  const heaterActive = state.heaterDuty > 2
  const heaterGlow = Math.min(1, state.heaterDuty / 100 + 0.25)
  const drying = state.mode === 'DRYING'

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
          CHAMBER SCHEMATIC · LIVE
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          STEEL ENCLOSURE · CUTAWAY VIEW
        </span>
      </div>

      <style>{`
        @keyframes dryer-spin { to { transform: rotate(360deg); } }
        @keyframes dryer-heat { 0%,100% { opacity: .35 } 50% { opacity: .9 } }
        @keyframes dryer-flow { to { stroke-dashoffset: -24; } }
      `}</style>

      <svg
        viewBox="0 0 640 380"
        className="w-full"
        role="img"
        aria-label="Cutaway schematic of the crop drying chamber showing heater, blower, exhaust fan, crop tray, load cell and sensors"
      >
        {/* ===== Steel enclosure ===== */}
        <rect x="80" y="30" width="480" height="300" rx="8" fill="oklch(0.20 0.006 240)" stroke="oklch(0.45 0.01 240)" strokeWidth="3" />
        <rect x="92" y="42" width="456" height="240" rx="4" fill="oklch(0.16 0.005 240)" stroke="oklch(0.35 0.01 240)" strokeWidth="1.5" />
        {/* rivets */}
        {[100, 220, 340, 460, 540].map((x) => (
          <circle key={x} cx={x} cy={36} r={2} fill="oklch(0.5 0.01 240)" />
        ))}

        {/* ===== Bottom electronics compartment ===== */}
        <rect x="92" y="290" width="456" height="34" rx="3" fill="oklch(0.14 0.005 240)" stroke="oklch(0.35 0.01 240)" strokeWidth="1" />
        {/* ESP-32 */}
        <rect x="104" y="296" width="56" height="22" rx="2" fill="oklch(0.25 0.03 155)" stroke="oklch(0.78 0.17 155)" strokeWidth="1" />
        <text x="132" y="310" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.78 0.17 155)">ESP-32</text>
        <circle cx="112" cy="301" r="2" fill="oklch(0.78 0.17 155)">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
        {/* SSR */}
        <rect x="172" y="296" width="52" height="22" rx="2" fill={heaterActive ? 'oklch(0.3 0.06 40)' : 'oklch(0.22 0.006 240)'} stroke={heaterActive ? 'oklch(0.68 0.2 40)' : 'oklch(0.4 0.01 240)'} strokeWidth="1" />
        <text x="198" y="310" textAnchor="middle" fontSize="8" fontFamily="monospace" fill={heaterActive ? 'oklch(0.68 0.2 40)' : 'oklch(0.6 0.01 240)'}>SSR</text>
        {/* Fuse box */}
        <rect x="236" y="296" width="52" height="22" rx="2" fill="oklch(0.22 0.006 240)" stroke="oklch(0.4 0.01 240)" strokeWidth="1" />
        <text x="262" y="310" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.7 0.01 240)">FUSE</text>
        {/* PSU */}
        <rect x="300" y="296" width="60" height="22" rx="2" fill="oklch(0.22 0.006 240)" stroke="oklch(0.4 0.01 240)" strokeWidth="1" />
        <text x="330" y="310" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.7 0.01 240)">12V PSU</text>
        {/* GSM */}
        <rect x="372" y="296" width="52" height="22" rx="2" fill="oklch(0.22 0.02 230)" stroke="oklch(0.7 0.12 230)" strokeWidth="1" />
        <text x="398" y="310" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.7 0.12 230)">GSM</text>
        {/* wiring hint */}
        <path d="M 436 307 H 540" stroke="oklch(0.35 0.01 240)" strokeWidth="1" strokeDasharray="3 3" />

        {/* GSM antenna */}
        <line x1="398" y1="296" x2="398" y2="270" stroke="oklch(0.7 0.12 230)" strokeWidth="1.5" />
        <circle cx="398" cy="268" r="2.5" fill="oklch(0.7 0.12 230)" />

        {/* ===== PTC heater (bottom-left of chamber) ===== */}
        <g>
          <rect x="110" y="230" width="90" height="34" rx="3" fill={heaterActive ? `oklch(0.35 0.1 40 / ${heaterGlow})` : 'oklch(0.22 0.006 240)'} stroke={heaterActive ? 'oklch(0.68 0.2 40)' : 'oklch(0.45 0.01 240)'} strokeWidth="1.5" />
          {[122, 136, 150, 164, 178].map((x) => (
            <line key={x} x1={x} y1={236} x2={x} y2={258} stroke={heaterActive ? 'oklch(0.72 0.19 40)' : 'oklch(0.4 0.01 240)'} strokeWidth="2.5" />
          ))}
          <text x="155" y="277" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.65 0.01 240)">PTC HEATER</text>
          {/* heat waves */}
          {heaterActive &&
            [130, 152, 174].map((x, i) => (
              <path
                key={x}
                d={`M ${x} 226 q 4 -8 0 -16 q -4 -8 0 -16`}
                fill="none"
                stroke="oklch(0.68 0.2 40)"
                strokeWidth="1.5"
                style={{ animation: `dryer-heat 1.6s ease-in-out ${i * 0.3}s infinite` }}
              />
            ))}
        </g>

        {/* ===== Centrifugal blower (left) ===== */}
        <g>
          <circle cx="150" cy="120" r="30" fill="oklch(0.2 0.006 240)" stroke="oklch(0.5 0.01 240)" strokeWidth="2" />
          <circle cx="150" cy="120" r="24" fill="oklch(0.15 0.005 240)" stroke="oklch(0.35 0.01 240)" strokeWidth="1" />
          <FanBlades cx={150} cy={120} r={20} spinning={state.blowerOn} speed={0.5} color={state.blowerOn ? 'oklch(0.7 0.12 230)' : 'oklch(0.45 0.01 240)'} />
          <text x="150" y="165" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.65 0.01 240)">BLOWER</text>
          {/* duct */}
          <rect x="182" y="110" width="30" height="20" fill="none" stroke="oklch(0.4 0.01 240)" strokeWidth="1.5" />
        </g>

        {/* ===== Airflow path ===== */}
        {state.blowerOn && (
          <g>
            {[126, 148, 170].map((y) => (
              <path
                key={y}
                d={`M 214 ${y} H 400 q 40 0 60 -30 l 20 -30`}
                fill="none"
                stroke="oklch(0.7 0.12 230 / 0.55)"
                strokeWidth="2"
                strokeDasharray="8 16"
                style={{ animation: 'dryer-flow 1s linear infinite' }}
              />
            ))}
          </g>
        )}

        {/* ===== Crop tray + load cell ===== */}
        <g>
          {/* tray */}
          <rect x="250" y="185" width="200" height="14" rx="2" fill="oklch(0.3 0.01 240)" stroke="oklch(0.5 0.01 240)" strokeWidth="1.5" />
          {/* perforations */}
          {[265, 290, 315, 340, 365, 390, 415, 440].map((x) => (
            <line key={x} x1={x} y1={199} x2={x} y2={204} stroke="oklch(0.45 0.01 240)" strokeWidth="1" />
          ))}
          {/* grain pile */}
          <path d="M 258 185 Q 350 150 442 185 Z" fill="oklch(0.72 0.12 80)" stroke="oklch(0.6 0.11 70)" strokeWidth="1" />
          {[290, 320, 350, 380, 410].map((x, i) => (
            <circle key={x} cx={x} cy={176 - (i % 2) * 6} r={2.5} fill="oklch(0.62 0.12 70)" />
          ))}
          <text x="350" y="145" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.72 0.12 80)">
            CROP BED · {state.weight.toFixed(2)} kg
          </text>
          {/* load cell */}
          <rect x="330" y="206" width="40" height="14" rx="2" fill="oklch(0.25 0.006 240)" stroke="oklch(0.78 0.17 155)" strokeWidth="1.2" />
          <line x1="350" y1="199" x2="350" y2="206" stroke="oklch(0.5 0.01 240)" strokeWidth="2" />
          <text x="350" y="234" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.78 0.17 155)">LOAD CELL</text>
        </g>

        {/* ===== Sensors (top center) ===== */}
        <g>
          <rect x="300" y="48" width="14" height="26" rx="2" fill="oklch(0.25 0.006 240)" stroke="oklch(0.68 0.2 40)" strokeWidth="1.2" />
          <text x="307" y="90" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.68 0.2 40)">TEMP</text>
          <rect x="336" y="48" width="14" height="26" rx="2" fill="oklch(0.25 0.006 240)" stroke="oklch(0.7 0.12 230)" strokeWidth="1.2" />
          <text x="343" y="90" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.7 0.12 230)">HUM</text>
        </g>

        {/* ===== Exhaust fan (top right) ===== */}
        <g>
          <rect x="480" y="46" width="56" height="56" rx="4" fill="oklch(0.15 0.005 240)" stroke="oklch(0.5 0.01 240)" strokeWidth="2" />
          <FanBlades cx={508} cy={74} r={20} spinning={state.exhaustOn} speed={0.7} color={state.exhaustOn ? 'oklch(0.78 0.17 155)' : 'oklch(0.45 0.01 240)'} />
          <text x="508" y="116" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.65 0.01 240)">EXHAUST</text>
          {/* exhaust air out */}
          {state.exhaustOn && (
            <g>
              {[496, 508, 520].map((x, i) => (
                <path key={x} d={`M ${x} 42 v -14`} stroke="oklch(0.78 0.17 155 / 0.6)" strokeWidth="2" strokeLinecap="round" style={{ animation: `dryer-heat 1s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </g>
          )}
        </g>

        {/* ===== Front panel (right side, outside) ===== */}
        <g>
          <rect x="570" y="60" width="58" height="200" rx="6" fill="oklch(0.18 0.006 240)" stroke="oklch(0.4 0.01 240)" strokeWidth="1.5" />
          <text x="599" y="78" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="oklch(0.6 0.01 240)">PANEL</text>
          {/* LED display */}
          <rect x="578" y="88" width="42" height="34" rx="2" fill="oklch(0.1 0.01 155)" stroke="oklch(0.78 0.17 155)" strokeWidth="1" />
          <text x="599" y="102" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.78 0.17 155)">
            {state.chamberTemp.toFixed(0)}°C
          </text>
          <text x="599" y="115" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="oklch(0.78 0.17 155)">
            {state.humidity.toFixed(0)}%
          </text>
          {/* E-stop button */}
          <circle cx="599" cy="150" r="13" fill={state.mode === 'E-STOP' ? 'oklch(0.62 0.22 27)' : 'oklch(0.45 0.18 27)'} stroke="oklch(0.7 0.2 27)" strokeWidth="2" />
          <circle cx="599" cy="150" r="7" fill="oklch(0.55 0.2 27)" />
          <text x="599" y="176" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.6 0.01 240)">E-STOP</text>
          {/* status LEDs */}
          {(
            [
              ['PWR', true, 'oklch(0.78 0.17 155)'],
              ['HEAT', heaterActive, 'oklch(0.68 0.2 40)'],
              ['RUN', drying, 'oklch(0.7 0.12 230)'],
            ] as const
          ).map(([label, on, color], i) => (
            <g key={label}>
              <circle cx={586} cy={198 + i * 18} r={4} fill={on ? color : 'oklch(0.3 0.01 240)'}>
                {on && <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />}
              </circle>
              <text x={596} y={201 + i * 18} fontSize="7" fontFamily="monospace" fill="oklch(0.6 0.01 240)">{label}</text>
            </g>
          ))}
        </g>

        {/* Air inlet label */}
        <text x="112" y="120" textAnchor="end" fontSize="8" fontFamily="monospace" fill="oklch(0.55 0.01 240)">AIR</text>
        <text x="112" y="130" textAnchor="end" fontSize="8" fontFamily="monospace" fill="oklch(0.55 0.01 240)">IN →</text>
      </svg>
    </div>
  )
}
