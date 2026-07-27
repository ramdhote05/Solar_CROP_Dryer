import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'public')
const OUT_FILE = path.join(OUT_DIR, 'dryer-features.pdf')
fs.mkdirSync(OUT_DIR, { recursive: true })

// Palette
const INK = '#1a1a1a'
const MUTED = '#5b6470'
const ACCENT = '#c2410c' // warm orange (drying/heat)
const LINE = '#e2e5ea'
const CHIP_BG = '#fff2ea'

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: 'Grain Dryer Simulator — Feature Overview',
    Author: 'Drying Prototype',
  },
})
doc.pipe(fs.createWriteStream(OUT_FILE))

const PAGE_W = doc.page.width
const LEFT = doc.page.margins.left
const RIGHT = doc.page.width - doc.page.margins.right
const CONTENT_W = RIGHT - LEFT

function heading(text) {
  if (doc.y > doc.page.height - 160) doc.addPage()
  doc.moveDown(0.6)
  doc
    .fillColor(ACCENT)
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(text.toUpperCase(), LEFT, doc.y, { characterSpacing: 0.8 })
  doc.moveDown(0.35)
  const y = doc.y
  doc
    .moveTo(LEFT, y)
    .lineTo(RIGHT, y)
    .strokeColor(LINE)
    .lineWidth(1)
    .stroke()
  doc.moveDown(0.5)
}

function feature(title, desc) {
  if (doc.y > doc.page.height - 120) doc.addPage()
  const startY = doc.y
  // bullet marker
  doc
    .circle(LEFT + 3, startY + 6, 3)
    .fillColor(ACCENT)
    .fill()
  doc
    .fillColor(INK)
    .font('Helvetica-Bold')
    .fontSize(11.5)
    .text(title, LEFT + 16, startY, { width: CONTENT_W - 16 })
  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(10)
    .text(desc, LEFT + 16, doc.y + 1, { width: CONTENT_W - 16, lineGap: 2 })
  doc.moveDown(0.7)
}

// ---- Cover header ----
doc.rect(0, 0, PAGE_W, 150).fillColor(ACCENT).fill()
doc
  .fillColor('#ffffff')
  .font('Helvetica-Bold')
  .fontSize(26)
  .text('Grain Dryer Simulator', LEFT, 46)
doc
  .fillColor('#ffe9dd')
  .font('Helvetica')
  .fontSize(12.5)
  .text('Real-time drying control panel — feature overview', LEFT, 82)
doc
  .fillColor('#ffd9c7')
  .fontSize(9.5)
  .text(
    'A simulated PLC-style dashboard for drying agricultural crops (Soyabean, Tur, Chili).',
    LEFT,
    104,
    { width: CONTENT_W }
  )
doc.y = 176

doc
  .fillColor(MUTED)
  .font('Helvetica')
  .fontSize(10.5)
  .text(
    'This document summarizes the capabilities of the interactive grain-dryer simulation. The app models heat, airflow, moisture loss and load-cell weight in real time, and presents them through an industrial control panel with live telemetry, trend charts and batch reporting.',
    LEFT,
    doc.y,
    { width: CONTENT_W, lineGap: 3 }
  )
doc.moveDown(0.4)

// ---- Live monitoring ----
heading('Live Monitoring & Telemetry')
feature(
  'Sensor panel',
  'Live readouts for chamber temperature, relative humidity, grain moisture and airflow, updated continuously as the batch dries.'
)
feature(
  'Load-cell reading',
  'Real-time grain weight from the simulated load cell, shown on the panel so you can watch mass drop as water evaporates.'
)
feature(
  'Chamber schematic',
  'A visual diagram of the drying chamber showing heater, fan and airflow state at a glance.'
)
feature(
  'Status header',
  'Prominent mode indicator (Standby, Drying, Complete, Fault, E-Stop) plus key setpoints.'
)

// ---- Control ----
heading('Simulation & Control')
feature(
  'Crop presets',
  'One-click presets for Soyabean, Tur and Chili, each with recommended target moisture and drying temperature.'
)
feature(
  'Adjustable setpoints',
  'Manually tune target moisture and temperature to run custom drying profiles.'
)
feature(
  'Auto-stop at target',
  'The heater automatically switches off and the dryer enters cool-down the moment the crop reaches its target moisture.'
)
feature(
  'Emergency stop',
  'An E-Stop control immediately halts the process, with a guarded reset before resuming.'
)

