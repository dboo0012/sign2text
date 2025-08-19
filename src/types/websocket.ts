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
  // 33 pose landmarks: [x, y, z, visibility]
  pose: [number, number, number, number][];

  // 468 face landmarks: [x, y, z]
  face: [number, number, number][];

  // 21 left hand landmarks: [x, y, z]
  left_hand: [number, number, number][];

  // 21 right hand landmarks: [x, y, z]
  right_hand: [number, number, number][];
}

// OpenPose format keypoints (raw format from demo files)
export interface OpenPoseKeypoints {
  // OpenPose pose: 25 landmarks with [x, y, confidence] flattened
  pose_keypoints_2d: number[];
  
  // OpenPose face: 70 landmarks with [x, y, confidence] flattened  
  face_keypoints_2d: number[];
  
  // OpenPose hands: 21 landmarks each with [x, y, confidence] flattened
  hand_left_keypoints_2d: number[];
  hand_right_keypoints_2d: number[];
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

export interface KeypointSequenceMessage extends WebSocketMessage {
  type: "keypoint_sequence";
  keypoints: Keypoints | OpenPoseKeypoints;
  sequence_id: string;
  format?: "mediapipe" | "openpose";
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
export type OutgoingMessage = PingMessage | KeypointSequenceMessage;

export const WebSocketConnectionState = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
} as const;

export type WebSocketConnectionState =
  (typeof WebSocketConnectionState)[keyof typeof WebSocketConnectionState];
