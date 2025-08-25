import { useCallback, useEffect, useState, useRef } from 'react';

interface UseMediapipeWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface UseMediapipeWebSocketReturn {
  sendKeypoints: (keypoints: any, sequenceId?: string) => void;
  lastResponse: any | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  connectionState: string;
}

export function useMediapipeWebSocket({
  url = 'ws://localhost:8000/ws/mediapipe_stream',
  autoConnect = false,
}: UseMediapipeWebSocketOptions = {}): UseMediapipeWebSocketReturn {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [lastResponse, setLastResponse] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    console.log('Connecting to WebSocket:', url);
    setConnectionState('connecting');

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setConnectionState('connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("useMediapipe hook: ", message)
          setLastResponse(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionState('disconnected');
        setIsConnected(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
      setIsConnected(false);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setConnectionState('disconnected');
    setIsConnected(false);
    console.log('WebSocket disconnected manually');
  }, []);

  const sendKeypoints = useCallback((keypoints: any, sequenceId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const seqId = sequenceId || `seq_${Date.now()}`;
      const message = {
        type: 'keypoint_sequence',
        keypoints,
        sequence_id: seqId,
        format: 'mediapipe',
        timestamp: Date.now() / 1000,
      };
      
      console.log('Sending keypoints via WebSocket:', {
        sequenceId: seqId,
        timestamp: new Date().toISOString(),
        keypointsCount: keypoints?.length || 0
      });
      
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send keypoints: WebSocket not connected');
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, connect]);

  return {
    sendKeypoints,
    lastResponse,
    isConnected,
    connect,
    disconnect,
    connectionState,
  };
}
