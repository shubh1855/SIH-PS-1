from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid

from app.database import get_db
from app.models import FieldReport
from app.schemas import FieldReportResponse

router = APIRouter(prefix="/reports", tags=["Field Reports"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")

@router.post("/", response_model=FieldReportResponse)
def create_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    photo_path = None
    if photo:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}_{photo.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_path = filename
        
    report = FieldReport(
        latitude=latitude,
        longitude=longitude,
        description=description,
        photo_path=photo_path
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Construct response
    return FieldReportResponse(
        id=report.id,
        latitude=report.latitude,
        longitude=report.longitude,
        description=report.description,
        photo_url=f"/uploads/{report.photo_path}" if report.photo_path else None,
        created_at=report.created_at.isoformat()
    )

@router.get("/", response_model=List[FieldReportResponse])
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(FieldReport).all()
    results = []
    for report in reports:
        results.append(
            FieldReportResponse(
                id=report.id,
                latitude=report.latitude,
                longitude=report.longitude,
                description=report.description,
                photo_url=f"/uploads/{report.photo_path}" if report.photo_path else None,
                created_at=report.created_at.isoformat()
            )
        )
    return results
