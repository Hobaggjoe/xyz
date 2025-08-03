import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const FileUploader = ({ onFilesUploaded, darkMode }) => {
  const [uploadStatus, setUploadStatus] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file) => {
    const supportedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-flac'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!supportedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac)$/i)) {
      return { valid: false, error: 'Unsupported file type. Please use MP3, WAV, or FLAC.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 50MB.' };
    }

    return { valid: true };
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (isUploading) return;

    setIsUploading(true);
    const fileValidations = acceptedFiles.map(file => ({
      file,
      ...validateFile(file)
    }));

    // Update status with validation results
    const initialStatus = fileValidations.map(({ file, valid, error }) => ({
      name: file.name,
      status: valid ? 'uploading' : 'error',
      error: error || null,
      progress: 0
    }));

    setUploadStatus(initialStatus);

    // Only upload valid files
    const validFiles = fileValidations.filter(f => f.valid).map(f => f.file);
    
    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadStatus(prev => 
            prev.map(status => 
              status.status === 'uploading' 
                ? { ...status, progress }
                : status
            )
          );
        }
      });

      // Update status based on server response
      const updatedStatus = initialStatus.map(status => {
        const result = response.data.results.find(r => r.filename === status.name);
        if (result) {
          return {
            ...status,
            status: result.status === 'uploaded' ? 'success' : 'error',
            error: result.status === 'error' ? result.message : null,
            progress: 100
          };
        }
        return status;
      });

      setUploadStatus(updatedStatus);
      onFilesUploaded(response.data);

      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus([]);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => 
        prev.map(status => ({
          ...status,
          status: 'error',
          error: 'Upload failed. Please try again.'
        }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac']
    },
    multiple: true,
    disabled: isUploading
  });

  return (
    <div className={`rounded-lg border-2 border-dashed transition-colors ${
      isDragActive 
        ? (darkMode ? 'border-blue-400 bg-blue-900/20' : 'border-blue-400 bg-blue-50')
        : (darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white')
    } ${isUploading ? 'opacity-75' : ''}`}>
      <div {...getRootProps()} className="p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {isUploading ? (
              <Loader className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            ) : (
              <Upload className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Audio Files'}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Drag & drop audio files here, or click to select
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Supports MP3, WAV, FLAC • Max 50MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus.length > 0 && (
        <div className={`border-t p-4 space-y-2 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h4 className="font-medium text-sm mb-2">Upload Status:</h4>
          {uploadStatus.map((status, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 flex-1">
                <File size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className="text-sm truncate">{status.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {status.status === 'uploading' && (
                  <>
                    <div className={`w-20 bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : ''}`}>
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${status.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{status.progress}%</span>
                  </>
                )}
                
                {status.status === 'success' && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
                
                {status.status === 'error' && (
                  <XCircle size={16} className="text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;