// import { useEffect, useRef, useState } from "react"
// import { useWebSocketContext } from "../contexts/websocketContext"

// interface VideoFeedProps {
//   isRecording: boolean
//   onStartRecording: () => void
//   onStopRecording: () => void
// }

// const VideoFeed = ()=> {
//   const [isCameraOn, setIsCameraOn] = useState(false)
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   // 🔹 Use your context instead of hook directly
//   const { isConnected, sendMessage } = useWebSocketContext()

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
//     } catch (err) {
//       console.error("Error accessing camera:", err)
//       alert("Camera not found. Please check permissions.")
//     }
//   }

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
//       tracks.forEach(track => track.stop())
//       videoRef.current.srcObject = null
//     }
//   }

//   // 🔹 Capture & send frames over WebSocket
//   useEffect(() => {
//     if (!isCameraOn || !isConnected) return

//     const interval = setInterval(() => {
//       if (!videoRef.current || !canvasRef.current) return

//       const ctx = canvasRef.current.getContext("2d")
//       if (!ctx) return

//       ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

//       canvasRef.current.toBlob(
//         (blob) => {
//           if (blob) {
//             blob.arrayBuffer().then((buffer) => {
//               // Send as binary frame message
//               sendMessage({
//                 type: "frame",
//                 data: Array.from(new Uint8Array(buffer)), // serialize
//               })
//             })
//           }
//         },
//         "image/jpeg",
//         0.6 // compression quality
//       )
//     }, 150) // ~10 FPS

//     return () => clearInterval(interval)
//   }, [isCameraOn, isConnected, sendMessage])

//   return (
//     <div className="flex flex-col h-full">
//       {/* Video Preview */}
//       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

//       {/* Hidden canvas for extracting frames */}
//       <canvas ref={canvasRef} width={640} height={480} className="hidden" />

//       <div className="flex mt-4 space-x-4">
//         <button
//           onClick={() => setIsCameraOn(!isCameraOn)}
//           className="px-4 py-2 bg-blue-600 text-white rounded"
//         >
//           {isCameraOn ? "Stop Camera" : "Start Camera"}
//         </button>
//       </div>
//     </div>
//   )
// }

// export default VideoFeed


// import { useState, useRef, useEffect } from "react";
// import { useWebSocketContext } from "../contexts/websocketContext"

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

//   // ✅ Pull values from WebSocket context
//   const { isConnected, sendMessage } = useWebSocketContext()

//   useEffect(() => {
//     if (isCameraOn) {
//       startCamera()
//     } else {
//       stopCamera()
//     }
//   }, [isCameraOn])
// // 🔹 Capture & send frames over WebSocket only while recording
// useEffect(() => {
//   if (!isRecording || !isConnected) return

//   const interval = setInterval(() => {
//     if (!videoRef.current || !canvasRef.current) return

//     const ctx = canvasRef.current.getContext("2d")
//     if (!ctx) return

//     ctx.drawImage(
//       videoRef.current,
//       0,
//       0,
//       canvasRef.current.width,
//       canvasRef.current.height
//     )

//     canvasRef.current.toBlob(
//       (blob) => {
//         if (blob) {
//           blob.arrayBuffer().then((buffer) => {
//             // Send as binary frame message
//             sendMessage({
//               type: "frame",
//               data: Array.from(new Uint8Array(buffer)), // serialize
//             })
//           })
//         }
//       },
//       "image/jpeg",
//       0.6 // compression quality
//     )
//   }, 150) // ~10 FPS

//   console.log("📡 Started sending frames...")

//   return () => {
//     clearInterval(interval)
//     console.log("🛑 Stopped sending frames")
//   }
// }, [isRecording, isConnected, sendMessage])

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


// /////////////
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




import { useState, useRef, useEffect } from "react"
import { useWebSocketContext } from "../contexts/websocketContext"

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

  // ✅ Pull values from WebSocket context
  const { isConnected, sendMessage } = useWebSocketContext()

  // 🎥 Handle camera toggle
  useEffect(() => {
    if (isCameraOn) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [isCameraOn])

  // 📡 Send frames while recording
  useEffect(() => {
    if (!isRecording || !isConnected) return

    console.log("📡 Started sending frames...")

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return
      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      ctx.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )

      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            blob.arrayBuffer().then((buffer) => {
              sendMessage(
                {
                type: "frame",
                data: Array.from(new Uint8Array(buffer)) // serialize binary → array
              }
              )
            })
          }
        },
        "image/jpeg",
        0.6
      )
    }, 150) // ~10 FPS

    return () => {
      clearInterval(interval)
      console.log("🛑 Stopped sending frames")
    }
  }, [isRecording, isConnected, sendMessage])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCameraOn(false)
      alert("Camera not found. Please check your camera permissions and try again.")
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
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {isPoseDetectionOn ? "Pose ON" : "Pose OFF"}
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
  )
}

export default VideoFeed
