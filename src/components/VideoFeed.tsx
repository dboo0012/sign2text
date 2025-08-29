import { useState, useRef, useEffect } from "react";
import type { OpenPoseData } from "../types/pose"; 

interface VideoFeedProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}

const VideoFeed = ({
  isRecording,
  onStartRecording,
  onStopRecording
}: VideoFeedProps) => {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isPoseDetectionOn, setIsPoseDetectionOn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isCameraOn) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [isCameraOn])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsCameraOn(false)
      // Show error message to user
      alert('Camera not found. Please check your camera permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
  }

  const togglePoseDetection = () => {
    setIsPoseDetectionOn(!isPoseDetectionOn)
  }


  //////////////////////////

  // --- 🔹 Simulate receiving OpenPoseData (replace with WebSocket hook later) ---
  useEffect(() => {
    if (!isPoseDetectionOn) return;

    const interval = setInterval(async () => {
      const fakeData: OpenPoseData = {
        version: 1.3,
        people: [
          {
            person_id: [-1],
            pose_keypoints_2d: [100, 100, 0.9, 150, 200, 0.8, 200, 300, 0.7],
            face_keypoints_2d: [],
            hand_left_keypoints_2d: [],
            hand_right_keypoints_2d: [],
            pose_keypoints_3d: [],
            face_keypoints_3d: [],
            hand_left_keypoints_3d: [],
            hand_right_keypoints_3d: [],
          },
        ],
      };

      try {
        const res = await fetch("http://localhost:8000/openpose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fakeData),
        });

        console.log("✅ Sent data, backend response:", await res.json());
      } catch (err) {
        console.error("❌ Failed to send OpenPoseData", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPoseDetectionOn]);



/////////////
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
        
        {/* Pose Detection Overlay Canvas */}
        {isPoseDetectionOn && (
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        )}
        
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

        {/* Pose Detection Toggle */}
        {isCameraOn && (
          <div className="absolute top-4 right-4">
            <button
              onClick={togglePoseDetection}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isPoseDetectionOn
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {isPoseDetectionOn ? 'Pose ON' : 'Pose OFF'}
            </button>
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
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <span className="text-lg">{isCameraOn ? '📹' : '📷'}</span>
          <span>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        {/* Recording Controls */}
        {isCameraOn && (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <span className="text-lg">{isRecording ? '⏹️' : '▶️'}</span>
            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>
        )}

      </div>
    </div>
  )
}

export default VideoFeed 