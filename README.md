# Audio to Guitar Tab Converter

A comprehensive web application that converts audio files (MP3, WAV, FLAC) to MIDI and then generates guitar tablature with intelligent string-fret assignment.

## Features

### 🎵 Audio Processing
- Upload multiple audio files simultaneously
- Support for MP3, WAV, and FLAC formats
- File size limit: 50MB per file
- Drag-and-drop interface with validation

### 🎹 MIDI Transcription
- AI-powered audio-to-MIDI conversion using Basic Pitch
- Interactive piano roll visualization
- MIDI file download capability
- Detailed audio analysis and statistics

### 🎸 Guitar Tablature Generation
- Intelligent string-fret assignment for playability
- Standard guitar tuning (E A D G B E)
- Zoomable and scrollable tablature display
- PDF export for printing

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Dark mode toggle
- Progress indicators for processing
- File status tracking and management
- Tab-based preview system

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Audio Processing**: 
  - Basic Pitch (Google's audio-to-MIDI transcription)
  - librosa (audio analysis)
  - pretty_midi (MIDI manipulation)
- **PDF Generation**: ReportLab
- **File Handling**: aiofiles, python-multipart

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Upload**: react-dropzone
- **HTTP Client**: Axios

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Upload Audio**: Drag and drop audio files or click to select files (MP3, WAV, FLAC)
2. **Process to MIDI**: Click "Process to MIDI" to transcribe audio to MIDI format
3. **Generate Tab**: Click "Generate Tab" to convert MIDI to guitar tablature
4. **Preview**: Use the tab interface to preview MIDI (piano roll) and guitar tablature
5. **Export**: Download MIDI files or export tablature as PDF

## API Endpoints

### File Upload
- `POST /upload` - Upload multiple audio files
- `GET /status/{file_id}` - Get processing status

### Processing
- `POST /process/{file_id}` - Convert audio to MIDI
- `POST /generate-tab/{file_id}` - Generate guitar tablature from MIDI

### Downloads
- `GET /download/midi/{file_id}` - Download MIDI file
- `GET /download/pdf/{file_id}` - Download guitar tab as PDF

## Project Structure

```
audio-to-guitar-tab/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── audio_processor.py      # Audio-to-MIDI transcription
│   ├── midi_to_tab.py         # MIDI-to-tablature conversion
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/               # Uploaded audio files
│   └── outputs/               # Generated MIDI and PDF files
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.js      # File upload interface
│   │   │   ├── ProcessedFilesList.js # File management
│   │   │   ├── MidiPreview.js       # MIDI visualization
│   │   │   └── TabPreview.js        # Guitar tablature display
│   │   ├── App.js             # Main application component
│   │   └── index.css          # Tailwind CSS imports
│   ├── package.json           # Node.js dependencies
│   └── tailwind.config.js     # Tailwind configuration
└── README.md
```

## Configuration

### Audio Processing Settings
- Maximum file size: 50MB
- Supported formats: MP3, WAV, FLAC
- Processing timeout: 5 minutes per file
- Sample rate: 22050 Hz (optimized for Basic Pitch)

### Guitar Tablature Settings
- Tuning: Standard (E A D G B E)
- Fret range: 0-24
- String preference: Middle strings preferred for better playability

## Development

### Adding New Features
1. Backend changes go in the appropriate module (`audio_processor.py`, `midi_to_tab.py`)
2. Frontend components are in `frontend/src/components/`
3. API endpoints are defined in `backend/main.py`

### Testing
- Backend: Run `pytest` (tests not included in this initial version)
- Frontend: Run `npm test`

## Troubleshooting

### Common Issues

1. **MIDI processing fails**: 
   - Check audio file format and quality
   - Ensure file size is under 50MB
   - Try with shorter audio clips first

2. **Frontend build issues**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Backend startup issues**:
   - Verify Python version (3.8+)
   - Check all dependencies are installed
   - Ensure no port conflicts on 8000

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Acknowledgments

- **Basic Pitch**: Google's open-source audio-to-MIDI transcription model
- **Tailwind CSS**: For the beautiful, responsive UI
- **FastAPI**: For the high-performance backend framework
- **React**: For the interactive frontend framework