import React, { useState, useRef, useEffect } from 'react';

const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera if available
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      onCapture(base64Image);
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        <div className="flex justify-between w-full mb-4">
          <h3 className="font-bold text-lg dark:text-white">Take Product Photo</h3>
          <button onClick={handleCancel} className="text-slate-500 hover:text-red-500">✖</button>
        </div>
        
        {error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-4 w-full">
          <button 
            onClick={handleCancel}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          {!error && (
            <button 
              onClick={takeSnapshot}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
              📸 Capture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
