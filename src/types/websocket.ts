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
 * 🔹 Prediction result from the backend model
 */
export interface PredictionResult {
  success: boolean;
  text: string;
  confidence: number;
  frames_processed: number;
}

/**
 * 🔹 Detection summary for processed frames
 */
export interface DetectionSummary {
  pose_points: number;
  face_points: number;
  left_hand_points: number;
  right_hand_points: number;
  total_points: number;
  has_pose: boolean;
  has_face: boolean;
  has_hands: boolean;
}

/**
 * 🔹 Processing information from backend
 */
export interface ProcessingInfo {
  sequence_id: number;
  timestamp: number;
  detection_summary: DetectionSummary;
}

/**
 * 🔹 Processed data from backend prediction
 */
export interface ProcessedData {
  processing_info: ProcessingInfo;
  feature_vector_size: number;
  model_ready: boolean;
  buffer_size: number;
  prediction: PredictionResult;
  sequence_id: number;
  format: string;
}

/**
 * 🔹 Success message with prediction from backend
 */
export interface SuccessMessage extends WebSocketMessage {
  type: "success";
  success: boolean;
  message: string;
  prediction: PredictionResult;
  processed_data: ProcessedData;
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
  | ErrorMessage
  | SuccessMessage;

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
