from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import AccessPoint
from ..schemas import AccessPointResponse

router = APIRouter(prefix="/access-points", tags=["access_points"])

@router.get("/", response_model=List[AccessPointResponse])
def get_access_points(venue_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(AccessPoint)
    if venue_id:
        query = query.filter(AccessPoint.venue_id == venue_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{ap_id}", response_model=AccessPointResponse)
def get_access_point(ap_id: int, db: Session = Depends(get_db)):
    ap = db.query(AccessPoint).filter(AccessPoint.id == ap_id).first()
    if not ap:
        raise HTTPException(status_code=404, detail="Access point not found")
    return ap
