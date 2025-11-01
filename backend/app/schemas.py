from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from .models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PrescriptionBase(BaseModel):
    exercise_type: str
    frequency: int
    sets: int
    reps_per_set: int

class PrescriptionCreate(PrescriptionBase):
    patient_id: int

class PrescriptionResponse(PrescriptionBase):
    id: int
    clinician_id: int
    patient_id: int
    created_at: datetime

class SessionBase(BaseModel):
    prescription_id: int

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    id: int
    patient_id: int
    video_path: str
    created_at: datetime
    report_ready: bool

class ReportBase(BaseModel):
    reps_counted: int
    avg_rom: float
    errors: str
    score: float
    rep_roms: str

class ReportCreate(ReportBase):
    session_id: int

class ReportResponse(ReportBase):
    id: int
    clinician_approved: bool
    clinician_notes: Optional[str]
    created_at: datetime

class ReportApproval(BaseModel):
    approved: bool
    notes: Optional[str]