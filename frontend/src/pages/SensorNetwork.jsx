
import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Droplets,
  Gauge,
  Info,
  Radio,
  Search,
  Sprout,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react'

import useLiveSensors from '../hooks/useLiveSensors'
import useSensorPredictions from '../hooks/useSensorPredictions'

const statusStyles = {
  Online: {
    badge: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  Warning: {
    badge: 'border-amber-400/20 bg-amber-400/10 text-amber-400',
    dot: 'bg-amber-400',
  },
  Critical: {
    badge: 'border-red-400/20 bg-red-400/10 text-red-400',
    dot: 'bg-red-400',
  },
}

const telemetryFields = [
  'rainfall',
  'waterLevel',
  'flowRate',
  'soilMoisture',
  'temperature',
  'humidity',
  'tiltDeg',
]

function formatScore(value) {
  return typeof value === 'number' ? value.toFixed(3) : 'Unavailable'
}

function formatRiskLevel(value) {
  return value ? String(value) : 'Unavailable'
}

function StatusBadge({ status }) {
  const style = statusStyles[status] || {
    badge: 'border-white/10 bg-white/5 text-slate-400',
    dot: 'bg-slate-500',
  }

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${style.badge}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {status || 'Unknown'}
    </span>
  )
}

function SummaryCard({ label, value, unit, icon: Icon, tone }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 break-words text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
      </div>
      <p className={`mt-3 break-words text-2xl font-semibold ${tone}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
      </p>
    </div>
  )
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="flex min-w-0 items-start gap-2">
        {Icon && (
          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
        )}
        <p className="min-w-0 break-words text-[10px] leading-4 uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-2 min-w-0 break-words text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  )
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 break-words text-sm font-semibold text-slate-100">{title}</h3>
    </div>
  )
}

function ModelState({ prediction, isLoading, hasError, compact = false }) {
  if (prediction) {
    return (
      <div className={compact ? 'mt-4 min-w-0' : 'mt-5 min-w-0'}>
        {!compact && <SectionHeader eyebrow="Model Output" title="Synthetic model output" />}
        <div className="mt-3 grid min-w-0 grid-cols-3 gap-2">
          <Metric label="RF score" value={formatScore(prediction.rf_score)} />
          <Metric label="LSTM score" value={formatScore(prediction.lstm_score)} />
          <Metric label="Fusion score" value={formatScore(prediction.final_score)} />
        </div>
        <p className="mt-3 break-words text-xs text-slate-500">
          Risk level: <span className="font-medium text-slate-300">{formatRiskLevel(prediction.risk_level)}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 min-w-0 rounded-xl border border-white/5 bg-black/20 p-3">
      <p className="text-xs font-medium text-slate-300">
        {isLoading ? 'Running model inference' : hasError ? 'ML inference unavailable' : 'Collecting telemetry'}
      </p>
      {!compact && !isLoading && !hasError && (
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          ML inference will appear after sufficient session readings are available.
        </p>
      )}
    </div>
  )
}

function SensorCard({ sensor, prediction, isLoading, hasError, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-0 w-full rounded-2xl border bg-slate-900/60 p-5 text-left backdrop-blur-xl transition hover:border-white/15 hover:bg-slate-900/80 ${selected ? 'border-orange-400/40 ring-1 ring-orange-400/20' : 'border-white/10'}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Activity className="h-4 w-4 shrink-0 text-orange-400" />
            <h2 className="truncate text-sm font-semibold text-slate-100">{sensor.id}</h2>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{sensor.location}</p>
        </div>
        <StatusBadge status={sensor.status} />
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-2 gap-3">
        <Metric label="Rainfall" value={`${sensor.rainfall} mm`} icon={CloudRain} />
        <Metric label="Water level" value={`${sensor.waterLevel} m`} icon={Droplets} />
        <Metric label="Flow rate" value={`${sensor.flowRate} m³/s`} icon={Gauge} />
        <Metric label="Soil moisture" value={`${sensor.soilMoisture}%`} icon={Sprout} />
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-3 gap-2">
        <Metric label="Temperature" value={`${sensor.temperature}°C`} icon={Thermometer} />
        <Metric label="Humidity" value={`${sensor.humidity}%`} icon={Wind} />
        <Metric label="Tilt" value={`${sensor.tiltDeg}°`} icon={Waves} />
      </div>

      <div className="mt-4 min-w-0 border-t border-white/5 pt-4">
        <div className="flex min-w-0 items-center justify-between gap-3 text-[11px]">
          <span className="shrink-0 text-slate-500">Last update</span>
          <span className="min-w-0 break-words text-right text-slate-300">{sensor.lastUpdate || 'Unavailable'}</span>
        </div>
        <div className="mt-2 flex min-w-0 items-center justify-between gap-3 text-[11px]">
          <span className="shrink-0 text-slate-500">Slope / historical risk</span>
          <span className="min-w-0 break-words text-right text-slate-300">{sensor.slopeAngle}° / {formatScore(sensor.historicalRiskScore)}</span>
        </div>
      </div>

      <ModelState
        prediction={prediction}
        isLoading={isLoading}
        hasError={hasError}
        compact
      />
    </button>
  )
}

function DetailSection({ eyebrow, title, children }) {
  return (
    <div className="min-w-0">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="mt-3 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}

function SensorDetails({ sensor, prediction, isLoading, hasError }) {
  if (!sensor) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-400">Select a sensor node to inspect its telemetry.</p>
      </div>
    )
  }

  const availableFields = telemetryFields.filter(
    (field) => sensor[field] !== undefined && sensor[field] !== null,
  ).length

  return (
    <div className="min-w-0 p-5 sm:p-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Selected Node</p>
          <h2 className="mt-2 break-words text-xl font-semibold text-slate-100">{sensor.id}</h2>
          <p className="mt-1 break-words text-xs text-slate-500">{sensor.location}</p>
        </div>
        <StatusBadge status={sensor.status} />
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Node ID" value={sensor.id} />
        <Metric label="Location" value={sensor.location} />
        <Metric label="Last update" value={sensor.lastUpdate || 'Unavailable'} />
      </div>

      <div className="mt-6 min-w-0 space-y-6 border-t border-white/5 pt-5">
        <DetailSection eyebrow="Environment" title="Atmospheric telemetry">
          <Metric label="Rainfall" value={`${sensor.rainfall} mm`} icon={CloudRain} />
          <Metric label="Temperature" value={`${sensor.temperature}°C`} icon={Thermometer} />
          <Metric label="Humidity" value={`${sensor.humidity}%`} icon={Wind} />
        </DetailSection>

        <DetailSection eyebrow="Hydrology" title="Water movement">
          <Metric label="Water level" value={`${sensor.waterLevel} m`} icon={Droplets} />
          <Metric label="Flow rate" value={`${sensor.flowRate} m³/s`} icon={Gauge} />
        </DetailSection>

        <DetailSection eyebrow="Ground / Slope" title="Terrain telemetry">
          <Metric label="Soil moisture" value={`${sensor.soilMoisture}%`} icon={Sprout} />
          <Metric label="Tilt" value={`${sensor.tiltDeg}°`} icon={Waves} />
          <Metric label="Slope angle" value={`${sensor.slopeAngle}°`} />
        </DetailSection>

        <DetailSection eyebrow="Model Inputs" title="Static context">
          <Metric label="Soil type code" value={sensor.soilTypeCode} />
          <Metric label="Historical risk score" value={formatScore(sensor.historicalRiskScore)} />
        </DetailSection>

        <div className="min-w-0">
          <SectionHeader eyebrow="Model Output" title="Synthetic model output" />
          <ModelState prediction={prediction} isLoading={isLoading} hasError={hasError} />
        </div>

        <div className="min-w-0 rounded-xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Telemetry Health</p>
          </div>
          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">
            <Metric label="Data availability" value={`${availableFields}/${telemetryFields.length} telemetry fields available`} />
            <Metric label="Current status" value={sensor.status || 'Unavailable'} />
            <Metric label="Last update" value={sensor.lastUpdate || 'Unavailable'} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SensorNetwork() {
  const sensors = useLiveSensors()
  const {
    predictions,
    loading,
    errors,
  } = useSensorPredictions(sensors)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedSensorId, setSelectedSensorId] = useState(sensors[0]?.id || null)

  const filteredSensors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return sensors.filter((sensor) => {
      const matchesSearch = [sensor.id, sensor.location]
        .join(' ')
        .toLowerCase()
        .includes(query)
      const matchesStatus = statusFilter === 'All' || sensor.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [sensors, searchQuery, statusFilter])

  const effectiveSelectedSensorId = filteredSensors.some(
    (sensor) => sensor.id === selectedSensorId,
  )
    ? selectedSensorId
    : filteredSensors[0]?.id || null
  const selectedSensor = sensors.find(
    (sensor) => sensor.id === effectiveSelectedSensorId,
  )
  const selectedPrediction = selectedSensor
    ? predictions[selectedSensor.id]
    : null
  const selectedIsLoading = selectedSensor
    ? Boolean(loading[selectedSensor.id])
    : false
  const selectedHasError = selectedSensor
    ? Boolean(errors[selectedSensor.id])
    : false
  const onlineCount = sensors.filter((sensor) => sensor.status === 'Online').length
  const attentionCount = sensors.filter(
    (sensor) => sensor.status === 'Warning' || sensor.status === 'Critical',
  ).length
  const averageRainfall = sensors.length > 0
    ? sensors.reduce((sum, sensor) => sum + Number(sensor.rainfall || 0), 0) / sensors.length
    : null

  return (
    <div className="mx-auto w-full max-w-[1600px] min-w-0">
      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sensor Network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Sensor Network</h1>
          <p className="mt-2 text-sm text-slate-400">Live telemetry and node health across monitored locations.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          SIMULATED TELEMETRY
        </div>
      </div>

      <div className="mt-6 flex min-w-0 items-start gap-3 rounded-xl border border-orange-400/15 bg-orange-400/[0.04] p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-orange-200">Demo telemetry</p>
          <p className="mt-1 break-words text-xs leading-5 text-orange-100/70">
            Sensor readings are simulated for development and demonstration. Values update during the active session.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Nodes" value={sensors.length} unit="nodes" icon={Radio} tone="text-orange-400" />
        <SummaryCard label="Online" value={onlineCount} unit="nodes" icon={CheckCircle2} tone="text-emerald-400" />
        <SummaryCard label="Attention Required" value={attentionCount} unit="nodes" icon={AlertTriangle} tone="text-amber-400" />
        <SummaryCard label="Average Rainfall" value={averageRainfall === null ? 'Collecting' : averageRainfall.toFixed(1)} unit={averageRainfall === null ? '' : 'mm'} icon={CloudRain} tone="text-orange-400" />
      </div>

      <div className="mt-6 min-w-0 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="relative block w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search node ID or location..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-orange-400/40"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {['All', 'Online', 'Warning', 'Critical'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${statusFilter === status ? 'border-orange-400/30 bg-orange-400/10 text-orange-300' : 'border-white/10 bg-white/[0.02] text-slate-500 hover:bg-white/[0.05] hover:text-slate-300'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 min-w-0">
        {sensors.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-xl">
            <Radio className="mx-auto h-7 w-7 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">No sensor nodes available.</p>
          </div>
        ) : filteredSensors.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-xl">
            <Search className="mx-auto h-7 w-7 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">No sensor nodes match the current search or filter.</p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSensors.map((sensor) => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                prediction={predictions[sensor.id]}
                isLoading={Boolean(loading[sensor.id])}
                hasError={Boolean(errors[sensor.id])}
                selected={sensor.id === effectiveSelectedSensorId}
                onSelect={() => setSelectedSensorId(sensor.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 min-w-0 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <SensorDetails
          sensor={selectedSensor}
          prediction={selectedPrediction}
          isLoading={selectedIsLoading}
          hasError={selectedHasError}
        />
      </div>

      <div className="mt-6 flex min-w-0 items-start gap-3 border-t border-white/5 pt-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
        <p className="min-w-0 break-words text-[11px] leading-5 text-slate-600">
          Current session values are simulated telemetry. Model outputs are synthetic inference results and do not represent official warnings or verified field conditions.
        </p>
      </div>
    </div>
  )
}

export default SensorNetwork
