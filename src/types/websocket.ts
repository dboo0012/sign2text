import type { OpenPoseKeypoints, OpenPoseData } from "./pose";

export interface FrameInfo {
  width: number;
  height: number;
  has_pose: boolean;
  has_face: boolean;
  has_left_hand: boolean;
  has_right_hand: boolean;
}

export interface ProcessingResult {
  success: boolean;
  keypoints: OpenPoseKeypoints;
  frame_info: FrameInfo;
  error?: string;
}

export interface WebSocketMessage {
  type: string;
  timestamp?: number;
}

export interface KeypointSequenceMessage extends WebSocketMessage {
  type: "keypoint_sequence";
  keypoints: OpenPoseKeypoints | OpenPoseData;
  sequence_id: string;
  format?: "openpose" | "openpose_raw";
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

/**
 * 🔹 New: Frame message for sending video frames
 */
export interface FrameMessage extends WebSocketMessage {
  type: "frame";
  data: number[]; // serialized image bytes (Uint8Array → number[])
  width?: number; // optional metadata
  height?: number;
  format?: "jpeg" | "webp" | "png";
}

export type IncomingMessage =
  | KeypointsMessage
  | PongMessage
  | ErrorMessage;

export type OutgoingMessage =
  | PingMessage
  | KeypointSequenceMessage
  | FrameMessage;

export const WebSocketConnectionState = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
} as const;

export type WebSocketConnectionState =
  (typeof WebSocketConnectionState)[keyof typeof WebSocketConnectionState];
