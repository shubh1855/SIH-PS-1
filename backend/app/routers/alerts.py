from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import AlertRequest, AlertResponse, DistrictRisk
from app.services.scheduler import get_risk_store
from app.database import get_db
from app.models import AlertLog
from app.config import get_settings
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/active")
def get_active_alerts():
    risk_store = get_risk_store()
    alerts = []
    for district, data in risk_store.items():
        if data["risk_level"] in ["HIGH", "CRITICAL"]:
            alerts.append({
                "district_name": district,
                "risk_level": data["risk_level"],
                "probability": data["probability"]
            })
    return alerts

@router.post("/send-sms", response_model=AlertResponse)
def send_sms(request: AlertRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    message_text = f"ALERT: {request.risk_level} landslide risk in {request.district}."
    
    success = False
    
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=message_text,
                from_=settings.TWILIO_FROM_NUMBER,
                to=request.phone_number
            )
            logger.info(f"Sent SMS to {request.phone_number}, SID: {message.sid}")
            success = True
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
    else:
        logger.info(f"Twilio credentials missing. Would send SMS to {request.phone_number}: {message_text}")
        success = True
        
    alert_log = AlertLog(
        district=request.district,
        risk_level=request.risk_level.value,
        phone_number=request.phone_number,
        message=message_text
    )
    db.add(alert_log)
    db.commit()
    db.refresh(alert_log)
    
    return AlertResponse(
        success=success,
        message="SMS processed" if success else "Failed to send SMS",
        alert_id=alert_log.id
    )
