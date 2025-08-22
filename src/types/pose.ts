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

// OpenPose data structure from JSON files
export interface OpenPoseData {
  version: number;
  people: Array<{
    person_id: number[];
    pose_keypoints_2d: number[];
    face_keypoints_2d: number[];
    hand_left_keypoints_2d: number[];
    hand_right_keypoints_2d: number[];
    pose_keypoints_3d: number[];
    face_keypoints_3d: number[];
    hand_left_keypoints_3d: number[];
    hand_right_keypoints_3d: number[];
  }>;
}