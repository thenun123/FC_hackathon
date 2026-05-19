/**
 * useMediaPipe — Hand Landmark Detection Hook
 *
 * Initializes MediaPipe HandLandmarker and runs real-time detection
 * on video frames using requestAnimationFrame.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export function useMediaPipe(videoRef, canvasRef, enabled = true) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [handedness, setHandedness] = useState(null);
  const [fps, setFps] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const handLandmarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const fpsCounterRef = useRef({ frames: 0, lastCheck: 0 });

  // Initialize HandLandmarker
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!cancelled) {
          handLandmarkerRef.current = handLandmarker;
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("MediaPipe init error:", err);
          setError(err.message);
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
    };
  }, []);

  // Draw landmarks on canvas
  const drawLandmarks = useCallback((landmarkData, canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!landmarkData || landmarkData.length === 0) return;

    const lm = landmarkData;

    // Connection pairs for hand skeleton
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // index
      [0, 9], [9, 10], [10, 11], [11, 12],  // middle
      [0, 13], [13, 14], [14, 15], [15, 16],// ring
      [0, 17], [17, 18], [18, 19], [19, 20],// pinky
      [5, 9], [9, 13], [13, 17],            // palm
    ];

    // Finger colors
    const fingerColors = [
      "#ef4444", // thumb - red
      "#3b82f6", // index - blue
      "#10b981", // middle - green
      "#f59e0b", // ring - amber
      "#ec4899", // pinky - pink
    ];

    function getFingerColor(idx) {
      if (idx <= 4) return fingerColors[0];
      if (idx <= 8) return fingerColors[1];
      if (idx <= 12) return fingerColors[2];
      if (idx <= 16) return fingerColors[3];
      return fingerColors[4];
    }

    // Draw connections
    for (const [i, j] of connections) {
      const x1 = lm[i].x * w;
      const y1 = lm[i].y * h;
      const x2 = lm[j].x * w;
      const y2 = lm[j].y * h;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = getFingerColor(j);
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw landmarks
    for (let i = 0; i < lm.length; i++) {
      const x = lm[i].x * w;
      const y = lm[i].y * h;
      const color = getFingerColor(i);

      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Bright center
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
  }, []);

  // Detection loop
  useEffect(() => {
    if (!enabled || isLoading || error || !handLandmarkerRef.current) return;

    const video = videoRef?.current;
    const canvas = canvasRef?.current;
    if (!video || !canvas) return;

    let running = true;

    function detect() {
      if (!running || !handLandmarkerRef.current) return;
      if (video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();
      if (now - lastTimeRef.current < 33) {
        // Cap at ~30fps
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // Resize canvas to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      try {
        const results = handLandmarkerRef.current.detectForVideo(video, now);

        if (results.landmarks && results.landmarks.length > 0) {
          setLandmarks(results.landmarks[0]);
          setHandedness(results.handednesses?.[0]?.[0]?.categoryName || null);
          setIsDetecting(true);
          drawLandmarks(results.landmarks[0], canvas);
        } else {
          setLandmarks(null);
          setHandedness(null);
          setIsDetecting(false);
          // Clear canvas
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (e) {
        // Ignore detection errors (can happen during video transitions)
      }

      // FPS counter
      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastCheck >= 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastCheck = now;
      }

      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(detect);
    }

    detect();

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, isLoading, error, videoRef, canvasRef, drawLandmarks]);

  return {
    isLoading,
    error,
    landmarks,
    handedness,
    fps,
    isDetecting,
  };
}
