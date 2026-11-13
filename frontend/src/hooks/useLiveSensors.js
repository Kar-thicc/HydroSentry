
import { useEffect, useState } from 'react'

const API_URL = 'https://hydrosentry-1sy4.onrender.com/sensor-data'

function useLiveSensors() {
  const [sensors, setSensors] = useState([])

  useEffect(() => {
    let isMounted = true

    const fetchSensorData = async () => {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Failed to fetch sensor data')
        }

        const data = await response.json()

        if (!isMounted) return

        if (data.status === 'waiting') {
          setSensors([])
          return
        }

        setSensors([
          {
            id: 'NODE-001',
            location: 'ESP32 Live Sensor Node',
            status: 'Online',

            // Raw sensor readings
            rainRaw: data.rain_raw,
            waterLevelRaw: data.water_level_raw,
            soilMoistureRaw: data.soil_moisture_raw,

            // Environmental readings
            temperature: data.temperature_c,
            humidity: data.humidity_pct,

            // Ultrasonic sensor
            distance: data.distance_cm,

            // Not currently measured
            rainfall: null,
            waterLevel: null,
            flowRate: null,
            soilMoisture: null,

            tiltDeg: null,
            slopeAngle: 28,
            soilTypeCode: 2,
            historicalRiskScore: 0.42,

            lastUpdate: data.received_at
              ? new Date(data.received_at).toLocaleTimeString()
              : 'Just now',
          },
        ])
      } catch (error) {
        console.error('HydroSentry sensor fetch error:', error)

        if (isMounted) {
          setSensors((currentSensors) =>
            currentSensors.map((sensor) => ({
              ...sensor,
              status: 'Warning',
            }))
          )
        }
      }
    }

    fetchSensorData()

    const interval = setInterval(fetchSensorData, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return sensors
}

export default useLiveSensors
