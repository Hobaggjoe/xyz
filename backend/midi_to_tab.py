import pretty_midi
import numpy as np
from pathlib import Path
import json
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import asyncio
from concurrent.futures import ThreadPoolExecutor


@dataclass
class TabNote:
    """Represents a note in guitar tablature"""
    time: float
    string: int  # 0-5 (low E to high E)
    fret: int    # 0-24
    duration: float
    velocity: int


@dataclass
class GuitarString:
    """Represents a guitar string with its tuning"""
    number: int
    open_pitch: int  # MIDI note number


class MidiToTabConverter:
    def __init__(self):
        # Standard guitar tuning (MIDI note numbers)
        self.guitar_strings = [
            GuitarString(0, 40),  # Low E (E2)
            GuitarString(1, 45),  # A (A2)
            GuitarString(2, 50),  # D (D3)
            GuitarString(3, 55),  # G (G3)
            GuitarString(4, 59),  # B (B3)
            GuitarString(5, 64),  # High E (E4)
        ]
        
        self.max_fret = 24
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.output_dir = Path("outputs")
        self.output_dir.mkdir(exist_ok=True)
    
    async def midi_to_tab(self, midi_file_path: Path, file_id: str) -> dict:
        """Convert MIDI file to guitar tablature"""
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._convert_sync,
                midi_file_path,
                file_id
            )
            return result
        except Exception as e:
            raise Exception(f"MIDI to tab conversion failed: {str(e)}")
    
    def _convert_sync(self, midi_file_path: Path, file_id: str) -> dict:
        """Synchronous MIDI to tab conversion"""
        try:
            # Load MIDI file
            midi_data = pretty_midi.PrettyMIDI(str(midi_file_path))
            
            # Extract notes from all instruments
            all_notes = []
            for instrument in midi_data.instruments:
                if not instrument.is_drum:  # Skip drum tracks
                    all_notes.extend(instrument.notes)
            
            # Sort notes by start time
            all_notes.sort(key=lambda n: n.start)
            
            # Convert MIDI notes to guitar tablature
            tab_notes = self._convert_notes_to_tab(all_notes)
            
            # Group notes by time for chord detection
            tab_data = self._group_notes_by_time(tab_notes)
            
            # Generate PDF
            pdf_path = self._generate_pdf(tab_data, file_id)
            
            return {
                "tab_data": tab_data,
                "pdf_generated": pdf_path.exists(),
                "total_notes": len(tab_notes),
                "duration": midi_data.get_end_time()
            }
            
        except Exception as e:
            raise Exception(f"Conversion error: {str(e)}")
    
    def _convert_notes_to_tab(self, midi_notes: List[pretty_midi.Note]) -> List[TabNote]:
        """Convert MIDI notes to guitar tablature notes"""
        tab_notes = []
        
        for note in midi_notes:
            # Find best string/fret combination for this note
            best_position = self._find_best_position(note.pitch)
            
            if best_position:
                string, fret = best_position
                tab_note = TabNote(
                    time=note.start,
                    string=string,
                    fret=fret,
                    duration=note.end - note.start,
                    velocity=note.velocity
                )
                tab_notes.append(tab_note)
        
        return tab_notes
    
    def _find_best_position(self, midi_pitch: int) -> Optional[Tuple[int, int]]:
        """Find the best string/fret combination for a MIDI pitch"""
        possible_positions = []
        
        # Check each string to see if the note can be played
        for guitar_string in self.guitar_strings:
            fret = midi_pitch - guitar_string.open_pitch
            
            # Check if fret is within playable range
            if 0 <= fret <= self.max_fret:
                # Calculate a "playability score" - prefer lower frets and middle strings
                string_preference = abs(guitar_string.number - 2.5)  # Prefer middle strings
                fret_preference = fret * 0.1  # Prefer lower frets
                score = string_preference + fret_preference
                
                possible_positions.append((guitar_string.number, fret, score))
        
        if not possible_positions:
            return None
        
        # Return the position with the best score
        possible_positions.sort(key=lambda x: x[2])
        return possible_positions[0][0], possible_positions[0][1]
    
    def _group_notes_by_time(self, tab_notes: List[TabNote]) -> List[Dict]:
        """Group notes that should be played together (chords)"""
        if not tab_notes:
            return []
        
        grouped_notes = []
        current_group = []
        current_time = tab_notes[0].time
        time_tolerance = 0.05  # 50ms tolerance for grouping notes
        
        for note in tab_notes:
            if abs(note.time - current_time) <= time_tolerance:
                current_group.append(note)
            else:
                # Save current group and start new one
                if current_group:
                    grouped_notes.append(self._create_chord_data(current_group, current_time))
                current_group = [note]
                current_time = note.time
        
        # Don't forget the last group
        if current_group:
            grouped_notes.append(self._create_chord_data(current_group, current_time))
        
        return grouped_notes
    
    def _create_chord_data(self, notes: List[TabNote], time: float) -> Dict:
        """Create chord data structure for frontend"""
        # Initialize all strings as empty
        strings = [-1] * 6  # -1 means no note on that string
        
        for note in notes:
            if 0 <= note.string <= 5:
                strings[note.string] = note.fret
        
        return {
            "time": time,
            "strings": strings,  # [string0_fret, string1_fret, ..., string5_fret]
            "duration": max(note.duration for note in notes),
            "note_count": len(notes)
        }
    
    def _generate_pdf(self, tab_data: List[Dict], file_id: str) -> Path:
        """Generate PDF of guitar tablature"""
        pdf_path = self.output_dir / f"{file_id}_tab.pdf"
        
        # Create PDF
        c = canvas.Canvas(str(pdf_path), pagesize=A4)
        width, height = A4
        
        # Set up fonts and spacing
        c.setFont("Courier", 10)
        line_height = 20
        margin = 50
        tab_width = width - 2 * margin
        
        # Title
        c.setFont("Helvetica-Bold", 16)
        c.drawString(margin, height - 50, f"Guitar Tablature - {file_id}")
        
        # String labels
        c.setFont("Courier", 10)
        string_names = ["E", "B", "G", "D", "A", "E"]
        y_start = height - 100
        
        # Draw tablature
        y_pos = y_start
        measures_per_line = 8
        current_measure = 0
        
        for i, chord in enumerate(tab_data):
            if current_measure % measures_per_line == 0:
                # Start new line
                y_pos -= line_height * 8  # Space for 6 strings + spacing
                
                if y_pos < margin:
                    # Start new page
                    c.showPage()
                    c.setFont("Courier", 10)
                    y_pos = height - 100
                
                # Draw string lines and labels
                for string_idx in range(6):
                    string_y = y_pos - string_idx * line_height
                    c.drawString(margin - 30, string_y, string_names[string_idx])
                    c.line(margin, string_y, margin + tab_width, string_y)
            
            # Draw fret numbers
            x_pos = margin + (current_measure % measures_per_line) * (tab_width / measures_per_line)
            
            for string_idx in range(6):
                string_y = y_pos - string_idx * line_height
                fret = chord["strings"][string_idx]
                
                if fret >= 0:
                    fret_text = str(fret) if fret > 0 else "0"
                    c.drawString(x_pos, string_y - 5, fret_text)
            
            current_measure += 1
        
        c.save()
        return pdf_path
    
    def get_note_name(self, midi_pitch: int) -> str:
        """Convert MIDI pitch to note name"""
        note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        octave = (midi_pitch // 12) - 1
        note = note_names[midi_pitch % 12]
        return f"{note}{octave}"
    
    def analyze_midi_content(self, midi_file_path: Path) -> Dict:
        """Analyze MIDI file content for preview"""
        try:
            midi_data = pretty_midi.PrettyMIDI(str(midi_file_path))
            
            analysis = {
                "duration": midi_data.get_end_time(),
                "tempo_changes": len(midi_data.tempo_changes),
                "instruments": [],
                "total_notes": 0,
                "pitch_range": {"min": float('inf'), "max": 0}
            }
            
            for i, instrument in enumerate(midi_data.instruments):
                if not instrument.is_drum:
                    inst_info = {
                        "program": instrument.program,
                        "name": instrument.name or f"Instrument {i}",
                        "note_count": len(instrument.notes),
                        "pitch_range": {
                            "min": min(note.pitch for note in instrument.notes) if instrument.notes else 0,
                            "max": max(note.pitch for note in instrument.notes) if instrument.notes else 0
                        }
                    }
                    analysis["instruments"].append(inst_info)
                    analysis["total_notes"] += len(instrument.notes)
                    
                    if instrument.notes:
                        analysis["pitch_range"]["min"] = min(analysis["pitch_range"]["min"], inst_info["pitch_range"]["min"])
                        analysis["pitch_range"]["max"] = max(analysis["pitch_range"]["max"], inst_info["pitch_range"]["max"])
            
            if analysis["pitch_range"]["min"] == float('inf'):
                analysis["pitch_range"]["min"] = 0
            
            return analysis
            
        except Exception as e:
            return {"error": f"Could not analyze MIDI: {str(e)}"}