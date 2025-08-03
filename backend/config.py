"""
Configuration settings for the Audio to Guitar Tab Converter backend
"""
import os
from pathlib import Path

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# File upload settings
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
SUPPORTED_FORMATS = {".mp3", ".wav", ".flac"}

# Directory settings
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Audio processing settings
SAMPLE_RATE = 22050
MAX_DURATION = 5 * 60  # 5 minutes
PROCESSING_TIMEOUT = 300  # 5 minutes

# CORS settings
FRONTEND_URLS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]