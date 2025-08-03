import os
import numpy as np
import librosa
import soundfile as sf
from pathlib import Path
from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import tempfile
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor


class AudioProcessor:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.output_dir = Path("outputs")
        self.output_dir.mkdir(exist_ok=True)
    
    async def transcribe_to_midi(self, audio_file_path: Path, file_id: str) -> Path:
        """
        Transcribe audio file to MIDI using Basic Pitch
        """
        try:
            # Run the transcription in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            midi_path = await loop.run_in_executor(
                self.executor, 
                self._transcribe_sync, 
                audio_file_path, 
                file_id
            )
            return midi_path
            
        except Exception as e:
            raise Exception(f"MIDI transcription failed: {str(e)}")
    
    def _transcribe_sync(self, audio_file_path: Path, file_id: str) -> Path:
        """
        Synchronous MIDI transcription using Basic Pitch
        """
        try:
            # Load and preprocess audio
            audio_data, sample_rate = librosa.load(str(audio_file_path), sr=22050)
            
            # Ensure audio is not too long (limit to 5 minutes for processing)
            max_duration = 5 * 60  # 5 minutes
            if len(audio_data) / sample_rate > max_duration:
                audio_data = audio_data[:int(max_duration * sample_rate)]
            
            # Create temporary file for Basic Pitch processing
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                sf.write(temp_file.name, audio_data, sample_rate)
                temp_audio_path = temp_file.name
            
            try:
                # Run Basic Pitch transcription
                predict_and_save(
                    [temp_audio_path],
                    str(self.output_dir),
                    save_midi=True,
                    sonify_midi=False,
                    save_model_outputs=False,
                    save_notes=False
                )
                
                # Find the generated MIDI file and rename it
                temp_midi_name = Path(temp_audio_path).stem + "_basic_pitch.mid"
                temp_midi_path = self.output_dir / temp_midi_name
                
                final_midi_path = self.output_dir / f"{file_id}.mid"
                
                if temp_midi_path.exists():
                    temp_midi_path.rename(final_midi_path)
                else:
                    raise Exception("Basic Pitch failed to generate MIDI file")
                
                return final_midi_path
                
            finally:
                # Clean up temporary audio file
                if os.path.exists(temp_audio_path):
                    os.unlink(temp_audio_path)
                    
        except Exception as e:
            raise Exception(f"Audio processing error: {str(e)}")
    
    def get_audio_info(self, audio_file_path: Path) -> dict:
        """
        Get basic information about the audio file
        """
        try:
            audio_data, sample_rate = librosa.load(str(audio_file_path), sr=None)
            duration = len(audio_data) / sample_rate
            
            return {
                "duration": duration,
                "sample_rate": sample_rate,
                "channels": 1 if audio_data.ndim == 1 else audio_data.shape[0],
                "format": audio_file_path.suffix.lower()
            }
        except Exception as e:
            return {"error": f"Could not read audio file: {str(e)}"}
    
    async def validate_audio_file(self, file_content: bytes, filename: str) -> dict:
        """
        Validate uploaded audio file
        """
        try:
            # Check file extension
            file_ext = Path(filename).suffix.lower()
            supported_formats = {'.mp3', '.wav', '.flac'}
            
            if file_ext not in supported_formats:
                return {
                    "valid": False,
                    "error": f"Unsupported format. Supported: {', '.join(supported_formats)}"
                }
            
            # Check file size (50MB limit)
            max_size = 50 * 1024 * 1024
            if len(file_content) > max_size:
                return {
                    "valid": False,
                    "error": f"File too large. Maximum size: {max_size // (1024*1024)}MB"
                }
            
            # Try to read audio data to validate format
            with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as temp_file:
                temp_file.write(file_content)
                temp_path = temp_file.name
            
            try:
                # Attempt to load with librosa
                audio_data, sr = librosa.load(temp_path, sr=None, duration=1.0)  # Load just 1 second for validation
                duration_estimate = len(file_content) / (len(audio_data) * 2)  # Rough estimate
                
                return {
                    "valid": True,
                    "duration_estimate": duration_estimate,
                    "sample_rate": sr,
                    "format": file_ext
                }
                
            finally:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            return {
                "valid": False,
                "error": f"Invalid audio file: {str(e)}"
            }