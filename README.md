# 🏔️ NER Landslide Early Warning System

AI-powered real-time landslide monitoring and prediction platform for India's North Eastern Region.

> **SIH 2026 | 10-Day Hackathon Build | September 2026**

---

## Architecture

```
┌──────────────────────────────────┐
│   React Frontend (Vite + TS)     │  ← Vercel
│   Leaflet Map · Recharts · i18n  │
└──────────────┬───────────────────┘
               │  REST API (30s polling)
               ▼
┌──────────────────────────────────┐
│   FastAPI Backend (Python)       │  ← Railway
│   ├── ML Model (Random Forest)   │
│   ├── APScheduler (15-min cycle) │
│   ├── SQLite (reports + alerts)  │
│   ├── Twilio SMS (alert system)  │
│   └── IMD API (live rainfall)    │
└──────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Backend API | FastAPI (Python 3.11+) | ML in same process, async, auto Swagger docs |
| ML Model | scikit-learn Random Forest | Interpretable, fast inference, mixed features |
| Scheduling | APScheduler | Zero-config in-process background tasks |
| Database | SQLite + SQLAlchemy | No setup, sufficient for reports + alert logs |
| Spatial Data | Static GeoJSON files | No PostGIS complexity, sub-ms response |
| Frontend | React + Vite + TypeScript | Fast dev cycle, type safety, hot reload |
| Maps | React-Leaflet | Best docs, polygon + marker rendering |
| Charts | Recharts | Clean React integration, minimal config |
| Server State | TanStack React Query | Handles polling, caching, loading states |
| Multilingual | i18next | Drop-in React library, JSON translation files |
| SMS Alerts | Twilio Free Tier | Reliable delivery, free credits cover demo |
| PWA / Offline | Vite PWA Plugin | Service worker + manifest auto-generated |
| Backend Deploy | Railway | Auto-deploy from GitHub, free tier |
| Frontend Deploy | Vercel | Auto-deploy from GitHub, instant CDN |

---

## Setup & Installation

### Prerequisites

- **Python** 3.11+ (`python3 --version`)
- **Node.js** 18+ (`node --version`)
- **uv** (recommended) — [install guide](https://docs.astral.sh/uv/getting-started/installation/)
- **Git** (`git --version`)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SIH-ps-1
```

### 2. Backend Setup

```bash
cd backend

# Option A: With uv (recommended)
uv sync                    # Installs all deps from pyproject.toml into .venv
cp .env.example .env       # Copy and edit env vars (Twilio, IMD keys etc.)

# Option B: With pip
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Frontend Setup

```bash
cd frontend
npm install                # Install all Node dependencies
cp .env.example .env       # Points to backend at http://localhost:8000
```

### 4. Run the App

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 8000)
cd backend
uv run uvicorn app.main:app --reload --port 8000
# Or with pip venv: uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

| URL | What |
|-----|------|
| http://localhost:5173 | Frontend app (map + sidebar) |
| http://localhost:8000/docs | Swagger API docs (interactive) |
| http://localhost:8000/redoc | ReDoc API docs |

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No | _(logs to console if missing)_ |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No | _(graceful fallback)_ |
| `TWILIO_FROM_NUMBER` | Twilio sender phone number | No | — |
| `IMD_API_URL` | IMD rainfall JSON endpoint | No | `https://mausam.imd.gov.in/...` |
| `DATABASE_URL` | SQLite connection string | No | `sqlite:///./data.db` |
| `ALERT_PHONE_NUMBERS` | Comma-separated phone numbers for auto-alerts | No | — |

#### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check — `{status: "running"}` |
| `GET` | `/risk/zones` | NER district GeoJSON enriched with current risk levels |
| `GET` | `/risk/predict` | On-demand inference for `lat, lon, rainfall, moisture` |
| `GET` | `/sensors/live` | 48-hour simulated sensor time-series for a station ID |
| `GET` | `/alerts/active` | List districts currently at HIGH or CRITICAL risk |
| `POST` | `/alerts/send-sms` | Trigger Twilio SMS for a district + risk level |
| `POST` | `/reports` | Submit geo-tagged field report (multipart: photo + lat/lon + description) |
| `GET` | `/reports` | List all submitted field reports with photo URLs |

---

## Project Structure

