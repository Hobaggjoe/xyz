import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const MidiPreview = ({ fileId, darkMode }) => {
  const [midiData, setMidiData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading MIDI data
    // In a real implementation, you'd fetch this from your backend
    setTimeout(() => {
      setMidiData({
        notes: [
          { pitch: 60, start: 0, end: 0.5, velocity: 80 },
          { pitch: 64, start: 0.5, end: 1.0, velocity: 75 },
          { pitch: 67, start: 1.0, end: 1.5, velocity: 85 },
          { pitch: 72, start: 1.5, end: 2.0, velocity: 90 }
        ],
        instruments: [
          { name: 'Piano', program: 0, noteCount: 4 }
        ]
      });
      setDuration(2.0);
      setLoading(false);
    }, 1000);
  }, [fileId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, you'd integrate with a MIDI player library
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeSliderChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const PianoRoll = () => {
    if (!midiData) return null;

    const noteHeight = 4;
    const timeScale = 200; // pixels per second
    const rollHeight = 128 * noteHeight; // 128 MIDI notes

    return (
      <div className={`relative overflow-auto border rounded-lg ${
        darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'
      }`} style={{ height: '300px' }}>
        <svg 
          width={duration * timeScale} 
          height={rollHeight}
          className="block"
        >
          {/* Grid lines */}
          {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
            <line
              key={`time-${i}`}
              x1={i * timeScale}
              y1={0}
              x2={i * timeScale}
              y2={rollHeight}
              stroke={darkMode ? '#374151' : '#e5e7eb'}
              strokeWidth={1}
            />
          ))}
          
          {/* Octave lines */}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`octave-${i}`}
              x1={0}
              y1={i * 12 * noteHeight}
              x2={duration * timeScale}
              y2={i * 12 * noteHeight}
              stroke={darkMode ? '#4b5563' : '#d1d5db'}
              strokeWidth={1}
            />
          ))}

          {/* Notes */}
          {midiData.notes.map((note, index) => (
            <rect
              key={index}
              x={note.start * timeScale}
              y={(127 - note.pitch) * noteHeight}
              width={(note.end - note.start) * timeScale}
              height={noteHeight - 1}
              fill={`hsl(${(note.pitch * 3) % 360}, 70%, 60%)`}
              opacity={note.velocity / 127}
              rx={1}
            />
          ))}

          {/* Playhead */}
          <line
            x1={currentTime * timeScale}
            y1={0}
            x2={currentTime * timeScale}
            y2={rollHeight}
            stroke="#ef4444"
            strokeWidth={2}
          />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading MIDI preview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* MIDI Info */}
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h4 className="font-medium mb-2">MIDI Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Duration:</span>
            <span className="ml-2 font-mono">{formatTime(duration)}</span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Notes:</span>
            <span className="ml-2">{midiData?.notes.length || 0}</span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Instruments:</span>
            <span className="ml-2">{midiData?.instruments.length || 0}</span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tempo:</span>
            <span className="ml-2">120 BPM</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayPause}
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={handleReset}
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw size={20} />
          </button>

          <div className="flex items-center space-x-2 flex-1">
            <Volume2 size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100}
              onChange={handleTimeSliderChange}
              className="flex-1"
            />
            <span className="text-sm font-mono min-w-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Piano Roll */}
      <div>
        <h4 className="font-medium mb-2">Piano Roll View</h4>
        <PianoRoll />
      </div>

      {/* Instruments */}
      {midiData?.instruments && (
        <div>
          <h4 className="font-medium mb-2">Instruments</h4>
          <div className="space-y-2">
            {midiData.instruments.map((instrument, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{instrument.name}</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {instrument.noteCount} notes
                  </span>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Program: {instrument.program}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MidiPreview;