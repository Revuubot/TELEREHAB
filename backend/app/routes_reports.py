from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, Session as DBSession
from typing import List

from .auth import get_current_active_clinician
from .db import get_db
from .models import User, Report, Session as SessionModel, Prescription
from .schemas import ReportResponse, ReportApproval
from .logger import logger

router = APIRouter()

@router.get("/{session_id}", response_model=ReportResponse)
def get_report(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_active_clinician)
):
    # Fetch report by session id
    report = db.exec(select(Report).where(Report.session_id == session_id)).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Verify clinician owns the prescription for this session
    session_obj = db.get(SessionModel, session_id)
    if not session_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    prescription = db.get(Prescription, session_obj.prescription_id)
    if not prescription or prescription.clinician_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to view this report")

    return report

@router.post("/{report_id}/approve", response_model=ReportResponse)
def approve_report(
    report_id: int,
    approval: ReportApproval,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_active_clinician)
):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    session_obj = db.get(SessionModel, report.session_id)
    if not session_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    prescription = db.get(Prescription, session_obj.prescription_id)
    if not prescription or prescription.clinician_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to approve this report")

    report.clinician_approved = approval.approved
    report.clinician_notes = approval.notes
    
    db.commit()
    db.refresh(report)
    
    logger.info(f"Report {report_id} {'approved' if approval.approved else 'rejected'} by {current_user.email}")
    return report