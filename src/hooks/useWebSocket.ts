// hooks/useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketConnectionState } from "../types/websocket";
import type {
  IncomingMessage,
  OutgoingMessage,
  KeypointsMessage,
  ErrorMessage,
  SuccessMessage,
} from "../types/websocket";
import type { OpenPoseKeypoints, OpenPoseData } from "../types/pose";

interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  pingInterval?: number;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseWebSocketReturn {
  connectionState: WebSocketConnectionState;
  lastMessage: IncomingMessage | null;
  lastKeypointsData: KeypointsMessage | null;
  lastError: ErrorMessage | null;
  lastPrediction: SuccessMessage | null;
  sendMessage: (message: OutgoingMessage) => void;
  sendKeypoints: (keypoints: OpenPoseKeypoints | OpenPoseData, sequenceId?: string, format?: "openpose" | "openpose_raw") => void;
  connect: (customUrl?: string) => void;
  disconnect: () => void;
  isConnected: boolean;
}

export function useWebSocket({
  url,
  autoConnect = false,
  pingInterval = 30000,
  reconnectAttempts = 3,
  reconnectDelay = 1000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState<IncomingMessage | null>(null);
  const [lastKeypointsData, setLastKeypointsData] =
    useState<KeypointsMessage | null>(null);
  const [lastError, setLastError] = useState<ErrorMessage | null>(null);
  const [lastPrediction, setLastPrediction] = useState<SuccessMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const currentUrlRef = useRef<string>(url);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectControllerRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectControllerRef.current) {
      reconnectControllerRef.current.abort();
      reconnectControllerRef.current = null;
    }
  }, []);

  const startPingInterval = useCallback(() => {
    cleanup();
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingMessage: OutgoingMessage = {
          type: "ping",
          timestamp: Date.now() / 1000,
        };
        wsRef.current.send(JSON.stringify(pingMessage));
      }
    }, pingInterval);
  }, [pingInterval, cleanup]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: IncomingMessage = JSON.parse(event.data);
      // console.log('WebSocket message received:', {
      //   type: message.type,
      //   timestamp: new Date().toISOString(),
      //   messageSize: event.data.length,
      //   data: message
      // });
      setLastMessage(message);

      switch (message.type) {
        case "keypoints":
          setLastKeypointsData(message as KeypointsMessage);
          console.log('Keypoints response processed');
          break;
        case "success":
          setLastPrediction(message as SuccessMessage);
          console.log('Prediction received:', {
            text: (message as SuccessMessage).prediction.text,
            confidence: (message as SuccessMessage).prediction.confidence,
            frames_processed: (message as SuccessMessage).prediction.frames_processed,
            sequence_id: (message as SuccessMessage).processed_data.sequence_id
          });
          break;
        case "error":
          setLastError(message as ErrorMessage);
          console.error("WebSocket error:", message.message);
          break;
        case "pong":
          // Handle pong response - connection is healthy
          break;
        default:
          console.warn("Unknown message type:", (message as any).type);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }, []);

  const connect = useCallback((customUrl?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return; // Already connected or connecting
    }

    cleanup();
    setConnectionState(WebSocketConnectionState.CONNECTING);
    
    const connectUrl = customUrl || url;
    currentUrlRef.current = connectUrl;

    try {
      wsRef.current = new WebSocket(connectUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setConnectionState(WebSocketConnectionState.CONNECTED);
        reconnectAttemptsRef.current = 0;
        startPingInterval();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        cleanup();
        setConnectionState(WebSocketConnectionState.DISCONNECTED);

        // Only attempt reconnect if it wasn't a manual disconnect
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < reconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `Attempting to reconnect... (${reconnectAttemptsRef.current}/${reconnectAttempts})`
          );

          reconnectControllerRef.current = new AbortController();
          const delay = reconnectDelay * reconnectAttemptsRef.current;

          setTimeout(() => {
            if (!reconnectControllerRef.current?.signal.aborted) {
              connect(currentUrlRef.current);
            }
          }, delay);
        } else if (event.code !== 1000) {
          console.error("Max reconnection attempts reached");
          setConnectionState(WebSocketConnectionState.ERROR);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState(WebSocketConnectionState.ERROR);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionState(WebSocketConnectionState.ERROR);
    }
  }, [
    url,
    handleMessage,
    startPingInterval,
    cleanup,
    reconnectAttempts,
    reconnectDelay,
  ]);

  const disconnect = useCallback(() => {
    cleanup();
    reconnectAttemptsRef.current = reconnectAttempts; // Prevent auto-reconnect

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    setConnectionState(WebSocketConnectionState.DISCONNECTED);
  }, [cleanup, reconnectAttempts]);

  const sendMessage = useCallback((message: OutgoingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: message.timestamp || Date.now() / 1000,
        };
        
        if (message instanceof ArrayBuffer || message instanceof Blob || message instanceof Uint8Array) {
          wsRef.current.send(message);
        } else {
          wsRef.current.send(JSON.stringify(messageWithTimestamp));
        }
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
      }
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  const sendKeypoints = useCallback(
    (keypoints: OpenPoseKeypoints | OpenPoseData, sequenceId?: string, format?: "openpose" | "openpose_raw") => {
      const seqId = sequenceId || `seq_${Date.now()}`;
      console.log('Sending keypoints via WebSocket:', {
        sequenceId: seqId,
        format: format || "openpose",
        timestamp: new Date().toISOString(),
        keypointsSize: JSON.stringify(keypoints).length
      });
      
      sendMessage({
        type: "keypoint_sequence",
        keypoints,
        sequence_id: seqId,
        format: format || "openpose",
      });
    },
    [sendMessage]
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, cleanup]);

  return {
    connectionState,
    lastMessage,
    lastKeypointsData,
    lastError,
    lastPrediction,
    sendMessage,
    sendKeypoints,
    connect,
    disconnect,
    isConnected: connectionState === WebSocketConnectionState.CONNECTED,
  };
}
