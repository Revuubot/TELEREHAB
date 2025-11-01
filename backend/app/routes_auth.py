from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from .auth import (
    verify_password,
    create_access_token,
    get_password_hash,
    get_current_user,
)
from .config import ACCESS_TOKEN_EXPIRE_MINUTES
from .db import get_db
from .models import User
from .schemas import UserCreate, UserResponse, Token
from .logger import logger

router = APIRouter()


@router.get("/users/seed")
def seed_users(db: Session = Depends(get_db)):
    """Create sample clinician and patient and a prescription if they don't exist.
    This is a convenience endpoint for development only.
    """
    from .auth import get_password_hash
    from .models import User, Prescription

    clinician_email = "clinician@example.com"
    patient_email = "patient@example.com"

    clinician = db.exec(select(User).where(User.email == clinician_email)).first()
    if not clinician:
        clinician = User(
            email=clinician_email,
            hashed_password=get_password_hash("Clinician123"),
            first_name="Dr",
            last_name="Smith",
            role="clinician"
        )
        db.add(clinician)

    patient = db.exec(select(User).where(User.email == patient_email)).first()
    if not patient:
        patient = User(
            email=patient_email,
            hashed_password=get_password_hash("Patient123"),
            first_name="John",
            last_name="Doe",
            role="patient"
        )
        db.add(patient)

    db.commit()

    # Ensure a prescription exists
    pres = db.exec(select(Prescription).where(Prescription.patient_id == patient.id)).first()
    if not pres:
        pres = Prescription(
            clinician_id=clinician.id,
            patient_id=patient.id,
            exercise_type="arm_flexion",
            frequency=3,
            sets=3,
            reps_per_set=10
        )
        db.add(pres)
        db.commit()

    return {"status": "seeded", "clinician": clinician.email, "patient": patient.email}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"New user registered: {user.email}")
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user