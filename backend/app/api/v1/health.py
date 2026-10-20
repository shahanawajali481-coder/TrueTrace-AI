"""
Health Router: Liveness and database connectivity checks.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

START_TIME = datetime.now(timezone.utc)

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    uptime_sec = (datetime.now(timezone.utc) - START_TIME).total_seconds()

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "uptime_seconds": uptime_sec,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