// ---- Insights ----
heading('Insights & Reporting')
feature(
  'Estimated time remaining',
  'A live ETA computed from the current drying rate and the remaining moisture gap, alongside elapsed run time.'
)
feature(
  'Energy & cost estimate',
  'Running energy consumption (kWh) and operating cost, calculated from runtime and heater temperature.'
)
feature(
  'Drying trend charts',
  'Time-series charts plotting moisture, temperature, humidity and weight across the batch.'
)
feature(
  'Quality warnings',
  'Alerts for over-temperature and stalled drying so grain quality is protected.'
)
feature(
  'Batch history log',
  'Every completed cycle is recorded for comparison — crop, duration, moisture in/out, water removed, average rate, peak temperature, energy and cost — with running totals and a clear option.'
)
feature(
  'Batch summary report',
  'An end-of-run report card summarizing the completed drying cycle.'
)

// ---- Event log ----
heading('Diagnostics')
feature(
  'Event log',
  'A timestamped stream of system events (info, warnings and faults) for tracing exactly what happened during a run.'
)

// ---- Circuit / wiring diagram (ESP32) ----
doc.addPage()
heading('Wiring / Circuit Diagram (ESP32)')
doc
  .fillColor(MUTED)
  .font('Helvetica')
  .fontSize(10)
  .text(
    'Hardware wiring that maps the simulation to real components. An ESP32 reads the temperature/humidity, grain-moisture and load-cell sensors, monitors the emergency-stop input, and drives the heater and fan through relays.',
    LEFT,
    doc.y,
    { width: CONTENT_W, lineGap: 3 }
  )
doc.moveDown(0.6)

const SIG = '#0f766e' // teal signal wires
const PWR = ACCENT // power/output wires

function box(x, y, w, h, title, sub) {
  doc.roundedRect(x, y, w, h, 6).lineWidth(1).strokeColor(INK).stroke()
  doc
    .fillColor(INK)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(title, x + 6, y + 8, { width: w - 12 })
  if (sub) {
    doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(7.5)
      .text(sub, x + 6, y + 20, { width: w - 12, lineGap: 1 })
  }
}

// L-shaped connector from a peripheral box edge to an ESP32 pin
function wire(bx, bcy, midX, espY, espEdge, color, pinLabel, side) {
  doc
    .moveTo(bx, bcy)
    .lineTo(midX, bcy)
    .lineTo(midX, espY)
    .lineTo(espEdge, espY)
    .lineWidth(1.2)
    .strokeColor(color)
    .stroke()
  // node dots
  doc.circle(bx, bcy, 1.6).fillColor(color).fill()
  doc.circle(espEdge, espY, 1.6).fillColor(color).fill()
  // pin label at ESP32 edge
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(6.5)
  if (side === 'left') {
    doc.text(pinLabel, espEdge + 3, espY - 8, { width: 40 })
  } else {
    doc.text(pinLabel, espEdge - 43, espY - 8, { width: 40, align: 'right' })
  }
}

const diagTop = doc.y + 6
const espW = 120
const espH = 176
const espX = LEFT + CONTENT_W / 2 - espW / 2
const espY = diagTop + 20
// ESP32 body
box(espX, espY, espW, espH, 'ESP32', 'DevKit v1\n3.3V logic\nWiFi MCU')

const bxW = 132
const leftX = LEFT
const rightX = RIGHT - bxW
const rowsY = [diagTop, diagTop + 62, diagTop + 124, diagTop + 186]
const bh = 46

// left (inputs)
const leftBoxes = [
  ['DHT22 / SHT31', 'Temp + humidity'],
  ['Grain moisture probe', 'Analog resistive'],
  ['HX711 + load cell', 'Weight (ADC amp)'],
  ['E-Stop button', 'NC, pull-up'],
]
const leftPins = ['GPIO4', 'GPIO34', 'DT16 / SCK17', 'GPIO25']
// right (outputs / power)
const rightBoxes = [
  ['Heater (SSR relay)', 'AC element'],
  ['Fan driver (relay)', 'Airflow blower'],
  ['Status LED / buzzer', 'Alarm + state'],
  ['Power supply', '5V in / 3.3V reg'],
]
const rightPins = ['GPIO26', 'GPIO27', 'GPIO2', 'VIN / 3V3 / GND']
const rightColors = [PWR, PWR, PWR, PWR]

// ESP32 connection points (4 per side)
const espPts = [0, 1, 2, 3].map((i) => espY + (i + 0.5) * (espH / 4))
const leftMid = (leftX + bxW + espX) / 2
const rightMid = (rightX + espX + espW) / 2

