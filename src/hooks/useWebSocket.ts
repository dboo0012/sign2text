// hooks/useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketConnectionState } from "../types/websocket";
import type {
  IncomingMessage,
  OutgoingMessage,
  KeypointsMessage,
  ErrorMessage,
  PongMessage,
} from "../types/websocket";

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
  sendMessage: (message: OutgoingMessage) => void;
  sendFrame: (frameData: string) => void;
  connect: () => void;
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

  const wsRef = useRef<WebSocket | null>(null);
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
      setLastMessage(message);

      switch (message.type) {
        case "keypoints":
          setLastKeypointsData(message as KeypointsMessage);
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

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    cleanup();
    setConnectionState(WebSocketConnectionState.CONNECTING);

    try {
      wsRef.current = new WebSocket(url);

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
              connect();
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
        wsRef.current.send(JSON.stringify(messageWithTimestamp));
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
      }
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  const sendFrame = useCallback(
    (frameData: string) => {
      sendMessage({
        type: "frame",
        frame: frameData,
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
  }, [autoConnect, connect, cleanup]);

  return {
    connectionState,
    lastMessage,
    lastKeypointsData,
    lastError,
    sendMessage,
    sendFrame,
    connect,
    disconnect,
    isConnected: connectionState === WebSocketConnectionState.CONNECTED,
  };
}
