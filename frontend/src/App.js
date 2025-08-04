import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ProcessedFilesList from './components/ProcessedFilesList';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [processedFiles, setProcessedFiles] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const handleFilesUploaded = (uploadResults) => {
    const newFiles = uploadResults.results
      .filter(result => result.status === 'uploaded')
      .map(result => ({
        id: result.file_id,
        filename: result.filename,
        status: 'uploaded',
        midiProcessed: false,
        tabGenerated: false
      }));
    
    setProcessedFiles(prev => [...prev, ...newFiles]);
  };

  const updateFileStatus = (fileId, updates) => {
    setProcessedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1a1a1a' : '#f9f9f9',
      color: darkMode ? 'white' : '#333',
      transition: 'all 0.3s'
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Audio to Guitar Tab</h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Convert your audio files to MIDI and guitar tablature
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-colors ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-600 shadow-md'
            }`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <FileUploader 
            onFilesUploaded={handleFilesUploaded}
            darkMode={darkMode}
          />
        </div>

        {/* Processed Files Section */}
        {processedFiles.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Processed Files</h2>
            <ProcessedFilesList 
              files={processedFiles}
              onUpdateFileStatus={updateFileStatus}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Features Section */}
        <div className={`mt-16 p-8 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'
        }`}>
          <h2 className="text-2xl font-semibold mb-6">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                🎵
              </div>
              <h3 className="font-semibold mb-2">Audio Upload</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Support for MP3, WAV, and FLAC files up to 50MB
              </p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                🎹
              </div>
              <h3 className="font-semibold mb-2">MIDI Transcription</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Advanced AI-powered audio-to-MIDI conversion
              </p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-purple-900 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                🎸
              </div>
              <h3 className="font-semibold mb-2">Guitar Tablature</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Intelligent string-fret assignment for playable tabs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
