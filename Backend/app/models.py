from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()


class SyncStatus(str, enum.Enum):
    success = "success"
    failed = "failed"
    in_progress = "in_progress"


class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String, unique=True, nullable=False, index=True)  # ID from mock controller
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    access_points = relationship("AccessPoint", back_populates="venue", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="venue", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Venue id={self.id} name={self.name} external_id={self.external_id}>"


class AccessPoint(Base):
    __tablename__ = "access_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String, unique=True, nullable=False, index=True)  # ID from mock controller
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    mac_address = Column(String, nullable=True)
    status = Column(String, default="unknown")  # e.g. "online", "offline", "unknown"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    venue = relationship("Venue", back_populates="access_points")
    sessions = relationship("Session", back_populates="access_point", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AccessPoint id={self.id} name={self.name} venue_id={self.venue_id}>"


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String, unique=True, nullable=False, index=True)  # ID from mock controller
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)        # denormalised for easy querying
    access_point_id = Column(Integer, ForeignKey("access_points.id"), nullable=False)
    device_mac = Column(String, nullable=True)
    connected_at = Column(DateTime, nullable=True)
    disconnected_at = Column(DateTime, nullable=True)   # null = session still active
    duration_seconds = Column(Float, nullable=True)
    data_usage_mb = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    venue = relationship("Venue", back_populates="sessions")
    access_point = relationship("AccessPoint", back_populates="sessions")

    def __repr__(self):
        return f"<Session id={self.id} device_mac={self.device_mac} venue_id={self.venue_id}>"


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(Enum(SyncStatus), nullable=False, default=SyncStatus.in_progress)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    venues_synced = Column(Integer, default=0)
    access_points_synced = Column(Integer, default=0)
    sessions_synced = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)         # populated on failure
    raw_payload = Column(Text, nullable=True)           # JSON string of mock controller response

    def __repr__(self):
        return f"<SyncLog id={self.id} status={self.status} started_at={self.started_at}>"