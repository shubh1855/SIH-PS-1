from apscheduler.schedulers.background import BackgroundScheduler
import logging
from app.services.mock_data import NER_STATIONS, generate_sensor_data
from app.services.ml_model import batch_predict

logger = logging.getLogger(__name__)

risk_store: dict = {}

def get_risk_store() -> dict:
    return risk_store

def run_risk_update():
    logger.info("Running scheduled risk update...")
    districts_features = []
    
    for station_id, district_name in NER_STATIONS.items():
        data = generate_sensor_data(station_id, hours=1)
        # Aggregate or extract latest features
        latest = data[-1] if data else {"rainfall_mm": 0, "soil_moisture_pct": 0}
        
        districts_features.append({
            "district_name": district_name,
            "features": latest
        })
        
    predictions = batch_predict(districts_features)
    
    for district_name, pred in predictions.items():
        old_pred = risk_store.get(district_name, {})
        old_risk = old_pred.get("risk_level")
        new_risk = pred["risk_level"]
        
        if old_risk != "CRITICAL" and new_risk == "CRITICAL":
            logger.warning(f"CRITICAL ALERT: District {district_name} transitioned to CRITICAL risk!")
            
        risk_store[district_name] = pred
        
    logger.info("Risk update complete.")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_risk_update, 'interval', minutes=15)
    scheduler.start()
    # Run once immediately
    run_risk_update()
    return scheduler
