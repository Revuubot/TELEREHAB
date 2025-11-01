# TeleRehab System

A complete tele-rehabilitation platform with exercise tracking, AI analysis, and clinician review.

## Project Structure

- `backend/` - FastAPI backend server
- `frontend/` - React frontend application
- `storage/` - Video storage
- `logs/` - Application logs

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL (optional - can use SQLite for development)

### Backend Setup

1. Create and activate Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate   # Windows
```

2. Install dependencies:
```bash
pip install -r app/requirements.txt
```

3. Configure environment:
```bash
cp ../.env.example .env
# Edit .env with your settings
```

4. Initialize database:
```bash
python app/scripts/seed_db.py
```

5. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Test Users

After running the seed script, these users will be available:

- Clinician:
  - Email: clinician@example.com
  - Password: Clinician123

- Patient:
  - Email: patient@example.com
  - Password: Patient123

## Storage Setup

The `storage/videos` directory must be writable by the application:

```bash
chmod -R 755 storage/videos
```

## Testing

Run backend tests:
```bash
cd backend
pytest tests/
```

## Features

- User authentication with JWT
- Role-based access control
- Video upload and storage
- AI-powered exercise analysis
- Real-time progress tracking
- Clinician review system
- Exercise prescription management

## Security Notes

- All passwords are hashed using bcrypt
- JWT tokens used for API authentication
- CORS enabled for frontend origin
- File upload validation
- Role-based access control on all endpoints
- AI outputs marked as assistive only

## API Documentation

When the backend is running, view the API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc