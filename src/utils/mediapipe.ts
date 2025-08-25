// src/utils/mediapipe.ts
import {
  FilesetResolver,
  HandLandmarker
} from "@mediapipe/tasks-vision";
import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";

export interface MediapipeController {
  sendFrame: () => Promise<void>;
  close: () => void;
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
  if (!maybeCtx) {
    throw new Error("Unable to get 2D context for canvas");
  }
  // after this point, ctx is guaranteed non-null
  const canvasCtx = maybeCtx as CanvasRenderingContext2D;

  // Load the model bundle
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

    const startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(videoEl, startTimeMs);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    if (results.landmarks) {
      results.landmarks.forEach((landmarks) => {
        landmarks.forEach((lm) => {
          canvasCtx.beginPath();
          canvasCtx.arc(
            lm.x * canvasEl.width,
            lm.y * canvasEl.height,
            4,
            0,
            2 * Math.PI
          );
          canvasCtx.fillStyle = "red";
          canvasCtx.fill();
        });
      });
    }

    canvasCtx.restore();

    if (onResults) onResults(results);
  }

  return {
    sendFrame,
    close: () => {
      handLandmarker.close();
    },
  };
}
