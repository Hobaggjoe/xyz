import React, { useState } from 'react';
import { Play, Download, FileText, Music, Loader, Eye } from 'lucide-react';
import axios from 'axios';
import MidiPreview from './MidiPreview';
import TabPreview from './TabPreview';

const ProcessedFilesList = ({ files, onUpdateFileStatus, darkMode }) => {
  const [processing, setProcessing] = useState({});
  const [activeTab, setActiveTab] = useState({});
  
  const handleProcessToMidi = async (fileId) => {
    setProcessing(prev => ({ ...prev, [fileId]: 'midi' }));
    
    try {
      const response = await axios.post(`http://localhost:8000/process/${fileId}`);
      
      if (response.data.status === 'processed') {
        onUpdateFileStatus(fileId, { 
          midiProcessed: true,
          midiFile: response.data.midi_file 
        });
      }
    } catch (error) {
      console.error('MIDI processing error:', error);
      alert('Failed to process audio to MIDI. Please try again.');
    } finally {
      setProcessing(prev => ({ ...prev, [fileId]: null }));
    }
  };

  const handleGenerateTab = async (fileId) => {
    setProcessing(prev => ({ ...prev, [fileId]: 'tab' }));
    
    try {
      const response = await axios.post(`http://localhost:8000/generate-tab/${fileId}`);
      
      if (response.data.status === 'tab_generated') {
        onUpdateFileStatus(fileId, { 
          tabGenerated: true,
          tabData: response.data.tab_data 
        });
      }
    } catch (error) {
      console.error('Tab generation error:', error);
      alert('Failed to generate guitar tab. Please try again.');
    } finally {
      setProcessing(prev => ({ ...prev, [fileId]: null }));
    }
  };

  const handleDownloadMidi = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:8000/download/midi/${fileId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileId}.mid`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download MIDI file.');
    }
  };

  const handleDownloadPdf = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:8000/download/pdf/${fileId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileId}_guitar_tab.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF file.');
    }
  };

  const setFileActiveTab = (fileId, tab) => {
    setActiveTab(prev => ({ ...prev, [fileId]: tab }));
  };

  return (
    <div className="space-y-6">
      {files.map((file) => (
        <div 
          key={file.id}
          className={`rounded-lg border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          {/* File Header */}
          <div className={`p-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Music size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                <div>
                  <h3 className="font-medium">{file.filename}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status: {file.status}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {!file.midiProcessed && (
                  <button
                    onClick={() => handleProcessToMidi(file.id)}
                    disabled={processing[file.id]}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      processing[file.id] === 'midi'
                        ? 'opacity-50 cursor-not-allowed'
                        : darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {processing[file.id] === 'midi' ? (
                      <><Loader size={16} className="animate-spin mr-2 inline" />Processing...</>
                    ) : (
                      <><Play size={16} className="mr-2 inline" />Process to MIDI</>
                    )}
                  </button>
                )}
                
                {file.midiProcessed && !file.tabGenerated && (
                  <button
                    onClick={() => handleGenerateTab(file.id)}
                    disabled={processing[file.id]}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      processing[file.id] === 'tab'
                        ? 'opacity-50 cursor-not-allowed'
                        : darkMode
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {processing[file.id] === 'tab' ? (
                      <><Loader size={16} className="animate-spin mr-2 inline" />Generating...</>
                    ) : (
                      <><FileText size={16} className="mr-2 inline" />Generate Tab</>
                    )}
                  </button>
                )}
                
                {file.midiProcessed && (
                  <button
                    onClick={() => handleDownloadMidi(file.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <Download size={16} className="mr-2 inline" />MIDI
                  </button>
                )}
                
                {file.tabGenerated && (
                  <button
                    onClick={() => handleDownloadPdf(file.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <Download size={16} className="mr-2 inline" />PDF
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Tabs */}
          {(file.midiProcessed || file.tabGenerated) && (
            <div>
              {/* Tab Headers */}
              <div className={`flex border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {file.midiProcessed && (
                  <button
                    onClick={() => setFileActiveTab(file.id, 'midi')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab[file.id] === 'midi'
                        ? (darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600')
                        : (darkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700')
                    }`}
                  >
                    <Eye size={16} className="mr-2 inline" />
                    MIDI Preview
                  </button>
                )}
                
                {file.tabGenerated && (
                  <button
                    onClick={() => setFileActiveTab(file.id, 'tab')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab[file.id] === 'tab'
                        ? (darkMode ? 'border-purple-400 text-purple-400' : 'border-purple-600 text-purple-600')
                        : (darkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700')
                    }`}
                  >
                    <FileText size={16} className="mr-2 inline" />
                    Guitar Tab
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab[file.id] === 'midi' && file.midiProcessed && (
                  <MidiPreview fileId={file.id} darkMode={darkMode} />
                )}
                
                {activeTab[file.id] === 'tab' && file.tabGenerated && (
                  <TabPreview tabData={file.tabData} darkMode={darkMode} />
                )}
                
                {!activeTab[file.id] && file.midiProcessed && (
                  <div className="text-center py-8">
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Click on a tab above to preview the results
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProcessedFilesList;