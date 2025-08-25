// src/utils/mediapipe.ts
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import type { HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface MediapipeController {
  sendFrame: () => Promise<void>;
  close: () => void;
}

// Define which points should be connected to form the "skeleton" of the hand
// Each pair of numbers refers to indices in the 21 landmarks
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index finger
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
  [0, 13], [13, 14], [14, 15], [15, 16],// Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

/**
 * Draws a hand with landmarks + skeleton
 */
function drawHand(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number) {
  // Draw connections (skeleton lines)
  ctx.strokeStyle = "rgba(0, 200, 255, 0.8)";
  ctx.lineWidth = 2;
  HAND_CONNECTIONS.forEach(([start, end]) => {
    const p1 = landmarks[start];
    const p2 = landmarks[end];
    ctx.beginPath();
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.stroke();
  });

  // Draw keypoints (dots)
  landmarks.forEach((lm, i) => {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, i % 4 === 0 ? 5 : 3, 0, 2 * Math.PI); 
    // Fingertips (index 4, 8, 12, 16, 20) bigger dots
    ctx.fillStyle = (i === 4 || i === 8 || i === 12 || i === 16 || i === 20) 
      ? "red" 
      : "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/**
 * Initialize Mediapipe HandLandmarker
 */
export async function initMediapipe(
  videoEl: HTMLVideoElement,
  canvasEl: HTMLCanvasElement,
  onResults?: (results: HandLandmarkerResult) => void
): Promise<MediapipeController> {
  const maybeCtx = canvasEl.getContext("2d");
  if (!maybeCtx) throw new Error("Unable to get 2D context for canvas");
  const canvasCtx = maybeCtx;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    },
    numHands: 2,
    runningMode: "VIDEO",
  });

  async function sendFrame() {
    if (!videoEl.videoWidth || !videoEl.videoHeight) return;

    const results = handLandmarker.detectForVideo(videoEl, performance.now());

    // Clear canvas before drawing
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    if (results.landmarks) {
      results.landmarks.forEach((landmarks) =>
        drawHand(canvasCtx, landmarks, canvasEl.width, canvasEl.height)
      );
    }

    if (onResults) onResults(results);
  }

  return {
    sendFrame,
    close: () => handLandmarker.close(),
  };
}
