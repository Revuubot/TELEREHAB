import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db import init_db, get_db
from app.models import User, Prescription
from app.auth import get_password_hash

def seed_database():
    # Initialize database
    init_db()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create clinician
        clinician = User(
            email="clinician@example.com",
            hashed_password=get_password_hash("Clinician123"),
            first_name="Dr",
            last_name="Smith",
            role="clinician"
        )
        db.add(clinician)
        
        # Create patient
        patient = User(
            email="patient@example.com",
            hashed_password=get_password_hash("Patient123"),
            first_name="John",
            last_name="Doe",
            role="patient"
        )
        db.add(patient)
        
        # Commit to get IDs
        db.commit()
        
        # Create prescription
        prescription = Prescription(
            clinician_id=clinician.id,
            patient_id=patient.id,
            exercise_type="arm_flexion",
            frequency=3,
            sets=3,
            reps_per_set=10
        )
        db.add(prescription)
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()