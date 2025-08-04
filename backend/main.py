from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import tempfile
import shutil
from pathlib import Path
from typing import List
import uuid
import asyncio

# from audio_processor import AudioProcessor
# from midi_to_tab import MidiToTabConverter

app = FastAPI(title="Audio to Guitar Tab Converter")

# Enable CORS for frontend
from config import FRONTEND_URLS
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors (temporarily disabled for testing)
# audio_processor = AudioProcessor()
# tab_converter = MidiToTabConverter()

# Supported audio formats
SUPPORTED_FORMATS = {".mp3", ".wav", ".flac"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Storage for processed files
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Audio to Guitar Tab Converter API"}

@app.post("/upload")
async def upload_audio_files(files: List[UploadFile] = File(...)):
    """Upload multiple audio files and process them"""
    results = []
    
    for file in files:
        try:
            # Validate file format
            file_extension = Path(file.filename).suffix.lower()
            if file_extension not in SUPPORTED_FORMATS:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": f"Unsupported format. Supported: {', '.join(SUPPORTED_FORMATS)}"
                })
                continue
            
            # Check file size
            file_content = await file.read()
            if len(file_content) > MAX_FILE_SIZE:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                })
                continue
            
            # Generate unique file ID
            file_id = str(uuid.uuid4())
            
            # Save uploaded file
            file_path = UPLOAD_DIR / f"{file_id}{file_extension}"
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            results.append({
                "filename": file.filename,
                "file_id": file_id,
                "status": "uploaded",
                "message": "File uploaded successfully"
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": f"Upload failed: {str(e)}"
            })
    
    return {"results": results}

@app.post("/process/{file_id}")
async def process_audio_to_midi(file_id: str):
    """Convert audio file to MIDI"""
    try:
        # Find the uploaded file
        audio_file = None
        for ext in SUPPORTED_FORMATS:
            potential_file = UPLOAD_DIR / f"{file_id}{ext}"
            if potential_file.exists():
                audio_file = potential_file
                break
        
        if not audio_file:
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Process audio to MIDI (placeholder - will implement with full dependencies)
        # midi_path = await audio_processor.transcribe_to_midi(audio_file, file_id)
        
        # For now, create a placeholder MIDI file
        midi_path = OUTPUT_DIR / f"{file_id}.mid"
        midi_path.touch()  # Create empty file for testing
        
        return {
            "file_id": file_id,
            "status": "processed",
            "midi_file": f"{file_id}.mid",
            "message": "Audio successfully transcribed to MIDI"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/generate-tab/{file_id}")
async def generate_guitar_tab(file_id: str):
    """Generate guitar tablature from MIDI"""
    try:
        midi_file = OUTPUT_DIR / f"{file_id}.mid"
        if not midi_file.exists():
            raise HTTPException(status_code=404, detail="MIDI file not found")
        
        # Convert MIDI to guitar tab (placeholder - will implement with full dependencies)
        # tab_data = await tab_converter.midi_to_tab(midi_file, file_id)
        
        # Placeholder tab data for testing
        tab_data = [
            {"time": 0.0, "strings": [3, -1, -1, -1, -1, -1], "duration": 0.5, "note_count": 1},
            {"time": 0.5, "strings": [-1, 2, -1, -1, -1, -1], "duration": 0.5, "note_count": 1},
            {"time": 1.0, "strings": [-1, -1, 0, -1, -1, -1], "duration": 0.5, "note_count": 1},
        ]
        
        # Create placeholder PDF
        pdf_path = OUTPUT_DIR / f"{file_id}_tab.pdf"
        pdf_path.touch()  # Create empty file for testing
        
        return {
            "file_id": file_id,
            "status": "tab_generated",
            "tab_data": tab_data,
            "message": "Guitar tablature generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tab generation failed: {str(e)}")

@app.get("/download/midi/{file_id}")
async def download_midi(file_id: str):
    """Download MIDI file"""
    midi_file = OUTPUT_DIR / f"{file_id}.mid"
    if not midi_file.exists():
        raise HTTPException(status_code=404, detail="MIDI file not found")
    
    return FileResponse(
        path=midi_file,
        filename=f"{file_id}.mid",
        media_type="audio/midi"
    )

@app.get("/download/pdf/{file_id}")
async def download_pdf(file_id: str):
    """Download guitar tab as PDF"""
    pdf_file = OUTPUT_DIR / f"{file_id}_tab.pdf"
    if not pdf_file.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=pdf_file,
        filename=f"{file_id}_guitar_tab.pdf",
        media_type="application/pdf"
    )

@app.get("/status/{file_id}")
async def get_processing_status(file_id: str):
    """Get processing status for a file"""
    audio_exists = any((UPLOAD_DIR / f"{file_id}{ext}").exists() for ext in SUPPORTED_FORMATS)
    midi_exists = (OUTPUT_DIR / f"{file_id}.mid").exists()
    pdf_exists = (OUTPUT_DIR / f"{file_id}_tab.pdf").exists()
    
    return {
        "file_id": file_id,
        "audio_uploaded": audio_exists,
        "midi_processed": midi_exists,
        "tab_generated": pdf_exists
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)