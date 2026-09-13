# 🏔️ NER Landslide Early Warning System

AI-powered real-time landslide monitoring and prediction platform for India's North Eastern Region.

> **SIH 2026 | 10-Day Hackathon Build | September 2026**

## Architecture

```
React Frontend (Vite + TypeScript)
        │
        ▼
FastAPI Backend (Python)
   ├── scikit-learn ML Model (Random Forest)
   ├── APScheduler (15-min risk updates)
   ├── SQLite (field reports + alert logs)
   ├── Twilio SMS (alert system)
   └── IMD API (live rainfall data)
```

## Tech Stack

| Layer           | Technology                 |
| --------------- | -------------------------- |
| Backend API     | FastAPI (Python 3.11+)     |
| ML Model        | scikit-learn Random Forest |
| Scheduling      | APScheduler                |
| Database        | SQLite + SQLAlchemy        |
| Frontend        | React + Vite + TypeScript  |
| Maps            | React-Leaflet              |
| Charts          | Recharts                   |
| Server State    | TanStack React Query       |
| Multilingual    | i18next (EN / HI / AS)     |
| SMS Alerts      | Twilio                     |
| Backend Deploy  | Railway                    |
| Frontend Deploy | Vercel                     |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### Backend

```bash
cd backend

# With uv (recommended)
uv sync
uv run uvicorn app.main:app --reload --port 8000

# With pip (alternative)
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at http://localhost:5173

### Environment Variables

Copy the example env files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### Backend (`backend/.env`)

| Variable              | Description                      | Required                               |
| --------------------- | -------------------------------- | -------------------------------------- |
| `TWILIO_ACCOUNT_SID`  | Twilio account SID               | No (graceful fallback)                 |
| `TWILIO_AUTH_TOKEN`   | Twilio auth token                | No                                     |
| `TWILIO_FROM_NUMBER`  | Twilio sender number             | No                                     |
| `IMD_API_URL`         | IMD rainfall API endpoint        | No (has default)                       |
| `DATABASE_URL`        | SQLite connection string         | No (defaults to `sqlite:///./data.db`) |
| `ALERT_PHONE_NUMBERS` | Comma-separated alert recipients | No                                     |

#### Frontend (`frontend/.env`)

| Variable            | Description     | Default                 |
| ------------------- | --------------- | ----------------------- |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## API Endpoints

| Method | Route              | Description                                   |
| ------ | ------------------ | --------------------------------------------- |
| GET    | `/risk/zones`      | NER district GeoJSON with current risk levels |
| GET    | `/risk/predict`    | On-demand risk inference for coordinates      |
| GET    | `/sensors/live`    | 48-hour sensor time-series for a station      |
| GET    | `/alerts/active`   | Districts at High or Critical risk            |
| POST   | `/alerts/send-sms` | Trigger SMS alert for a district              |
| POST   | `/reports`         | Submit geo-tagged field report with photo     |
| GET    | `/reports`         | List all submitted field reports              |

## Project Structure

```
project/
├── backend/          # FastAPI app + ML model + mock data
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings via env vars
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models.py         # ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API route handlers
│   │   └── services/         # Business logic
│   ├── pyproject.toml        # uv project definition
│   └── requirements.txt      # pip-compatible deps
├── frontend/         # React + Vite + Leaflet
│   └── src/
│       ├── api/              # API client + React Query hooks
│       ├── components/       # React components
│       ├── i18n/             # Translation files
│       └── types/            # TypeScript types
├── data/             # GeoJSON, CSVs, rasters
├── notebooks/        # Training + feature engineering
└── README.md
```
