import { createContext, useContext, type ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { WebSocketConnectionState } from "../types/websocket";
import type {
  IncomingMessage,
  OutgoingMessage,
  KeypointsMessage,
  ErrorMessage,
} from "../types/websocket";
import type { OpenPoseKeypoints, OpenPoseData } from "../types/pose";

interface WebSocketContextType {
  connectionState: WebSocketConnectionState;
  lastMessage: IncomingMessage | null;
  lastKeypointsData: KeypointsMessage | null;
  lastError: ErrorMessage | null;
  sendMessage: (message: OutgoingMessage) => void;
  sendKeypoints: (
    keypoints: OpenPoseKeypoints | OpenPoseData,
    sequenceId?: string,
    format?: "openpose" | "openpose_raw"
  ) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

export function WebSocketProvider({
  children,
  url = "ws://localhost:8000/ws/video_stream",
  autoConnect = false,
}: WebSocketProviderProps) {
  const webSocketData = useWebSocket({
    url,
    autoConnect,
    pingInterval: 30000,
    reconnectAttempts: 3,
    reconnectDelay: 1000,
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
