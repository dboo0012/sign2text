import type { OpenPoseData } from "../types/pose";

/**
 * Load raw OpenPose data from demo folder dynamically
 * The files are served statically by Vite from the demo folder
 */
export async function loadDemoOpenPoseData(): Promise<OpenPoseData[]> {
  const openPoseDataArray: OpenPoseData[] = [];
  const basePath = "/_2FBDaOPYig_1-3-rgb_front-20250822T065857Z-1-001/_2FBDaOPYig_1-3-rgb_front";
  
  // Load all keypoint files sequentially (000000000000 to 000000000125)
  for (let i = 0; i <= 125; i++) {
    const frameNumber = i.toString().padStart(12, "0");
    const filename = `_2FBDaOPYig_1-3-rgb_front_${frameNumber}_keypoints.json`;
    const url = `${basePath}/${filename}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const openPoseData: OpenPoseData = await response.json();
        openPoseDataArray.push(openPoseData);
      } else {
        console.warn(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`Failed to load ${filename}:`, error);
    }
  }

  return openPoseDataArray;
}

/**
 * Load a specific frame's raw OpenPose data
 */
export async function loadOpenPoseDataFrame(frameIndex: number): Promise<OpenPoseData | null> {
  if (frameIndex < 0 || frameIndex > 125) {
    throw new Error(`Frame index ${frameIndex} out of range (0-125)`);
  }

  const basePath = "/_2FBDaOPYig_1-3-rgb_front-20250822T065857Z-1-001/_2FBDaOPYig_1-3-rgb_front";
  const frameNumber = frameIndex.toString().padStart(12, "0");
  const filename = `_2FBDaOPYig_1-3-rgb_front_${frameNumber}_keypoints.json`;
  const url = `${basePath}/${filename}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const openPoseData: OpenPoseData = await response.json();
      return openPoseData;
    }
    return null;
  } catch (error) {
    console.error(`Failed to load frame ${frameIndex}:`, error);
    return null;
  }
}

/**
 * Get the total number of available frames
 */
export const TOTAL_DEMO_FRAMES = 126;
