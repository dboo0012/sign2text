// Environment constants
export const API_CONFIG = {
  // WebSocket server URL
  WS_BASE_URL: 'ws://localhost:8000',
  // WS_BASE_URL: 'http://0.0.0.0:8000',
  
  // API endpoints
  WS_VIDEO_STREAM_ENDPOINT: '/ws/video_stream'
} as const;

// Type for the API configuration
export type ApiConfig = typeof API_CONFIG;

// Derived constants
export const WS_VIDEO_STREAM_URL = `${API_CONFIG.WS_BASE_URL}${API_CONFIG.WS_VIDEO_STREAM_ENDPOINT}` as const;
