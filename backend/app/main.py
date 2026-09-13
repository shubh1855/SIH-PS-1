from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import Base, engine
from app.services.scheduler import start_scheduler
from app.services.ml_model import load_model
from app.routers import risk, sensors, alerts, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    app.state.scheduler = start_scheduler()
    app.state.model = load_model()
    yield
    # Shutdown
    app.state.scheduler.shutdown()

app = FastAPI(title="NER Landslide Early Warning System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk.router)
app.include_router(sensors.router)
app.include_router(alerts.router)
app.include_router(reports.router)

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def root():
    return {"status": "running", "message": "NER Landslide EWS API"}
