// types/websocket.ts
export interface FrameInfo {
  width: number;
  height: number;
  has_pose: boolean;
  has_face: boolean;
  has_left_hand: boolean;
  has_right_hand: boolean;
}

export interface Keypoints {
  pose: number[][];
  face: number[][];
  left_hand: number[][];
  right_hand: number[][];
}

export interface ProcessingResult {
  success: boolean;
  keypoints: Keypoints;
  frame_info: FrameInfo;
  error?: string;
}

export interface WebSocketMessage {
  type: string;
  timestamp?: number;
}

export interface FrameMessage extends WebSocketMessage {
  type: "frame";
  frame: string; // Base64 encoded image
}

export interface PingMessage extends WebSocketMessage {
  type: "ping";
}

export interface KeypointsMessage extends WebSocketMessage {
  type: "keypoints";
  data: ProcessingResult;
}

export interface PongMessage extends WebSocketMessage {
  type: "pong";
}

export interface ErrorMessage extends WebSocketMessage {
  type: "error";
  message: string;
}

export type IncomingMessage = KeypointsMessage | PongMessage | ErrorMessage;
export type OutgoingMessage = FrameMessage | PingMessage;

export const WebSocketConnectionState = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
} as const;

export type WebSocketConnectionState =
  (typeof WebSocketConnectionState)[keyof typeof WebSocketConnectionState];
