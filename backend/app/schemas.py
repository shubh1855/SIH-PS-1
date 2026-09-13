from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import List, Optional

class RiskLevel(str, Enum):
    LOW = "LOW"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class DistrictRisk(BaseModel):
    district_name: str
    risk_level: RiskLevel
    probability: float

class SensorReading(BaseModel):
    timestamp: str
    rainfall_mm: float
    soil_moisture_pct: float

class SensorResponse(BaseModel):
    station_id: str
    district: str
    readings: List[SensorReading]

class FieldReportCreate(BaseModel):
    latitude: float
    longitude: float
    description: str

class FieldReportResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    description: str
    photo_url: Optional[str]
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)

class AlertRequest(BaseModel):
    district: str
    risk_level: RiskLevel
    phone_number: str
    language: str = 'en'

class AlertResponse(BaseModel):
    success: bool
    message: str
    alert_id: Optional[int] = None
