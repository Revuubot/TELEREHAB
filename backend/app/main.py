from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routes_auth import router as auth_router
from .routes_prescriptions import router as prescriptions_router
from .routes_sessions import router as sessions_router
from .routes_reports import router as reports_router
from .config import API_V1_PREFIX
from .logger import logger
from .db import init_db

# Initialize FastAPI app
app = FastAPI(title="TeleRehab API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefixes
app.include_router(auth_router, prefix=f"{API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(prescriptions_router, prefix=f"{API_V1_PREFIX}/prescriptions", tags=["prescriptions"])
app.include_router(sessions_router, prefix=f"{API_V1_PREFIX}/sessions", tags=["sessions"])
app.include_router(reports_router, prefix=f"{API_V1_PREFIX}/reports", tags=["reports"])

# Serve uploaded videos under /videos
app.mount("/videos", StaticFiles(directory=__import__('os').path.abspath(__import__('pathlib').Path(__file__).resolve().parent.parent.parent / 'storage' / 'videos')), name="videos")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting TeleRehab API")
    init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}