leftBoxes.forEach((b, i) => {
  const y = rowsY[i]
  box(leftX, y, bxW, bh, b[0], b[1])
  wire(
    leftX + bxW,
    y + bh / 2,
    leftMid,
    espPts[i],
    espX,
    SIG,
    leftPins[i],
    'left'
  )
})
rightBoxes.forEach((b, i) => {
  const y = rowsY[i]
  box(rightX, y, bxW, bh, b[0], b[1])
  wire(
    rightX,
    y + bh / 2,
    rightMid,
    espPts[i],
    espX + espW,
    rightColors[i],
    rightPins[i],
    'right'
  )
})

doc.y = rowsY[3] + bh + 24

// legend
const legY = doc.y
doc.moveTo(LEFT, legY).lineTo(LEFT + 22, legY).lineWidth(1.2).strokeColor(SIG).stroke()
doc.fillColor(MUTED).font('Helvetica').fontSize(8.5).text('Sensor / signal', LEFT + 28, legY - 4)
doc.moveTo(LEFT + 140, legY).lineTo(LEFT + 162, legY).lineWidth(1.2).strokeColor(PWR).stroke()
doc.fillColor(MUTED).text('Power / actuator', LEFT + 168, legY - 4)
doc.moveDown(1.2)

// connection table
function tableRow(cells, widths, opts = {}) {
  if (doc.y > doc.page.height - 90) doc.addPage()
  const y = doc.y
  let x = LEFT
  const font = opts.header ? 'Helvetica-Bold' : 'Helvetica'
  const color = opts.header ? INK : MUTED
  if (opts.header) {
    doc.rect(LEFT, y - 3, CONTENT_W, 18).fillColor(CHIP_BG).fill()
  }
  cells.forEach((c, i) => {
    doc
      .fillColor(opts.header ? ACCENT : color)
      .font(font)
      .fontSize(9)
      .text(c, x + 4, y, { width: widths[i] - 8 })
    x += widths[i]
  })
  doc.moveDown(0.55)
  doc
    .moveTo(LEFT, doc.y - 3)
    .lineTo(RIGHT, doc.y - 3)
    .lineWidth(0.5)
    .strokeColor(LINE)
    .stroke()
}

const cw = [180, 90, CONTENT_W - 270]
tableRow(['Component', 'ESP32 pin', 'Notes'], cw, { header: true })
const conns = [
  ['DHT22 / SHT31 sensor', 'GPIO4', 'Chamber temperature & humidity (3.3V, 4.7k pull-up on data)'],
  ['Grain moisture probe', 'GPIO34 (ADC)', 'Analog input; use voltage divider, ADC1 channel'],
  ['HX711 load-cell amp', 'GPIO16 / GPIO17', 'DT = 16, SCK = 17; measures grain weight'],
  ['Emergency-stop button', 'GPIO25', 'Normally-closed, internal pull-up, triggers E-Stop'],
  ['Heater SSR relay', 'GPIO26', 'Drives solid-state relay for the heating element'],
  ['Fan / blower relay', 'GPIO27', 'Controls airflow blower (PWM capable)'],
  ['Status LED / buzzer', 'GPIO2', 'Mode indicator and fault alarm'],
  ['Power supply', 'VIN / 3V3 / GND', '5V input, on-board 3.3V regulator, common ground'],
]
conns.forEach((r) => tableRow(r, cw))

doc.moveDown(0.4)
doc
  .fillColor(MUTED)
  .font('Helvetica-Oblique')
  .fontSize(8)
  .text(
    'Note: mains-voltage wiring to the heater and fan must go through appropriately rated relays/SSRs and isolation. Pin assignments are a reference and can be remapped in firmware.',
    LEFT,
    doc.y,
    { width: CONTENT_W, lineGap: 2 }
  )

// ---- Footer ----
const footerY = doc.page.height - 42
doc
  .moveTo(LEFT, footerY - 8)
  .lineTo(RIGHT, footerY - 8)
  .strokeColor(LINE)
  .lineWidth(1)
  .stroke()
doc
  .fillColor(MUTED)
  .font('Helvetica')
  .fontSize(8.5)
  .text('Grain Dryer Simulator · Feature Overview', LEFT, footerY, {
    width: CONTENT_W,
    align: 'center',
  })

doc.end()
console.log('[v0] PDF written to', OUT_FILE)
