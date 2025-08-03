import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const TabPreview = ({ tabData, darkMode }) => {
  const [zoom, setZoom] = useState(1);
  const [scroll, setScroll] = useState(0);

  const stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];
  const stringTuning = [64, 59, 55, 50, 45, 40]; // MIDI note numbers for standard tuning

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setScroll(0);
  };

  const TablatureDisplay = () => {
    if (!tabData || !Array.isArray(tabData)) {
      return (
        <div className="text-center py-8">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            No tablature data available
          </p>
        </div>
      );
    }

    const chordWidth = 60 * zoom;
    const lineHeight = 30 * zoom;
    const totalWidth = tabData.length * chordWidth + 100;
    const totalHeight = 6 * lineHeight + 100;

    return (
      <div 
        className={`overflow-auto border rounded-lg ${
          darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'
        }`}
        style={{ height: '400px' }}
      >
        <svg 
          width={totalWidth} 
          height={totalHeight}
          className="block"
          style={{ minWidth: '100%' }}
        >
          {/* String lines */}
          {stringNames.map((stringName, stringIndex) => {
            const y = 50 + stringIndex * lineHeight;
            return (
              <g key={`string-${stringIndex}`}>
                {/* String label */}
                <text
                  x={20}
                  y={y + 5}
                  fontSize={12 * zoom}
                  fill={darkMode ? '#9ca3af' : '#6b7280'}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {stringName}
                </text>
                
                {/* String line */}
                <line
                  x1={40}
                  y1={y}
                  x2={totalWidth - 20}
                  y2={y}
                  stroke={darkMode ? '#4b5563' : '#d1d5db'}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Fret numbers */}
          {tabData.map((chord, chordIndex) => {
            const x = 50 + chordIndex * chordWidth;
            
            return (
              <g key={`chord-${chordIndex}`}>
                {/* Vertical line for timing */}
                <line
                  x1={x}
                  y1={50}
                  x2={x}
                  y2={50 + 5 * lineHeight}
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                
                {/* Fret numbers on each string */}
                {chord.strings.map((fret, stringIndex) => {
                  if (fret >= 0) {
                    const y = 50 + stringIndex * lineHeight;
                    return (
                      <g key={`fret-${chordIndex}-${stringIndex}`}>
                        {/* Fret number background */}
                        <circle
                          cx={x}
                          cy={y}
                          r={12 * zoom}
                          fill={darkMode ? '#1f2937' : '#ffffff'}
                          stroke={darkMode ? '#6b7280' : '#374151'}
                          strokeWidth={1}
                        />
                        
                        {/* Fret number */}
                        <text
                          x={x}
                          y={y + 4 * zoom}
                          fontSize={11 * zoom}
                          fill={darkMode ? '#f3f4f6' : '#1f2937'}
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {fret === 0 ? '0' : fret}
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}
                
                {/* Time marker */}
                <text
                  x={x}
                  y={40}
                  fontSize={10 * zoom}
                  fill={darkMode ? '#9ca3af' : '#6b7280'}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {chord.time?.toFixed(1)}s
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const getTabStats = () => {
    if (!tabData || !Array.isArray(tabData)) return null;

    const totalNotes = tabData.reduce((acc, chord) => {
      return acc + chord.strings.filter(fret => fret >= 0).length;
    }, 0);

    const usedStrings = new Set();
    const fretRange = { min: Infinity, max: -Infinity };

    tabData.forEach(chord => {
      chord.strings.forEach((fret, stringIndex) => {
        if (fret >= 0) {
          usedStrings.add(stringIndex);
          fretRange.min = Math.min(fretRange.min, fret);
          fretRange.max = Math.max(fretRange.max, fret);
        }
      });
    });

    return {
      totalChords: tabData.length,
      totalNotes,
      usedStrings: usedStrings.size,
      fretRange: fretRange.min === Infinity ? null : fretRange
    };
  };

  const stats = getTabStats();

  return (
    <div className="space-y-4">
      {/* Tab Statistics */}
      {stats && (
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h4 className="font-medium mb-2">Tablature Statistics</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Chords:</span>
              <span className="ml-2 font-semibold">{stats.totalChords}</span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Notes:</span>
              <span className="ml-2 font-semibold">{stats.totalNotes}</span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Strings Used:</span>
              <span className="ml-2 font-semibold">{stats.usedStrings}/6</span>
            </div>
            {stats.fretRange && (
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fret Range:</span>
                <span className="ml-2 font-semibold">
                  {stats.fretRange.min}-{stats.fretRange.max}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Zoom:
            </span>
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              disabled={zoom <= 0.5}
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm font-mono min-w-0">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`p-2 rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              disabled={zoom >= 2}
            >
              <ZoomIn size={16} />
            </button>
          </div>
          
          <button
            onClick={handleReset}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <RotateCcw size={16} className="mr-2 inline" />
            Reset View
          </button>
        </div>
      </div>

      {/* Tablature Display */}
      <div>
        <h4 className="font-medium mb-2">Guitar Tablature</h4>
        <TablatureDisplay />
      </div>

      {/* String Tuning Reference */}
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h4 className="font-medium mb-2">String Tuning (Standard)</h4>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {stringNames.map((name, index) => (
            <div key={index}>
              <div className={`font-mono font-bold ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {name}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                String {index + 1}
              </div>
            </div>
          ))}
        </div>
        <p className={`text-xs mt-2 text-center ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Numbers on strings indicate fret positions (0 = open string)
        </p>
      </div>
    </div>
  );
};

export default TabPreview;