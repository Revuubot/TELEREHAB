import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, BackgroundTasks
from sqlmodel import select, Session as DBSession, Session as SQLSession
from typing import List

from .auth import get_current_user, get_current_active_patient
from .db import get_db, engine
from .models import User, Session as SessionModel, Report, Prescription
from .schemas import SessionCreate, SessionResponse
from .config import STORAGE_PATH
from .logger import logger
from .ai.infer import analyze_video

router = APIRouter()

async def process_video(session_id: int, video_path: str):
    """Background worker: creates its own DB session, runs analysis and writes a Report."""
    try:
        # Run AI analysis
        report_data = analyze_video(video_path)

        # Create a new DB session for background work
        with SQLSession(engine) as bg_db:
            # Map analyzer output to Report model fields
            report = Report(
                session_id=session_id,
                reps_counted=report_data.get("reps", 0),
                avg_rom=report_data.get("avg_rom", 0.0),
                errors=report_data.get("errors", "[]"),
                score=report_data.get("score", 0.0),
                rep_roms=report_data.get("rep_roms", "[]")
            )
            bg_db.add(report)

            # Update session status
            session_obj = bg_db.get(SessionModel, session_id)
            if session_obj:
                session_obj.report_ready = True

            bg_db.commit()
            logger.info(f"Video analysis completed for session {session_id}")

    except Exception as e:
        logger.error(f"Error processing video for session {session_id}: {str(e)}")
        # Do not re-raise to avoid crashing background task runner

@router.post("/upload", response_model=SessionResponse)
async def upload_session(
    prescription_id: int,
    video: UploadFile,
    background_tasks: BackgroundTasks,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_active_patient)
):
    # Verify prescription exists and belongs to user
    prescription = db.exec(
        select(Prescription).where(
            Prescription.id == prescription_id,
            Prescription.patient_id == current_user.id
        )
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found or unauthorized"
        )
    
    # Save video file
    video_filename = f"{current_user.id}_{prescription_id}_{video.filename}"
    video_path = os.path.join(STORAGE_PATH, video_filename)
    
    with open(video_path, "wb") as buffer:
        buffer.write(await video.read())
    
    # Create session
    session = SessionModel(
        patient_id=current_user.id,
        prescription_id=prescription_id,
        video_path=video_path
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Schedule background processing (background task will open its own DB session)
    background_tasks.add_task(process_video, session.id, video_path)
    
    logger.info(f"New session uploaded by {current_user.email}")
    return session

@router.get("", response_model=List[SessionResponse])
def list_sessions(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "clinician":
        sessions = db.exec(
            select(SessionModel)
            .join(Prescription)
            .where(Prescription.clinician_id == current_user.id)
        ).all()
    else:
        sessions = db.exec(
            select(SessionModel).where(SessionModel.patient_id == current_user.id)
        ).all()
    
    return sessions

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Verify access rights
    if current_user.role == "patient" and session.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    elif current_user.role == "clinician":
        prescription = db.get(Prescription, session.prescription_id)
        if prescription.clinician_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
    
    return session