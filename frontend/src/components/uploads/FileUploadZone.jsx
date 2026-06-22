import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';

const FileUploadZone = ({
  endpoint = '/uploads',
  onUploadComplete = null,
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  additionalData = {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { uploads, uploadFile, uploadMultiple, clearUpload, error } = useFileUpload();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = async (files) => {
    // Validate files
    for (const file of files) {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return;
      }
    }

    if (!multiple && files.length > 1) {
      alert('Only one file can be uploaded at a time');
      return;
    }

    // Upload files
    if (multiple && files.length > 1) {
      const results = await uploadMultiple(files, endpoint, null, additionalData);
      onUploadComplete?.(results);
    } else {
      const result = await uploadFile(files[0], endpoint, null, additionalData);
      if (result) {
        onUploadComplete?.([result]);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-900 dark:text-white">Drop files here</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">
            Max size: {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Upload Error</p>
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.entries(uploads).map(([fileId, upload]) => (
        <div key={fileId} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {upload.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {upload.status === 'uploading' && (
                <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
              )}
              {upload.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {upload.name}
              </span>
            </div>
            {upload.status !== 'uploading' && (
              <button
                onClick={() => clearUpload(fileId)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                upload.status === 'success'
                  ? 'bg-green-500'
                  : upload.status === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {upload.progress}%
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {upload.status === 'uploading' && 'Uploading...'}
              {upload.status === 'success' && 'Complete'}
              {upload.status === 'error' && upload.error}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileUploadZone;
