# 🌊 HydroSentry

**AI-powered flood intelligence for hilly regions.**

HydroSentry is a flood and landslide command center that combines Sentinel-1 SAR satellite imagery, sensor telemetry, and machine-learning risk analysis in one dashboard. It shows operators which regions are in danger, how risk is expected to change, and which factors are driving it.

🔗 **Live demo:** [hydrosentry-xi.vercel.app](https://hydrosentry-xi.vercel.app/)

![Regional Overview](docs/screenshots/overview.png)

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Training the Models](#training-the-models)
- [Demo Data Notice](#demo-data-notice)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Features

| Page | What it does |
|------|--------------|
| **Overview** | Regional summary (regions monitored, SAR coverage, high-risk zones, data freshness), a region selector, a live risk map, and a flood risk forecast. |
| **Live Monitoring** | Real-time view of sensor readings. |
| **Risk Intelligence** | Current flood risk score, model confidence, near-term risk trajectory, and explainable risk factors. |
| **Alerts** | Alerts when sensor risk rises. |
| **Analytics** | Per-sensor telemetry trends (rainfall, water level, and more) with session insights. |
| **Sensor Network** | Overview of the deployed sensor nodes and their status. |

**Highlights**

- 🛰️ **Sentinel-1 SAR layer** from the Copernicus Data Space Ecosystem, drawn over OpenStreetMap on an interactive Leaflet map
- 🧠 **Hybrid ML risk model:** a Random Forest for terrain and history, an LSTM for sensor trends, combined by late fusion
- 📈 **Multi-horizon forecasts** (now, 30, 60, and 120 minutes)
- 🔍 **Explainable risk factors:** rainfall, water level, soil saturation, and flow rate
- 🗺️ **Region switching** to focus monitoring on one area

## Screenshots

### Regional Overview
![Regional Overview](docs/screenshots/overview.png)

### Risk Intelligence
![Risk Intelligence](docs/screenshots/risk-intelligence.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

## How It Works

HydroSentry's risk model fuses two models that look at the problem from different angles:

```
 Static terrain features ──► Random Forest ──► rf_score ─┐
 (slope, soil type,                                       ├─► 0.5 · RF + 0.5 · LSTM ─► final_score ─► risk level
  historical risk)                                        │
 6 recent sensor readings ─► LSTM ───────────► lstm_score ┘
 (rainfall, soil moisture,
  tilt, river level)
```

| Score | Risk level |
|-------|-----------|
| below 0.30 | **Low** |
| 0.30 to 0.55 | **Watch** |
| 0.55 to 0.80 | **Warning** |
| 0.80 and above | **Evacuate** |

- **Random Forest** (200 trees, max depth 6) predicts background risk from slope angle, soil type, and historical risk score.
- **LSTM** (32 units, dropout, dense head, sigmoid output) predicts dynamic risk from the last 6 time steps of four sensor features.
- The **Flask API** loads both models and returns the fused score.
- The **React frontend** also runs a rule-based risk engine over sensor values (rainfall, water level, flow rate, soil moisture) to score each node as Low, Moderate, High, or Critical.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Leaflet / React-Leaflet, Lucide icons |
| Backend | Python 3.12, Flask, Flask-CORS |
| ML | TensorFlow / Keras (LSTM), scikit-learn (Random Forest), NumPy, joblib |
| Satellite data | Copernicus Sentinel-1 SAR via a Sentinel Hub WMS layer |
| Hosting | Vercel (frontend) |

## Project Structure

```
HydroSentry/
├── frontend/            # React + Vite dashboard
│   └── src/
│       ├── pages/       # Overview, Monitoring, Risk Intelligence, Alerts, Analytics, Sensor Network
│       ├── components/  # RiskMap (Leaflet + Sentinel-1 layer)
│       ├── hooks/       # live sensors, ML risk, sensor predictions
│       └── services/    # risk engine, ML API client and payload adapter
├── backend/
│   ├── app.py           # Flask ML risk API
│   └── requirements.txt
├── ml/
│   ├── scripts/         # dataset generation and model training
│   ├── data/            # static and time-series feature files
│   └── models/          # trained RF, LSTM, and scaler
├── sentinel/            # Sentinel-1 configuration (placeholder)
└── .python-version      # 3.12
```

## Getting Started

### Prerequisites

- **Python 3.12**
- **Node.js** 18 or newer, with npm

### 1. Clone

```bash
git clone https://github.com/neevmodi/HydroSentry.git
cd HydroSentry
```

### 2. Run the backend

```bash
pip install -r backend/requirements.txt
python backend/app.py
```

The API starts on `http://localhost:5000`. Run it from the project root so the model files in `ml/models/` are found. Set the `PORT` environment variable to use a different port.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

By default the frontend talks to `http://localhost:5000`. To point it at a deployed API, create `frontend/.env`:

```env
VITE_API_BASE_URL=https://your-api-url.example.com
```

### Other frontend commands

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service status |
| `GET` | `/health` | Model load status |
| `POST` | `/predict` | Fused flood and landslide risk prediction |

### `POST /predict`

**Request**

```json
{
  "slope_angle": 32.5,
  "soil_type_code": 2,
  "historical_risk_score": 0.5,
  "timeseries": [
    { "rainfall_mm": 10, "soil_moisture_pct": 40, "tilt_deg": 0.10, "river_level_cm": 80 },
    { "rainfall_mm": 14, "soil_moisture_pct": 45, "tilt_deg": 0.12, "river_level_cm": 90 },
    { "rainfall_mm": 18, "soil_moisture_pct": 52, "tilt_deg": 0.15, "river_level_cm": 105 },
    { "rainfall_mm": 24, "soil_moisture_pct": 60, "tilt_deg": 0.20, "river_level_cm": 120 },
    { "rainfall_mm": 30, "soil_moisture_pct": 68, "tilt_deg": 0.26, "river_level_cm": 140 },
    { "rainfall_mm": 38, "soil_moisture_pct": 75, "tilt_deg": 0.33, "river_level_cm": 165 }
  ]
}
```

- `soil_type_code`: `0` rocky, `1` sandy, `2` loamy, `3` clay
- `timeseries` must contain **exactly 6** time steps

**Response**

```json
{
  "rf_score": 0.0,
  "lstm_score": 0.0,
  "final_score": 0.0,
  "risk_level": "Low",
  "model": { "random_forest_weight": 0.5, "lstm_weight": 0.5 }
}
```

Scores above are placeholders; the real values depend on the input. Invalid or missing fields return a `400` with the list of missing fields.

## Training the Models

The trained models are already included in `ml/models/`. To retrain them:

```bash
python ml/scripts/generate_dataset.py     # generate the synthetic dataset
python ml/scripts/train_random_forest.py  # saves rf_model.joblib
python ml/scripts/train_lstm.py           # saves lstm_model.keras and lstm_scaler.joblib
```

Both models use an 80/20 stratified train/test split, and the training scripts print test accuracy. The data files in `ml/data/` have an `.xlsx` extension but contain CSV text, and the scripts read them as CSV.

## Demo Data Notice

Real sensor feeds are not connected yet. The models are trained on a **synthetic dataset** (800 simulated events), and the dashboard's sensor readings are **simulated** (the Analytics page says so in-app). Scores and forecasts in the demo are **not real flood predictions** and must not be used for safety decisions.

## Roadmap

- Connect real sensor feeds and live satellite data
- Validate the models against historical flood and landslide events
- Alert delivery by SMS, email, or push notification
- Add more monitored regions

## Author

Built by [@neevmodi](https://github.com/neevmodi).
