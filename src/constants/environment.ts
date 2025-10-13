// Environment constants
export const API_CONFIG = {
  // WebSocket server URL
  WS_BASE_URL: 'ws://localhost:8000',
  // WS_BASE_URL: 'http://0.0.0.0:8000',
  
  // API endpoints
  WS_VIDEO_STREAM_ENDPOINT: '/ws/video_stream'
} as const;

// WebSocket connection settings
export const WEBSOCKET_CONFIG = {
  // How often to send ping messages (in milliseconds)
  PING_INTERVAL: 30000, // 30 seconds
  
  // Maximum number of reconnection attempts before giving up
  RECONNECT_ATTEMPTS: 5,
  
  // Initial delay between reconnection attempts (in milliseconds)
  // Note: This uses exponential backoff, so actual delays will be:
  // 1st attempt: 5s, 2nd: 10s, 3rd: 15s, 4th: 20s, 5th: 25s
  RECONNECT_DELAY: 8000
} as const;

// Type for the API configuration
export type ApiConfig = typeof API_CONFIG;

// Derived constants
export const WS_VIDEO_STREAM_URL = `${API_CONFIG.WS_BASE_URL}${API_CONFIG.WS_VIDEO_STREAM_ENDPOINT}` as const;
