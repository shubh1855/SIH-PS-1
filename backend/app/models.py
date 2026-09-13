from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base
from datetime import datetime, timezone

class FieldReport(Base):
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(String)
    photo_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AlertLog(Base):
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String)
    risk_level = Column(String)
    phone_number = Column(String)
    message = Column(String)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
