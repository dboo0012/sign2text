import { useState, useRef, useEffect, useCallback } from "react";
import { useMediapipeWebSocket } from "../hooks/useMediapipe";
import { initMediapipe } from "../utils/mediapipe/mediapipe";
import type { MediapipeController } from "../utils/mediapipe/mediapipe";

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
  const [isPoseDetectionOn, setIsPoseDetectionOn] = useState(true);
  const [isMediapipeConnected, setIsMediapipeConnected] = useState(false);
  const [hasDetection, setHasDetection] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediapipeController = useRef<MediapipeController | null>(null);
  const frameInterval = useRef<number | null>(null);

  // Use the WebSocket hook for communication
  const {
    sendKeypoints,
    lastResponse,
    isConnected: isWebSocketConnected,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
  } = useMediapipeWebSocket({
    autoConnect: false,
  });

  // MediaPipe result handler
  const handleMediapipeResults = useCallback((results: any) => {
    try {
      console.log('Client extracted:', {
        landmarks: results.landmarks,
        keypoints: results,
        timestamp: new Date().toISOString(),
      });

      setHasDetection(!!results.landmarks);

      sendKeypoints(results.landmarks);
      // Send keypoints if recording and connected
      // if (results.landmarks && isRecording && isWebSocketConnected) {
      //   console.log('Sending keypoints to backend...');
      //   sendKeypoints(results.landmarks);
      // } else if (results.landmarks && (!isRecording || !isWebSocketConnected)) {
      //   console.log('Keypoints detected but not sent:', {
      //     reason: !isRecording ? 'Not recording' : 'WebSocket not connected',
      //     isRecording,
      //     isWebSocketConnected,
      //   });
      // }
    } catch (error) {
      console.error("Failed to process MediaPipe results:", error);
    }
  }, [isRecording, isWebSocketConnected, sendKeypoints]);

  // Initialize MediaPipe
  const initializeMediapipe = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || mediapipeController.current) {
      return;
    }

    try {
      console.log('Initializing MediaPipe...');
      setIsMediapipeConnected(false);
      
      mediapipeController.current = await initMediapipe(
        videoRef.current,
        canvasRef.current,
        handleMediapipeResults
      );

      console.log('MediaPipe initialized successfully');
      setIsMediapipeConnected(true);

      // Start frame processing
      frameInterval.current = setInterval(() => {
        if (mediapipeController.current) {
          mediapipeController.current.sendFrame();
        }
      }, 1000 / 30); // 30 FPS

    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      setIsMediapipeConnected(false);
    }
  }, [handleMediapipeResults]);

  // Cleanup MediaPipe
  const cleanupMediapipe = useCallback(() => {
    if (frameInterval.current) {
      clearInterval(frameInterval.current);
      frameInterval.current = null;
    }
    if (mediapipeController.current) {
      mediapipeController.current.close();
      mediapipeController.current = null;
    }
    setIsMediapipeConnected(false);
    setHasDetection(false);
  }, []);

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
      connectWebSocket();
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
    disconnectWebSocket();
  };

  const toggleCamera = () => setIsCameraOn((prev) => !prev);
  const togglePoseDetection = () => setIsPoseDetectionOn((prev) => !prev);

  // Handle MediaPipe connection when camera and pose detection state changes
  useEffect(() => {
    if (isCameraOn && isPoseDetectionOn) {
      initializeMediapipe();
    } else {
      cleanupMediapipe();
    }
  }, [isCameraOn, isPoseDetectionOn, initializeMediapipe, cleanupMediapipe]);

  // Handle WebSocket responses
  useEffect(() => {
    if (lastResponse) {
      console.log("video feed", lastResponse)
    }
  }, [lastResponse]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMediapipe();
    };
  }, [cleanupMediapipe]);

  const reconnectWebSocket = () => {
    disconnectWebSocket();
    setTimeout(() => connectWebSocket(), 100);
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
          <div className="absolute top-4 right-4 space-y-2">
            <button
              onClick={togglePoseDetection}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors block ${
                isPoseDetectionOn
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {isPoseDetectionOn ? "Pose ON" : "Pose OFF"}
            </button>
            
            {/* WebSocket Status */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors block ${
                isWebSocketConnected
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              WebSocket: {isWebSocketConnected ? "Connected" : "Disconnected"}
            </div>

            {/* MediaPipe Status */}
            {isPoseDetectionOn && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors block ${
                  isMediapipeConnected
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {isMediapipeConnected ? "MediaPipe ON" : "MediaPipe OFF"}
              </div>
            )}

            {/* Keypoints Detection Indicator */}
            {isPoseDetectionOn && isMediapipeConnected && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors block ${
                  hasDetection ? "bg-yellow-600 text-white animate-pulse" : "bg-gray-600 text-gray-300"
                }`}
              >
                {hasDetection ? "Detecting" : "No Detection"}
              </div>
            )}
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

        {/* Reconnect Button (show if camera is on but WebSocket not connected) */}
        {isCameraOn && !isWebSocketConnected && (
          <button
            onClick={reconnectWebSocket}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            <span className="text-lg">🔄</span>
            <span>Reconnect WebSocket</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;


// import { useState, useRef, useEffect } from 'react'
// import { initMediapipe, MediapipeController } from "../utils/mediapipe";

// interface VideoFeedProps {
//   isRecording: boolean
//   onStartRecording: () => void
//   onStopRecording: () => void
// }

// const VideoFeed = ({
//   isRecording,
//   onStartRecording,
//   onStopRecording
// }: VideoFeedProps) => {
//   const [isCameraOn, setIsCameraOn] = useState(false)
//   const [isPoseDetectionOn, setIsPoseDetectionOn] = useState(true)
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   useEffect(() => {
//     if (isCameraOn) {
//       startCamera()
//     } else {
//       stopCamera()
//     }
//   }, [isCameraOn])

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 }
//       })
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//       }
//     } catch (error) {
//       console.error('Error accessing camera:', error)
//       setIsCameraOn(false)
//       // Show error message to user
//       alert('Camera not found. Please check your camera permissions and try again.')
//     }
//   }

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
//       tracks.forEach(track => track.stop())
//       videoRef.current.srcObject = null
//     }
//   }

//   const toggleCamera = () => {
//     setIsCameraOn(!isCameraOn)
//   }

//   const togglePoseDetection = () => {
//     setIsPoseDetectionOn(!isPoseDetectionOn)
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden">
//         {/* Video Element */}
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover"
//         />
        
//         {/* Pose Detection Overlay Canvas */}
//         {isPoseDetectionOn && (
//           <canvas
//             ref={canvasRef}
//             className="absolute top-0 left-0 w-full h-full pointer-events-none"
//           />
//         )}
        
//         {/* Camera Off Placeholder */}
//         {!isCameraOn && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
//             <div className="text-center text-gray-400">
//               <div className="text-6xl mb-4">📹</div>
//               <p className="text-lg">Camera is off</p>
//               <p className="text-sm">Click the camera button to start</p>
//             </div>
//           </div>
//         )}

//         {/* Recording Indicator */}
//         {isRecording && (
//           <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
//             <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//             <span className="text-sm font-medium">Recording</span>
//           </div>
//         )}

//         {/* Pose Detection Toggle */}
//         {isCameraOn && (
//           <div className="absolute top-4 right-4">
//             <button
//               onClick={togglePoseDetection}
//               className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
//                 isPoseDetectionOn
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-600 text-gray-300'
//               }`}
//             >
//               {isPoseDetectionOn ? 'Pose ON' : 'Pose OFF'}
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Controls */}
//       <div className="flex items-center justify-center space-x-4 mt-6">
//         {/* Camera Toggle */}
//         <button
//           onClick={toggleCamera}
//           className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//             isCameraOn
//               ? 'bg-gray-600 text-white hover:bg-gray-700'
//               : 'bg-blue-600 text-white hover:bg-blue-700'
//           }`}
//         >
//           <span className="text-lg">{isCameraOn ? '📹' : '📷'}</span>
//           <span>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
//         </button>

//         {/* Recording Controls */}
//         {isCameraOn && (
//           <button
//             onClick={isRecording ? onStopRecording : onStartRecording}
//             className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//               isRecording
//                 ? 'bg-red-600 text-white hover:bg-red-700'
//                 : 'bg-green-600 text-white hover:bg-green-700'
//             }`}
//           >
//             <span className="text-lg">{isRecording ? '⏹️' : '▶️'}</span>
//             <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
//           </button>
//         )}

//       </div>
//     </div>
//   )
// }

// export default VideoFeed 