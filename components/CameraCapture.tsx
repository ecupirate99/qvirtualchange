import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import { FileData } from '../types';

interface CameraCaptureProps {
  onCapture: (fileData: FileData) => void;
  onClose: () => void;
  defaultFacingMode?: 'user' | 'environment';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  onClose,
  defaultFacingMode = 'user' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please ensure you have granted permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Flip horizontally if using front camera (mirror effect)
      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to Base64/File
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = dataUrl.split(',')[1];
      
      // Create a File object
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          const fileData: FileData = {
            file,
            previewUrl: dataUrl,
            base64,
            mimeType: 'image/jpeg'
          };
          
          onCapture(fileData);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
    setIsCapturing(false);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <h3 className="text-white font-medium">Take Photo</h3>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <X size={24} />
        </button>
      </div>

      {/* Video Preview */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {error ? (
          <div className="text-center p-6 max-w-sm">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={onClose} variant="secondary">Close</Button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className={`max-w-full max-h-full object-contain ${facingMode === 'user' ? '-scale-x-100' : ''}`}
          />
        )}
      </div>
      
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-around z-10">
        
        {/* Switch Camera */}
        <button 
          onClick={toggleCamera}
          className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw size={24} />
        </button>

        {/* Capture Button */}
        <button 
          onClick={handleCapture}
          disabled={isCapturing}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>

        {/* Spacer to balance layout (or flash toggle in future) */}
        <div className="w-14"></div>
      </div>
    </div>
  );
};

export default CameraCapture;