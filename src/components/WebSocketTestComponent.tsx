import { useEffect, useState } from 'react';
import { useWebSocketContext } from '../contexts/websocketContext';
import { WebSocketConnectionState } from '../types/websocket';
import type { Keypoints } from '../types/websocket';

interface TestMessage {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
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
    isConnected
  } = useWebSocketContext();

  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws/video_stream');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamInterval, setStreamInterval] = useState<number | null>(null);

  // Track messages for display
  useEffect(() => {
    if (lastMessage) {
      const newMessage: TestMessage = {
        id: Date.now().toString(),
        type: lastMessage.type,
        data: lastMessage,
        timestamp: new Date(),
        direction: 'incoming'
      };
      setMessages(prev => [...prev, newMessage].slice(-10)); // Keep last 10 messages
    }
  }, [lastMessage]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSendPing = () => {
    const pingMessage = {
      type: 'ping' as const,
      timestamp: Date.now() / 1000,
    };
    sendMessage(pingMessage);
    
    // Add to message display
    const displayMessage: TestMessage = {
      id: Date.now().toString(),
      type: 'ping',
      data: pingMessage,
      timestamp: new Date(),
      direction: 'outgoing'
    };
    setMessages(prev => [...prev, displayMessage].slice(-10));
  };

  const handleSendTestKeypoints = () => {
    const keypoints = generateRandomKeypoints();
    const sequenceId = `test_${Date.now()}`;
    
    sendKeypoints(keypoints, sequenceId);
    
    // Calculate approximate data size for display
    // Pose: 33 * 4 values, Face: 468 * 3 values, Hands: 21 * 3 * 2 values
    const totalValues = (33 * 4) + (468 * 3) + (21 * 3 * 2); // 1662 total float values
    const approximateSize = Math.round((totalValues * 8 + 200) / 1024 * 100) / 100; // KB (8 bytes per float + overhead)
    
    // Add to message display
    const displayMessage: TestMessage = {
      id: Date.now().toString(),
      type: 'keypoint_sequence',
      data: { 
        type: 'keypoint_sequence', 
        sequence_id: sequenceId,
        keypoints,
        packet_size_kb: approximateSize
      },
      timestamp: new Date(),
      direction: 'outgoing'
    };
    setMessages(prev => [...prev, displayMessage].slice(-10));
  };

  const startKeypointStream = () => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    const interval = setInterval(() => {
      if (isConnected) {
        handleSendTestKeypoints();
      }
    }, 100); // Send every 100ms (10 FPS)
    
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
        return 'bg-green-100 text-green-800 border-green-200';
      case WebSocketConnectionState.CONNECTING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case WebSocketConnectionState.ERROR:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const generateRandomKeypoints = (): Keypoints => {
    // Generate random keypoints matching strict MediaPipe format
    
    // Pose: 33 landmarks with [x, y, z, visibility]
    const pose: [number, number, number, number][] = Array.from({ length: 33 }, () => [
      Math.random(), // x (0-1 normalized)
      Math.random(), // y (0-1 normalized)
      Math.random() * 0.1 - 0.05, // z (small depth values around 0)
      Math.random() * 0.5 + 0.5 // visibility/confidence (0.5-1.0)
    ]);

    // Face: 468 landmarks with [x, y, z]
    const face: [number, number, number][] = Array.from({ length: 468 }, () => [
      Math.random() * 0.3 + 0.35, // x (face region: 0.35-0.65)
      Math.random() * 0.4 + 0.2,  // y (face region: 0.2-0.6)
      Math.random() * 0.01 - 0.005 // z (small depth values)
    ]);

    // Left hand: 21 landmarks with [x, y, z]
    const left_hand: [number, number, number][] = Array.from({ length: 21 }, () => [
      Math.random() * 0.2 + 0.2, // x (left hand region: 0.2-0.4)
      Math.random() * 0.3 + 0.4, // y (hand region: 0.4-0.7)
      Math.random() * 0.02 - 0.01 // z (small depth values)
    ]);

    // Right hand: 21 landmarks with [x, y, z]
    const right_hand: [number, number, number][] = Array.from({ length: 21 }, () => [
      Math.random() * 0.2 + 0.6, // x (right hand region: 0.6-0.8)
      Math.random() * 0.3 + 0.4, // y (hand region: 0.4-0.7)
      Math.random() * 0.02 - 0.01 // z (small depth values)
    ]);

    return {
      pose,
      face,
      left_hand,
      right_hand
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">WebSocket Connection Test</h2>
        
        {/* Connection Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getConnectionStatusColor()}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 
              connectionState === WebSocketConnectionState.CONNECTING ? 'bg-yellow-500' :
              connectionState === WebSocketConnectionState.ERROR ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
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
              placeholder="ws://localhost:8000/ws/video_stream"
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

        {/* Keypoint Testing */}
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Keypoint Testing</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Test keypoint data transmission by sending randomly generated pose, face, and hand keypoints similar to MediaPipe format.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={handleSendTestKeypoints}
                disabled={!isConnected}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send Single Keypoint Set
              </button>
              <button
                onClick={isStreaming ? stopKeypointStream : startKeypointStream}
                disabled={!isConnected}
                className={`px-6 py-2 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed ${
                  isStreaming 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isStreaming ? 'Stop Stream (10 FPS)' : 'Start Stream (10 FPS)'}
              </button>
              <div className="text-sm text-gray-500 space-y-1">
                <div>Generates: 33 pose (x,y,z,v) + 468 face (x,y,z) + 42 hand (x,y,z) landmarks</div>
                <div className="text-xs">~13.2KB per keypoint set vs ~50-100KB for video frame</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {lastError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-1">Last Error:</h4>
            <p className="text-sm text-red-700">{lastError.message}</p>
            {/* <p className="text-xs text-red-600 mt-1">
              Timestamp: {lastError.timestamp ? new Date(lastError.timestamp * 1000).toLocaleString() : 'N/A'}
            </p> */}
          </div>
        )}

        {/* Keypoints Data Display */}
        {lastKeypointsData && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Latest Keypoints Data:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Success:</strong> {lastKeypointsData.data.success ? 'Yes' : 'No'}</p>
              {lastKeypointsData.data.frame_info && (
                <div>
                  <p><strong>Frame Info:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>Size: {lastKeypointsData.data.frame_info.width}x{lastKeypointsData.data.frame_info.height}</li>
                    <li>Has Pose: {lastKeypointsData.data.frame_info.has_pose ? 'Yes' : 'No'}</li>
                    <li>Has Face: {lastKeypointsData.data.frame_info.has_face ? 'Yes' : 'No'}</li>
                    <li>Has Left Hand: {lastKeypointsData.data.frame_info.has_left_hand ? 'Yes' : 'No'}</li>
                    <li>Has Right Hand: {lastKeypointsData.data.frame_info.has_right_hand ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              )}
              {lastKeypointsData.data.keypoints && (
                <div>
                  <p><strong>Keypoints:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>Pose points: {lastKeypointsData.data.keypoints.pose?.length || 0}</li>
                    <li>Face points: {lastKeypointsData.data.keypoints.face?.length || 0}</li>
                    <li>Left hand points: {lastKeypointsData.data.keypoints.left_hand?.length || 0}</li>
                    <li>Right hand points: {lastKeypointsData.data.keypoints.right_hand?.length || 0}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message History */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
            <button
              onClick={clearMessages}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet. Connect and interact to see message history.</p>
            ) : (
              messages.slice().reverse().map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-md text-sm ${
                    message.direction === 'incoming' 
                      ? 'bg-blue-50 border-l-4 border-blue-400' 
                      : 'bg-green-50 border-l-4 border-green-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium ${
                      message.direction === 'incoming' ? 'text-blue-800' : 'text-green-800'
                    }`}>
                      {message.direction === 'incoming' ? '← Received' : '→ Sent'}: {message.type}
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
    </div>
  );
}
