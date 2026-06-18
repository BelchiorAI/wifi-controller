from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Session as DBSession
from ..schemas import SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("/", response_model=List[SessionResponse])
def get_sessions(page: int = 1, limit: int = 10, venue_id: Optional[int] = None, ap_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(DBSession)
    if venue_id:
        query = query.filter(DBSession.venue_id == venue_id)
    if ap_id:
        query = query.filter(DBSession.access_point_id == ap_id)
    skip = (page - 1) * limit
    return query.offset(skip).limit(limit).all()

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
