from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Venue
from ..schemas import VenueResponse

router = APIRouter(prefix="/venues", tags=["venues"])

@router.get("/", response_model=List[VenueResponse])
def get_venues(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    venues = db.query(Venue).offset(skip).limit(limit).all()
    return venues

@router.get("/{venue_id}", response_model=VenueResponse)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue
