
import {
  Activity,
  Droplets,
  Gauge,
  CloudRain,
  Thermometer,
  Wind,
  Sprout,
  Clock,
  Radio,
  Ruler,
} from 'lucide-react'

import useLiveSensors from '../hooks/useLiveSensors'

function StatusBadge({ status }) {
  const styles = {
    Online: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    Warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    Critical: 'bg-red-400/10 text-red-400 border-red-400/20',
  }

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${styles[status] || styles.Warning}`}>
      {status}
    </span>
  )
}

function formatValue(value, unit = '') {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return 'No reading'
  }

  return `${value}${unit}`
}

function SensorCard({ sensor }) {
  const metrics = [
    {
      label: 'Rain Sensor',
      value: formatValue(sensor.rainRaw),
      unit: 'Raw ADC',
      icon: CloudRain,
    },
    {
      label: 'Water Sensor',
      value: formatValue(sensor.waterLevelRaw),
      unit: 'Raw ADC',
      icon: Droplets,
    },
    {
      label: 'Soil Moisture',
      value: formatValue(sensor.soilMoistureRaw),
      unit: 'Raw ADC',
      icon: Sprout,
    },
    {
      label: 'Temperature',
      value: formatValue(sensor.temperature, ' °C'),
      unit: 'DHT sensor',
      icon: Thermometer,
    },
    {
      label: 'Humidity',
      value: formatValue(sensor.humidity, ' %'),
      unit: 'Relative humidity',
      icon: Wind,
    },
    {
      label: 'Ultrasonic Distance',
      value: formatValue(sensor.distance, ' cm'),
      unit: 'HC-SR04',
      icon: Ruler,
    },
  ]

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-white/15 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              {sensor.id}
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {sensor.location}
          </p>
        </div>

        <StatusBadge status={sensor.status} />
      </div>

      <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400" />
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Hardware connection
          </p>
        </div>

        <p className="mt-2 text-sm font-semibold text-emerald-400">
          ESP32 connected to HydroSentry
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Live readings received from Render backend
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <div
              key={metric.label}
              className="rounded-xl border border-white/5 bg-black/20 p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {metric.label}
                </p>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-200">
                {metric.value}
              </p>

              <p className="mt-1 text-[10px] text-slate-600">
                {metric.unit}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
        <Clock className="h-3.5 w-3.5 text-slate-600" />
        <p className="text-[11px] text-slate-500">
          Last update: {sensor.lastUpdate}
        </p>
      </div>
    </div>
  )
}

function Monitoring() {
  const liveSensors = useLiveSensors()

  const onlineCount = liveSensors.filter(
    (sensor) => sensor.status === 'Online'
  ).length

  const warningCount = liveSensors.filter(
    (sensor) => sensor.status === 'Warning'
  ).length

  const criticalCount = liveSensors.filter(
    (sensor) => sensor.status === 'Critical'
  ).length

  return (
    <div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Real-Time Telemetry
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
              Live Monitoring
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Real-time environmental telemetry from deployed sensor nodes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live data stream
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Online Nodes
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {onlineCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Warning Nodes
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {warningCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Critical Nodes
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-400">
            {criticalCount}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {liveSensors.length > 0 ? (
          liveSensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
            <Radio className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-slate-200">
              Waiting for sensor data
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check that your ESP32 is powered on and uploading readings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Monitoring
