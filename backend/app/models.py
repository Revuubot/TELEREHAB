from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class UserRole(str, Enum):
    PATIENT = "patient"
    CLINICIAN = "clinician"
    ADMIN = "admin"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, sa_column_kwargs={"unique": True})
    hashed_password: str
    first_name: str
    last_name: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Prescription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    clinician_id: int = Field(foreign_key="user.id")
    patient_id: int = Field(foreign_key="user.id")
    exercise_type: str
    frequency: int  # times per week
    sets: int
    reps_per_set: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Session(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="user.id")
    prescription_id: int = Field(foreign_key="prescription.id")
    video_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    report_ready: bool = Field(default=False)


class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="session.id")
    reps_counted: int
    avg_rom: float
    errors: str  # JSON string of error list
    score: float
    rep_roms: str  # JSON string of ROM values per rep
    clinician_approved: bool = Field(default=False)
    clinician_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Consent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    consented_at: datetime = Field(default_factory=datetime.utcnow)
    consent_type: str
    consent_version: str