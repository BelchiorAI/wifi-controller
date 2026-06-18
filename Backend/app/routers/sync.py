import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from ..database import get_db, SessionLocal
from ..models import SyncLog, SyncStatus, Venue, AccessPoint, Session as DBSession
from ..schemas import SyncStatusResponse, SyncTriggerResponse, SyncLogListResponse

# Need to adjust the import path for the mock client based on the final structure
from mock_controller.client import fetch_controller_data, MockControllerError

router = APIRouter(prefix="/sync", tags=["sync"])

def perform_sync(sync_log_id: int, simulate_failure: bool = False):
    # Use a new DB session since this runs in the background
    db = SessionLocal()
    try:
        # Retrieve the sync log
        sync_log = db.query(SyncLog).filter(SyncLog.id == sync_log_id).first()
        if not sync_log:
            return

        try:
            # Fetch data
            data = fetch_controller_data(simulate_failure=simulate_failure)
            
            # Save raw payload
            sync_log.raw_payload = json.dumps(data)
            db.commit()

            # Process Venues
            venues_data = data.get("venues", [])
            venues_synced = 0
            venue_id_map = {}  # external_id -> internal_id
            
            for v_data in venues_data:
                ext_id = v_data["id"]
                venue = db.query(Venue).filter(Venue.external_id == ext_id).first()
                if not venue:
                    venue = Venue(external_id=ext_id)
                    db.add(venue)
                
                venue.name = v_data.get("name")
                venue.address = v_data.get("address")
                db.commit()
                db.refresh(venue)
                venue_id_map[ext_id] = venue.id
                venues_synced += 1

            # Process Access Points
            aps_data = data.get("access_points", [])
            aps_synced = 0
            ap_id_map = {} # external_id -> internal_id
            
            for ap_data in aps_data:
                ext_id = ap_data["id"]
                venue_ext_id = ap_data.get("venue_id")
                venue_int_id = venue_id_map.get(venue_ext_id)
                
                if not venue_int_id:
                    continue # Skip if venue not found
                    
                ap = db.query(AccessPoint).filter(AccessPoint.external_id == ext_id).first()
                if not ap:
                    ap = AccessPoint(external_id=ext_id, venue_id=venue_int_id)
                    db.add(ap)
                    
                ap.name = ap_data.get("name")
                ap.mac_address = ap_data.get("mac_address")
                ap.status = ap_data.get("status", "unknown")
                ap.venue_id = venue_int_id
                db.commit()
                db.refresh(ap)
                ap_id_map[ext_id] = ap.id
                aps_synced += 1

            # Process Sessions
            sessions_data = data.get("sessions", [])
            sessions_synced = 0
            
            for s_data in sessions_data:
                ext_id = s_data["id"]
                venue_ext_id = s_data.get("venue_id")
                ap_ext_id = s_data.get("access_point_id")
                
                venue_int_id = venue_id_map.get(venue_ext_id)
                ap_int_id = ap_id_map.get(ap_ext_id)
                
                if not venue_int_id or not ap_int_id:
                    continue
                    
                session = db.query(DBSession).filter(DBSession.external_id == ext_id).first()
                if not session:
                    session = DBSession(external_id=ext_id, venue_id=venue_int_id, access_point_id=ap_int_id)
                    db.add(session)
                    
                session.device_mac = s_data.get("device_mac")
                
                connected_str = s_data.get("connected_at")
                if connected_str:
                    session.connected_at = datetime.fromisoformat(connected_str)
                    
                disconnected_str = s_data.get("disconnected_at")
                if disconnected_str:
                    session.disconnected_at = datetime.fromisoformat(disconnected_str)
                    
                session.duration_seconds = s_data.get("duration_seconds")
                session.data_usage_mb = s_data.get("data_usage_mb")
                session.venue_id = venue_int_id
                session.access_point_id = ap_int_id
                
                db.commit()
                sessions_synced += 1

            # Update sync log success
            sync_log.status = SyncStatus.success
            sync_log.completed_at = datetime.utcnow()
            sync_log.venues_synced = venues_synced
            sync_log.access_points_synced = aps_synced
            sync_log.sessions_synced = sessions_synced
            db.commit()

        except Exception as e:
            # Update sync log failure
            sync_log.status = SyncStatus.failed
            sync_log.completed_at = datetime.utcnow()
            sync_log.error_message = str(e)
            db.commit()
    finally:
        db.close()

@router.post("/", response_model=SyncTriggerResponse)
def trigger_sync(background_tasks: BackgroundTasks, simulate_failure: bool = False, db: Session = Depends(get_db)):
    # Check if a sync is already in progress
    in_progress = db.query(SyncLog).filter(SyncLog.status == SyncStatus.in_progress).first()
    if in_progress:
        raise HTTPException(status_code=400, detail="A sync is already in progress.")
        
    # Create new sync log
    sync_log = SyncLog(status=SyncStatus.in_progress, started_at=datetime.utcnow())
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)
    
    # Run sync in background
    background_tasks.add_task(perform_sync, sync_log.id, simulate_failure)
    
    return {"message": "Sync started in the background", "sync_log_id": sync_log.id}

@router.get("/status", response_model=SyncStatusResponse)
def get_sync_status(db: Session = Depends(get_db)):
    # Get the latest sync log
    latest_sync = db.query(SyncLog).order_by(SyncLog.started_at.desc()).first()
    if not latest_sync:
        raise HTTPException(status_code=404, detail="No sync logs found")
    return latest_sync

@router.get("/logs", response_model=list[SyncLogListResponse])
def get_sync_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(SyncLog).order_by(SyncLog.started_at.desc()).offset(skip).limit(limit).all()
    return logs
