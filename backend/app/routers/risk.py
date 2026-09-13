from fastapi import APIRouter
import json
import os
import copy
from app.services.scheduler import get_risk_store
from app.schemas import DistrictRisk
from app.services.ml_model import predict_risk

router = APIRouter(prefix="/risk", tags=["Risk Assessment"])

geojson_cache = None

def _get_geojson_path():
    """Resolve path to data/ner_districts.geojson relative to project root."""
    return os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "ner_districts.geojson")

@router.get("/zones")
def get_zones():
    global geojson_cache
    if geojson_cache is None:
        file_path = _get_geojson_path()
        try:
            with open(file_path, "r") as f:
                geojson_cache = json.load(f)
        except FileNotFoundError:
            geojson_cache = {"type": "FeatureCollection", "features": []}
            
    risk_store = get_risk_store()
    
    # Enrich geojson with current risk levels
    enriched_geojson = copy.deepcopy(geojson_cache)
    for feature in enriched_geojson.get("features", []):
        district_name = feature.get("properties", {}).get("name")
        if district_name and district_name in risk_store:
            feature["properties"]["risk_level"] = risk_store[district_name]["risk_level"]
            feature["properties"]["probability"] = risk_store[district_name]["probability"]
            
    return enriched_geojson

@router.get("/predict", response_model=DistrictRisk)
def predict(latitude: float, longitude: float, rainfall_mm: float, soil_moisture_pct: float):
    features = {
        "latitude": latitude,
        "longitude": longitude,
        "rainfall_mm": rainfall_mm,
        "soil_moisture_pct": soil_moisture_pct
    }
    
    pred = predict_risk(features)
    
    return DistrictRisk(
        district_name="Custom",
        risk_level=pred["risk_level"],
        probability=pred["probability"]
    )
