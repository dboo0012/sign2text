```
Browser Camera (30fps)
    ↓ (video frames)
MediaPipe (15fps processing)
    ↓ (keypoint coordinates)
React State Management
    ↓ (sequence buffering)
Socket.IO Client
    ↓ (compressed JSON, ~2KB)
WebSocket Connection
    ↓ (network transmission)
FastAPI WebSocket Handler
    ↓ (async processing)
UniSign Model Inference
    ↓ (prediction + confidence)
Translation Service (cached)
    ↓ (multi-language output)
WebSocket Response
    ↓ (JSON response)
React UI Updates
    ↓ (real-time display)
User Interface (< 200ms latency)
```
