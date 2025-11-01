import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./telerehab.db")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Storage
STORAGE_PATH = os.getenv("STORAGE_PATH", str(BASE_DIR / "storage" / "videos"))

# Ensure storage directory exists
Path(STORAGE_PATH).mkdir(parents=True, exist_ok=True)

# Logging
LOG_FILE = str(BASE_DIR / "logs" / "app.log")
Path(LOG_FILE).parent.mkdir(parents=True, exist_ok=True)

# API Settings
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = "TeleRehab API"