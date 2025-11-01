# TeleRehab Backend

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate   # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
- Copy `.env.example` to `.env`
- Update values as needed
- For development, you can use SQLite by setting:
  ```
  DATABASE_URL=sqlite:///./telerehab.db
  ```

4. Initialize database:
```bash
python app/scripts/seed_db.py
```

This will create:
- Clinician account: clinician@example.com / Clinician123
- Patient account: patient@example.com / Patient123

## Running the Server

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login and get JWT token

### Prescriptions
- POST `/api/v1/prescriptions` - Create prescription (clinician only)
- GET `/api/v1/prescriptions` - List prescriptions

### Sessions
- POST `/api/v1/sessions/upload` - Upload session video (patient only)
- GET `/api/v1/sessions` - List sessions
- GET `/api/v1/sessions/{id}` - Get session details

### Reports
- GET `/api/v1/reports/{session_id}` - Get AI report
- POST `/api/v1/reports/{report_id}/approve` - Approve/reject report (clinician only)

## Example API Usage

1. Register a new patient:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "Patient123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "patient"
  }'
```

2. Login:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/form-data" \
  -F "username=patient@example.com" \
  -F "password=Patient123"
```

3. Create prescription (as clinician):
```bash
curl -X POST http://localhost:8000/api/v1/prescriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 2,
    "exercise_type": "arm_flexion",
    "frequency": 3,
    "sets": 3,
    "reps_per_set": 10
  }'
```

4. Upload session video (as patient):
```bash
curl -X POST http://localhost:8000/api/v1/sessions/upload \
  -H "Authorization: Bearer <token>" \
  -F "video=@/path/to/video.mp4" \
  -F "prescription_id=1"
```

5. Get session report:
```bash
curl http://localhost:8000/api/v1/reports/1 \
  -H "Authorization: Bearer <token>"
```