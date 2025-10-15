import { createContext, useContext, type ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { WebSocketConnectionState } from "../types/websocket";
import type {
  IncomingMessage,
  OutgoingMessage,
  KeypointsMessage,
  ErrorMessage,
  SuccessMessage,
} from "../types/websocket";
import type { OpenPoseKeypoints, OpenPoseData } from "../types/pose";
import {
  WS_VIDEO_STREAM_URL,
  WEBSOCKET_CONFIG,
} from "../constants/environment";

interface WebSocketContextType {
  connectionState: WebSocketConnectionState;
  lastMessage: IncomingMessage | null;
  lastKeypointsData: KeypointsMessage | null;
  lastError: ErrorMessage | null;
  lastPrediction: SuccessMessage | null;
  sendMessage: (message: OutgoingMessage) => void;
  sendKeypoints: (
    keypoints: OpenPoseKeypoints | OpenPoseData,
    sequenceId?: string,
    format?: "openpose" | "openpose_raw"
  ) => void;
  connect: (customUrl?: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  setLastPrediction: React.Dispatch<
    React.SetStateAction<SuccessMessage | null>
  >;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

export function WebSocketProvider({
  children,
  url = WS_VIDEO_STREAM_URL,
  autoConnect = false,
}: WebSocketProviderProps) {
  const webSocketData = useWebSocket({
    url,
    autoConnect,
    pingInterval: WEBSOCKET_CONFIG.PING_INTERVAL,
    reconnectAttempts: WEBSOCKET_CONFIG.RECONNECT_ATTEMPTS,
    reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_DELAY,
  });

  return (
    <WebSocketContext.Provider value={webSocketData}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}
