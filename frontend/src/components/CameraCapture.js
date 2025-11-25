import React, { useRef, useState, useEffect, useCallback } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ onAnalyze, loading }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      alert('Error accessing camera: ' + error.message);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        setCapturedImage(blob);
        setIsCaptured(true);
      }, 'image/jpeg', 0.8);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsCaptured(false);
  };

  const analyze = async () => {
    if (capturedImage) {
      await onAnalyze(capturedImage);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="camera-capture card">
      {!isCaptured ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-video"
            style={{ display: stream ? 'block' : 'none' }}
          />

          {!stream && (
            <div className="camera-placeholder">
              <p>Click "Start Camera" to begin</p>
            </div>
          )}

          <div className="camera-controls">
            <button
              onClick={startCamera}
              disabled={!!stream}
              className="btn btn-primary"
            >
              Start Camera
            </button>
            <button
              onClick={capture}
              disabled={!stream}
              className="btn btn-success"
            >
              Capture & Analyze
            </button>
            <button
              onClick={stopCamera}
              disabled={!stream}
              className="btn btn-secondary"
            >
              Stop Camera
            </button>
          </div>
        </>
      ) : (
        <div className="camera-preview">
          <img
            src={URL.createObjectURL(capturedImage)}
            alt="Captured"
            className="captured-image"
          />
          <div className="preview-controls">
            <button onClick={retake} className="btn btn-outline">
              Retake
            </button>
            <button
              onClick={analyze}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Analyzing...' : 'Analyze This Image'}
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;
