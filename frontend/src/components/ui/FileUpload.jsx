import React, { useState, useRef } from 'react';
import Button from './Button';
import { Upload, X, Image as ImageIcon, FileText, Download } from 'lucide-react';

export default function FileUpload({ onUpload, accept = 'image/*', multiple = false, maxSize = 5 * 1024 * 1024 }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return null;
      }
      return {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        id: Date.now() + Math.random(),
      };
    }).filter(Boolean);

    setFiles([...files, ...newFiles]);
    if (onUpload) {
      onUpload(newFiles.map(f => f.file));
    }
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={accept}
          multiple={multiple}
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-500">
          Maximum file size: {maxSize / 1024 / 1024}MB
        </p>
        <Button variant="secondary" size="sm" onClick={onButtonClick} className="mt-4">
          Browse Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate rounded-b-lg">
                {file.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
