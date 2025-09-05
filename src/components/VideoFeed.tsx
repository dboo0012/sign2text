import { useState, useRef, useEffect } from "react";

interface VideoFeedProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const VideoFeed = ({
  isRecording,
  onStartRecording,
  onStopRecording,
}: VideoFeedProps) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    // cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraOn(false);
      alert(
        "Camera not found. Please check your camera permissions and try again."
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Camera Off Placeholder */}
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-lg">Camera is off</p>
              <p className="text-sm">Click the camera button to start</p>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isCameraOn
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <span className="text-lg">{isCameraOn ? "📹" : "📷"}</span>
          <span>{isCameraOn ? "Stop Camera" : "Start Camera"}</span>
        </button>

        {/* Recording Controls */}
        {isCameraOn && (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRecording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <span className="text-lg">{isRecording ? "⏹️" : "▶️"}</span>
            <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
