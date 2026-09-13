from fastapi import APIRouter
from app.schemas import SensorResponse
from app.services.mock_data import generate_sensor_data, NER_STATIONS

router = APIRouter(prefix="/sensors", tags=["Sensor Data"])

@router.get("/live", response_model=SensorResponse)
def get_live_sensors(station_id: str = "station_01"):
    district = NER_STATIONS.get(station_id, "Unknown")
    readings = generate_sensor_data(station_id)
    
    return SensorResponse(
        station_id=station_id,
        district=district,
        readings=readings
    )
