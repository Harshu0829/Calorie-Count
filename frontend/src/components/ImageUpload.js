import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onAnalyze, loading }) => {
  const [image, setImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyze = async () => {
    if (image) {
      await onAnalyze(image);
    }
  };

  return (
    <div className="image-upload card">
      {!image ? (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>Drag & drop your food image here</p>
          <p className="upload-hint">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="upload-preview">
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded"
            className="uploaded-image"
          />
          <div className="preview-controls">
            <button onClick={removeImage} className="btn btn-outline">
              Remove
            </button>
            <button
              onClick={analyze}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

