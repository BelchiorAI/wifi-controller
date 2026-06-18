from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from .models import SyncStatus

# --- Venue Schemas ---
class VenueBase(BaseModel):
    external_id: str
    name: str
    address: Optional[str] = None

class VenueResponse(VenueBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Access Point Schemas ---
class AccessPointBase(BaseModel):
    external_id: str
    venue_id: int
    name: str
    mac_address: Optional[str] = None
    status: str

class AccessPointResponse(AccessPointBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Session Schemas ---
class SessionBase(BaseModel):
    external_id: str
    venue_id: int
    access_point_id: int
    device_mac: Optional[str] = None
    connected_at: Optional[datetime] = None
    disconnected_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    data_usage_mb: Optional[float] = None

class SessionResponse(SessionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Sync Log Schemas ---
class SyncStatusResponse(BaseModel):
    id: int
    status: SyncStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    venues_synced: int
    access_points_synced: int
    sessions_synced: int
    error_message: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class SyncTriggerResponse(BaseModel):
    message: str
    sync_log_id: int

class SyncLogListResponse(BaseModel):
    id: int
    status: SyncStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    venues_synced: int
    access_points_synced: int
    sessions_synced: int
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
