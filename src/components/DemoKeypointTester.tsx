import { useState, useEffect } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";
import type { OpenPoseData } from "../types/pose";
import { loadDemoOpenPoseData } from "../utils/keypointsLoader";

/**
 * DemoKeypointTester component sends real sign language keypoint data to the translation server.
 * WebSocket responses are now handled directly by RecognitionCard.
 *
 * Integration flow:
 * 1. Loads demo keypoint data from OpenPose format files
 * 2. Sends keypoints to WebSocket server at configured FPS
 * 3. RecognitionCard receives and processes translation results
 */
export default function DemoKeypointTester() {
  const { isConnected, sendKeypoints } = useWebSocketContext();

  // Demo data state
  const [demoKeypoints, setDemoKeypoints] = useState<OpenPoseData[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [fps, setFps] = useState(10);
  const [isLoadingDemo, setIsLoadingDemo] = useState(true);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamInterval, setStreamInterval] = useState<number | null>(null);

  // Load demo data on mount
  useEffect(() => {
    const loadDemoData = async () => {
      setIsLoadingDemo(true);
      try {
        const openPoseDataArray = await loadDemoOpenPoseData();
        setDemoKeypoints(openPoseDataArray);
        setDemoLoaded(true);
        console.log(
          `Loaded ${openPoseDataArray.length} OpenPose data frames from demo data`
        );
      } catch (error) {
        console.error("Failed to load demo OpenPose data:", error);
      } finally {
        setIsLoadingDemo(false);
      }
    };

    loadDemoData();
  }, []);

  const handleSendTestKeypoints = async () => {
    if (demoLoaded && demoKeypoints.length > 0) {
      const openPoseData = demoKeypoints[currentFrameIndex];
      const sequenceId = `demo_${Date.now()}_frame_${currentFrameIndex}`;

      sendKeypoints(openPoseData, sequenceId, "openpose_raw");

      // Move to next frame (loop back to start if at end)
      setCurrentFrameIndex((prev) => (prev + 1) % demoKeypoints.length);
    }
  };

  const startKeypointStream = () => {
    if (isStreaming || !isConnected) return;

    setIsStreaming(true);
    const intervalMs = 1000 / fps;
    const interval = setInterval(() => {
      if (isConnected) {
        handleSendTestKeypoints();
      }
    }, intervalMs);

    setStreamInterval(interval);
  };

  const stopKeypointStream = () => {
    setIsStreaming(false);
    if (streamInterval) {
      clearInterval(streamInterval);
      setStreamInterval(null);
    }
  };

  const resetToFirstFrame = () => {
    setCurrentFrameIndex(0);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
    };
  }, [streamInterval]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Demo Keypoint Tester
      </h3>

      {/* Demo Data Status */}
      <div className="mb-6">
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">
                Real Sign Language Data
              </p>
              <p className="text-xs text-gray-500">
                {isLoadingDemo
                  ? "Loading demo data..."
                  : demoLoaded
                  ? `${demoKeypoints.length} frames loaded • Current: ${
                      currentFrameIndex + 1
                    }/${demoKeypoints.length}`
                  : "Failed to load demo data"}
              </p>
            </div>
            {demoLoaded && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-green-600 font-medium">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* FPS Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="fps-control"
                className="text-sm font-medium text-gray-700"
              >
                Playback Speed:
              </label>
              <select
                id="fps-control"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 FPS</option>
                <option value={5}>5 FPS</option>
                <option value={10}>10 FPS</option>
                <option value={15}>15 FPS</option>
                <option value={24}>24 FPS</option>
                <option value={30}>30 FPS</option>
              </select>
            </div>

            <button
              onClick={resetToFirstFrame}
              disabled={!demoLoaded}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
          <span className="text-sm text-gray-700">
            {isConnected ? "Connected to server" : "Not connected"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSendTestKeypoints}
            disabled={!isConnected || !demoLoaded}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            {demoLoaded ? "Send Next Frame" : "Loading..."}
          </button>

          <button
            onClick={isStreaming ? stopKeypointStream : startKeypointStream}
            disabled={!isConnected || !demoLoaded}
            className={`px-4 py-2 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium ${
              isStreaming
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isStreaming ? `Stop Stream` : `Start Stream (${fps} FPS)`}
          </button>
        </div>

        {/* Stream Status */}
        {isStreaming && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-800 font-medium">
                Streaming at {fps} FPS • Frame {currentFrameIndex + 1}/
                {demoKeypoints.length}
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Uses real sign language keypoint data in OpenPose format</p>
          <p>• Each frame contains 25 pose + 70 face + 42 hand landmarks</p>
          <p>• Requires WebSocket connection to translation server</p>
        </div>
      </div>
    </div>
  );
}
