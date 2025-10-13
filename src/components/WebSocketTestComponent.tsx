import { useState, useEffect } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";
import { WebSocketConnectionState } from "../types/websocket";
import type { OpenPoseData } from "../types/pose";
import { loadDemoOpenPoseData } from "../utils/keypointsLoader";
import TranslationCard from "./TranslationCard";
import { WS_VIDEO_STREAM_URL } from "../constants/environment";

interface TestMessage {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  direction: "incoming" | "outgoing";
}

export default function WebSocketTestComponent() {
  const {
    connectionState,
    lastMessage,
    lastKeypointsData,
    lastError,
    sendMessage,
    sendKeypoints,
    connect,
    disconnect,
    isConnected,
  } = useWebSocketContext();

  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [wsUrl, setWsUrl] = useState<string>(WS_VIDEO_STREAM_URL);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamInterval, setStreamInterval] = useState<number | null>(null);

  // Demo data state
  const [demoKeypoints, setDemoKeypoints] = useState<OpenPoseData[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [fps, setFps] = useState(10);
  const [isLoadingDemo, setIsLoadingDemo] = useState(true);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // Translation state
  const [latestTranslation, setLatestTranslation] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [translationConfidence, setTranslationConfidence] = useState<number>(0);

  // Helper function to generate unique message IDs
  const generateMessageId = () => {
    return crypto.randomUUID();
  };

  // Track messages for display
  useEffect(() => {
    if (lastMessage) {
      const newMessage: TestMessage = {
        id: generateMessageId(),
        type: lastMessage.type,
        data: lastMessage,
        timestamp: new Date(),
        direction: "incoming",
      };
      setMessages((prev) => [...prev, newMessage].slice(-10)); // Keep last 10 messages

      // Extract translation from success messages
      // Handle both typed messages and raw success messages
      const messageData = lastMessage as any;
      if (
        messageData.type === "success" &&
        messageData.processed_data?.prediction?.text
      ) {
        setLatestTranslation(messageData.processed_data.prediction.text);
        setTranslationConfidence(
          messageData.processed_data.prediction.confidence || 0
        );
      }
    }
  }, [lastMessage]);

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

  const handleConnect = () => {
    connect(wsUrl);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSendPing = () => {
    const pingMessage = {
      type: "ping" as const,
      timestamp: Date.now() / 1000,
    };
    sendMessage(pingMessage);

    // Add to message display
    const displayMessage: TestMessage = {
      id: generateMessageId(),
      type: "ping",
      data: pingMessage,
      timestamp: new Date(),
      direction: "outgoing",
    };
    setMessages((prev) => [...prev, displayMessage].slice(-10));
  };

  const handleSendTestKeypoints = async () => {
    if (demoLoaded && demoKeypoints.length > 0) {
      // Use pre-loaded OpenPose data
      const openPoseData = demoKeypoints[currentFrameIndex];
      const sequenceId = `demo_${Date.now()}_frame_${currentFrameIndex}`;

      sendKeypoints(openPoseData, sequenceId, "openpose_raw");

      // Add to message display
      const displayMessage: TestMessage = {
        id: generateMessageId(),
        type: "keypoint_sequence",
        data: {
          type: "keypoint_sequence",
          sequence_id: sequenceId,
          keypoints: openPoseData,
          frame_index: currentFrameIndex,
          total_frames: demoKeypoints.length,
          source: "demo_data_preloaded_raw",
          format: "openpose_raw",
        },
        timestamp: new Date(),
        direction: "outgoing",
      };
      setMessages((prev) => [...prev, displayMessage].slice(-10));

      // Move to next frame (loop back to start if at end)
      setCurrentFrameIndex((prev) => (prev + 1) % demoKeypoints.length);
    } else {
      // Demo data not loaded yet
      console.warn("Demo data is still loading. Please wait...");
    }
  };

  const startKeypointStream = () => {
    if (isStreaming) return;

    setIsStreaming(true);
    const intervalMs = 1000 / fps; // Convert FPS to milliseconds
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
    };
  }, [streamInterval]);

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case WebSocketConnectionState.CONNECTED:
        return "bg-green-100 text-green-800 border-green-200";
      case WebSocketConnectionState.CONNECTING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case WebSocketConnectionState.ERROR:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - WebSocket Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            WebSocket Connection Test
          </h2>

          {/* Connection Status */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${getConnectionStatusColor()}`}
            >
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isConnected
                    ? "bg-green-500"
                    : connectionState === WebSocketConnectionState.CONNECTING
                    ? "bg-yellow-500"
                    : connectionState === WebSocketConnectionState.ERROR
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              ></div>
              <span className="font-medium">Status: {connectionState}</span>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WebSocket URL:
              </label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={WS_VIDEO_STREAM_URL}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleConnect}
                disabled={isConnected}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Connect
              </button>
              <button
                onClick={handleDisconnect}
                disabled={!isConnected}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
              <button
                onClick={handleSendPing}
                disabled={!isConnected}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send Ping
              </button>
            </div>
          </div>

          {/* Demo Data Status */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Demo Data Status
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Real keypoint data from sign language video in OpenPose
                    format ({demoKeypoints.length} frames loaded)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status:{" "}
                    {isLoadingDemo
                      ? "Loading demo data..."
                      : demoLoaded
                      ? `Ready - Current frame: ${currentFrameIndex + 1}/${
                          demoKeypoints.length
                        }`
                      : "Failed to load"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="fps-control"
                    className="text-sm font-medium text-gray-700"
                  >
                    FPS:
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
                    <option value={60}>60 FPS</option>
                  </select>
                </div>

                <button
                  onClick={() => setCurrentFrameIndex(0)}
                  disabled={!demoLoaded}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Reset to Frame 1
                </button>
              </div>
            </div>
          </div>

          {/* Keypoint Testing */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Keypoint Testing
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                {demoLoaded
                  ? `Send keypoint data from demo frames. Using real sign language data in OpenPose format (${demoKeypoints.length} frames).`
                  : isLoadingDemo
                  ? "Loading demo data... Please wait."
                  : "Failed to load demo data."}
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={handleSendTestKeypoints}
                  disabled={!isConnected || !demoLoaded}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {demoLoaded ? "Send Next Demo Frame" : "Demo Data Loading..."}
                </button>
                <button
                  onClick={
                    isStreaming ? stopKeypointStream : startKeypointStream
                  }
                  disabled={!isConnected || !demoLoaded}
                  className={`px-6 py-2 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed ${
                    isStreaming
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isStreaming
                    ? `Stop Stream (${fps} FPS)`
                    : `Start Stream (${fps} FPS)`}
                </button>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>
                    {demoLoaded
                      ? `Using demo data: Frame ${currentFrameIndex + 1}/${
                          demoKeypoints.length
                        } (OpenPose format)`
                      : isLoadingDemo
                      ? "Loading demo data..."
                      : "Demo data required for keypoint transmission"}
                  </div>
                  <div className="text-xs">
                    {demoLoaded
                      ? "Real sign language keypoint data: 25 pose + 70 face + 42 hand landmarks (OpenPose 2D format)"
                      : "Load demo data to enable keypoint transmission with real sign language data"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {lastError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Last Error:
              </h4>
              <p className="text-sm text-red-700">{lastError.message}</p>
              {/* <p className="text-xs text-red-600 mt-1">
              Timestamp: {lastError.timestamp ? new Date(lastError.timestamp * 1000).toLocaleString() : 'N/A'}
            </p> */}
            </div>
          )}

          {/* Keypoints Data Display */}
          {lastKeypointsData && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Latest Keypoints Data:
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Success:</strong>{" "}
                  {lastKeypointsData.data.success ? "Yes" : "No"}
                </p>
                {lastKeypointsData.data.frame_info && (
                  <div>
                    <p>
                      <strong>Frame Info:</strong>
                    </p>
                    <ul className="ml-4 space-y-1">
                      <li>
                        Size: {lastKeypointsData.data.frame_info.width}x
                        {lastKeypointsData.data.frame_info.height}
                      </li>
                      <li>
                        Has Pose:{" "}
                        {lastKeypointsData.data.frame_info.has_pose
                          ? "Yes"
                          : "No"}
                      </li>
                      <li>
                        Has Face:{" "}
                        {lastKeypointsData.data.frame_info.has_face
                          ? "Yes"
                          : "No"}
                      </li>
                      <li>
                        Has Left Hand:{" "}
                        {lastKeypointsData.data.frame_info.has_left_hand
                          ? "Yes"
                          : "No"}
                      </li>
                      <li>
                        Has Right Hand:{" "}
                        {lastKeypointsData.data.frame_info.has_right_hand
                          ? "Yes"
                          : "No"}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Message History
              </h3>
              <button
                onClick={clearMessages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No messages yet. Connect and interact to see message history.
                </p>
              ) : (
                messages
                  .slice()
                  .reverse()
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-md text-sm ${
                        message.direction === "incoming"
                          ? "bg-blue-50 border-l-4 border-blue-400"
                          : "bg-green-50 border-l-4 border-green-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`font-medium ${
                            message.direction === "incoming"
                              ? "text-blue-800"
                              : "text-green-800"
                          }`}
                        >
                          {message.direction === "incoming"
                            ? "← Received"
                            : "→ Sent"}
                          : {message.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Translation Display */}
        <div className="space-y-6">
          {/* Language Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Translation Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              {latestTranslation && (
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Confidence:</strong>{" "}
                    {(translationConfidence * 100).toFixed(1)}%
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {translationConfidence > 0.8
                      ? "✅ High confidence"
                      : translationConfidence > 0.5
                      ? "⚠️ Medium confidence"
                      : "❌ Low confidence"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Translation Card */}
          <TranslationCard
            recognizedText={latestTranslation}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
      </div>
    </div>
  );
}
