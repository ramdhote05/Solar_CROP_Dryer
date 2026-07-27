# 🌞 AgriDry CDS-01 — Solar Crop Dryer Control System

> **IoT-based Solar Crop Drying Control Unit** — A full-stack simulation dashboard for an ESP-32 powered solar crop dryer with real-time monitoring, automated controls, and batch analytics.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.2-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📸 Preview

![AgriDry CDS-01 Dashboard](./public/placeholder.svg)

---

## 🧩 Features

### 🌡️ Real-Time Sensor Monitoring
- **Chamber Temperature** — Live readout with over-temperature detection (fault at ≥ 70°C)
- **Relative Humidity** — Auto exhaust fan triggered between 46–62% RH
- **Crop Weight** — HX711 load cell simulation with 8-sample moving-average noise filter
- **Moisture Content** — Computed from weight and dry mass; drives drying completion logic

### 🔄 Simulation Engine
- **1 tick = 1 simulated minute** (600ms real-time)
- Physics-based thermal model (P-controller SSR, airflow heat loss, evaporative cooling)
- Drying rate computed over a rolling 12-minute window (%/hour)
- Energy accumulation in Wh → cost estimate at ₹8/kWh

### ⚙️ Control Panel
- **Crop Presets** — One-click setpoints for Soyabean, Tur, and Chili
- **Custom Setpoints** — Adjustable target temperature (35–80°C) and moisture cutoff (6–25%)
- **Actuator Controls** — Manual/Auto blower, exhaust fan, and heater SSR
- **HX711 Tare** — Zero offset capture with NVS calibration factor
- **Emergency Stop (E-STOP)** — Instantly de-energizes all outputs

### 📊 Data Visualization
- **Trend Charts** — Temperature & Humidity / Weight & Moisture (last 240 minutes)
- **Chamber Schematic** — Live cutaway diagram showing actuator states
- **Event Log** — Timestamped system events with severity levels (info / warn / alarm / SMS)
- **Batch Summary** — Post-drying analytics: duration, water removed, avg drying rate, energy cost
- **Batch History** — Up to 20 completed batch records with full metrics

### 📡 GSM / SMS Simulation
- Simulates SMS notifications for batch start, completion, and fault events
- Signal strength indicator in status header

### 🛡️ Safety Features
- Over-temperature fault (FAULT mode) with automatic SSR interlock
- E-STOP with hardware-level output cut simulation
- Drying stall warning when rate < 0.6%/hr

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript 5.7](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) |
| UI Components | [Base UI](https://base-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Charts | [Recharts 3](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Package Manager | [pnpm](https://pnpm.io/) |

---

## 📁 Project Structure

```
crop-preset-update/
├── app/
│   ├── page.tsx              # Main dashboard page
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Global styles
│   └── theme.css             # CSS custom properties / design tokens
├── components/
│   ├── dryer/
│   │   ├── status-header.tsx     # Top bar: device ID, mode badge, GSM signal, E-STOP
│   │   ├── sensor-panel.tsx      # Live metric cards (temp, humidity, weight, moisture)
│   │   ├── chamber-schematic.tsx # SVG cutaway diagram of dryer chamber
│   │   ├── trend-charts.tsx      # Recharts line graphs for history data
│   │   ├── control-panel.tsx     # Crop presets, setpoint sliders, actuator toggles
│   │   ├── event-log.tsx         # Timestamped event log with severity badges
│   │   ├── live-batch.tsx        # Live batch progress bar and stats
│   │   ├── batch-summary.tsx     # Post-completion analytics card
│   │   └── batch-history.tsx     # Historical batch records table
│   └── ui/
│       └── button.tsx            # Shared button component
├── hooks/
│   └── use-dryer-simulation.ts   # Core simulation engine & state machine
├── lib/
│   └── utils.ts                  # Utility helpers (cn, etc.)
├── public/
│   ├── crops/                    # Crop preset images (soyabean, tur, chili, custom)
│   └── dryer-features.pdf        # Feature documentation PDF
├── scripts/
│   └── generate-features-pdf.mjs # PDF generation script
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/ramdhote05/Solar_CROP_Dryer.git
cd Solar_CROP_Dryer

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 🎮 How to Use

1. **Select a Crop Preset** — Choose Soyabean, Tur, or Chili from the control panel to auto-load temperature and moisture setpoints.
2. **Start Drying** — Click `START DRYING`. The blower activates and the PTC heater ramps to the target temperature via SSR.
3. **Monitor Live** — Watch sensor panels, chamber schematic, and trend charts update in real-time.
4. **Auto Exhaust** — The exhaust fan cycles automatically based on chamber humidity (46–62% RH band).
5. **Batch Complete** — When moisture reaches the target cutoff, the system auto-stops and generates a batch summary.
6. **E-STOP** — Red button in the header cuts all outputs immediately. Reset to return to STANDBY.

---

## 🔬 Simulation Model

```
Thermal:    ΔT = (duty/100 × 2.1) − (T_chamber − T_ambient) × (0.055 + airflow × 0.35)
Drying:     Δmoisture = 0.11 × tempFactor × airflowFactor × moistureFactor  [%/tick]
Weight:     W = DryMass / (1 − moisture/100)  [physics-based from moisture]
Noise:      HX711 vibration noise ± 35g (blower on) / ± 4g (blower off), 8-sample MA filter
Energy:     Load = heaterDuty × 1000W + blower 60W + exhaust 25W  → Wh accumulated
```

---

## 🌾 Supported Crop Presets

| Crop | Target Moisture | Target Temp |
|---|---|---|
| 🫘 Soyabean | 13% | 50°C |
| 🌿 Tur (Pigeon Pea) | 12.5% | 60°C |
| 🌶️ Chili | 10% | 55°C |
| ⚙️ Custom | User-defined | User-defined |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Ram Dhote**
- GitHub: [@ramdhote05](https://github.com/ramdhote05)

---

> *Simulated Working Model · 1 Tick = 1 Process Minute · ESP-32 · PTC Heater · SSR · GSM · HX711 Load Cell*
