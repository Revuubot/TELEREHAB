from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from .auth import get_current_active_clinician, get_current_user
from .db import get_db
from .models import User, Prescription, UserRole
from .schemas import PrescriptionCreate, PrescriptionResponse
from .logger import logger

router = APIRouter()

@router.post("", response_model=PrescriptionResponse)
def create_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_clinician)
):
    # Verify patient exists
    patient = db.get(User, prescription.patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_prescription = Prescription(
        **prescription.dict(),
        clinician_id=current_user.id
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    logger.info(f"New prescription created by {current_user.email} for patient {patient.email}")
    return db_prescription

@router.get("", response_model=List[PrescriptionResponse])
def list_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.CLINICIAN:
        prescriptions = db.exec(
            select(Prescription).where(Prescription.clinician_id == current_user.id)
        ).all()
    else:
        prescriptions = db.exec(
            select(Prescription).where(Prescription.patient_id == current_user.id)
        ).all()
    
    return prescriptions

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prescription = db.get(Prescription, prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    # Verify access rights
    if (current_user.role == UserRole.PATIENT and prescription.patient_id != current_user.id) or \
       (current_user.role == UserRole.CLINICIAN and prescription.clinician_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this prescription"
        )
    
    return prescription