```
SIH-ps-1/
├── backend/                    # FastAPI + ML + mock data
│   ├── pyproject.toml          # uv project definition (primary)
│   ├── requirements.txt        # pip-compatible deps (auto-generated)
│   ├── uv.lock                 # Lockfile for reproducible builds
│   ├── .env.example            # Env var template
│   └── app/
│       ├── main.py             # FastAPI app entry point + lifespan
│       ├── config.py           # Settings via pydantic-settings
│       ├── database.py         # SQLAlchemy engine + session
│       ├── models.py           # ORM: FieldReport, AlertLog
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── routers/
│       │   ├── risk.py         # /risk/zones, /risk/predict
│       │   ├── sensors.py      # /sensors/live
│       │   ├── alerts.py       # /alerts/active, /alerts/send-sms
│       │   └── reports.py      # /reports (GET + POST)
│       └── services/
│           ├── mock_data.py    # 48h sensor time-series generator
│           ├── ml_model.py     # Model loader + predict_risk()
│           └── scheduler.py    # APScheduler 15-min risk updates
│
├── frontend/                   # React + Vite + TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── App.tsx             # Root layout + QueryClientProvider
│       ├── api/
│       │   ├── client.ts       # Axios instance
│       │   └── hooks.ts        # React Query hooks (polling)
│       ├── components/
│       │   ├── Header.tsx      # App title + language selector
│       │   ├── MapView.tsx     # Leaflet map with GeoJSON layer
│       │   ├── Sidebar.tsx     # District info + chart + alert form
│       │   ├── SensorChart.tsx # Recharts 48h LineChart
│       │   └── ReportForm.tsx  # Field report modal (photo upload)
│       ├── i18n/
│       │   ├── index.ts        # i18next config
│       │   ├── en.json         # English
│       │   ├── hi.json         # हिन्दी
│       │   └── as.json         # অসমীয়া
│       └── types/
│           └── index.ts        # TypeScript interfaces
│
├── data/
│   └── ner_districts.geojson   # 12 NER districts (8 states)
│
├── notebooks/                  # ML training notebooks (TODO)
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## Progress Tracker

### ✅ Done

- [x] **Project scaffolding** — full directory structure, git repo with 10 clean commits
- [x] **Backend API** — all 7 endpoints implemented and returning data
- [x] **FastAPI app** — CORS, lifespan hooks, static file serving for uploads
- [x] **Database layer** — SQLAlchemy + SQLite with `FieldReport` and `AlertLog` models
- [x] **Mock sensor data** — numpy-based 48h time-series with diurnal patterns + danger spikes on 2 stations
- [x] **ML model stub** — random fallback predictions (Low 60% / High 25% / Critical 15%)
- [x] **APScheduler** — 15-min risk update cycle, runs immediately on startup
- [x] **Twilio integration** — SMS sending with graceful fallback when creds missing
- [x] **Frontend scaffold** — Vite + React + TypeScript, all deps installed
- [x] **Leaflet map** — renders NER district polygons colored by risk level
- [x] **Sidebar** — district details, risk badge, sensor chart, send alert button
- [x] **Recharts** — 48h rainfall + soil moisture line chart
- [x] **React Query** — hooks with 30s polling for risk zones and active alerts
- [x] **i18n** — English, Hindi, Assamese translations with language switcher
- [x] **Field report form** — modal with photo upload, lat/lon, description
- [x] **NER GeoJSON** — 12 placeholder districts across all 8 NE states
- [x] **Python tooling** — `uv` as primary with `requirements.txt` for compatibility

### 🔲 TODO

- [ ] **ML model training** — train Random Forest on NASA Landslide Catalog + SRTM + ESA WorldCover data
- [ ] **Real GeoJSON boundaries** — replace placeholder rectangles with actual GADM district polygons
- [ ] **IMD API integration** — poll live rainfall data from IMD JSON endpoint in scheduler
- [ ] **Twilio setup** — create Twilio account, get SID/token, configure phone numbers
- [ ] **Auto-alert on Critical** — trigger SMS automatically when district transitions to Critical
- [ ] **PWA & offline support** — Vite PWA Plugin, service worker caching, offline report queue
- [ ] **Field report map markers** — render submitted reports as camera markers on the map
- [ ] **Feature engineering notebook** — elevation, slope, land cover extraction from rasters
- [ ] **Model serialization** — train and export to `backend/model/landslide_model.joblib`
- [ ] **Railway deployment** — connect repo, set env vars, auto-deploy backend
- [ ] **Vercel deployment** — connect repo, set `VITE_API_BASE_URL`, auto-deploy frontend
- [ ] **CI/CD** — auto-deploy on push to `main` from day one
- [ ] **Testing** — API endpoint tests, frontend component tests
- [ ] **UI polish** — loading skeletons, error states, responsive mobile layout
- [ ] **Offline queue flush** — localStorage queue for field reports, sync on reconnect

---

## End-to-End Data Flow

| Step | What Happens |
|------|-------------|
| 1. Browser Load | Vercel serves React app → calls `GET /risk/zones` |
| 2. Map Render | Backend returns GeoJSON with risk levels → Leaflet renders colored polygons |
| 3. Scheduler Tick | APScheduler fires every 15 min → pulls IMD rainfall + mock sensors → builds features |
| 4. ML Inference | `predict_proba()` on all districts → updates in-memory risk dict → checks thresholds |
| 5. Auto Alert | District crosses Critical → Twilio SMS fires to registered contacts |
| 6. Frontend Sync | React Query refetch (30s) picks up new risk scores → map recolors |
| 7. User Drill-Down | Click district → sidebar fetches `/sensors/live` → chart renders 48h trend |
| 8. Manual Alert | Click Send Alert → `POST /alerts/send-sms` → SMS in <5s → toast confirmation |
| 9. Field Report | Upload photo + pin → `POST /reports` → camera marker appears on map |
| 10. Offline Queue | No connectivity → service worker serves cached app → report queued → flushed on reconnect |

---

## Contributing

```bash
# Backend dev
cd backend && uv run uvicorn app.main:app --reload

# Frontend dev
cd frontend && npm run dev

# Type check frontend
cd frontend && npx tsc --noEmit

# Backend import check
cd backend && uv run python -c "from app.main import app; print(app.title)"
```

## License

MIT
