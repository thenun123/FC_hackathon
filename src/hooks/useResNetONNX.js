/**
 * useResNetONNX — ResNet18 ASL Model Inference Hook
 *
 * Loads the ONNX-exported ResNet18 model (99.7% accuracy) and runs
 * inference on hand-crop images extracted from the video frame.
 *
 * This provides a CNN-based classification that complements the
 * landmark-based Fingerpose + heuristic ensemble.
 */

import { useEffect, useRef, useState, useCallback } from "react";

const CLASS_MAP = {};
for (let i = 0; i < 26; i++) {
  CLASS_MAP[i] = String.fromCharCode(65 + i); // 0->A, 1->B, ..., 25->Z
}

// ImageNet normalization constants
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

export function useResNetONNX() {
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const sessionRef = useRef(null);
  const ortRef = useRef(null);
  const canvasRef = useRef(null);

  // Load ONNX model
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        setIsLoading(true);
        const ort = await import("onnxruntime-web");
        ortRef.current = ort;

        const response = await fetch("/asl_resnet18.onnx");
        if (!response.ok) throw new Error("ResNet ONNX model not found");

        const modelBuffer = await response.arrayBuffer();
        const session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ["wasm"],
        });

        if (!cancelled) {
          sessionRef.current = session;
          setModelLoaded(true);
          setIsLoading(false);
          console.log("✅ ResNet18 ONNX model loaded (99.7% accuracy)");
        }
      } catch (err) {
        if (!cancelled) {
          console.log("ℹ️ ResNet ONNX model not available:", err.message);
          setModelLoaded(false);
          setIsLoading(false);
        }
      }
    }

    loadModel();
    return () => { cancelled = true; };
  }, []);

  /**
   * Extract hand crop from video frame using landmark bounding box,
   * then run ResNet18 inference.
   *
   * @param {HTMLVideoElement} videoEl - The video element
   * @param {Array} landmarks - 21 MediaPipe landmarks [{x, y, z}, ...]
   * @returns {{ letter: string, confidence: number } | null}
   */
  const predictFromVideo = useCallback((videoEl, landmarks) => {
    if (!sessionRef.current || !ortRef.current || !videoEl || !landmarks) {
      return null;
    }

    try {
      const ort = ortRef.current;
      const session = sessionRef.current;

      // Get video dimensions
      const vw = videoEl.videoWidth;
      const vh = videoEl.videoHeight;
      if (vw === 0 || vh === 0) return null;

      // Calculate hand bounding box from landmarks with padding
      let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
      for (const lm of landmarks) {
        xMin = Math.min(xMin, lm.x * vw);
        yMin = Math.min(yMin, lm.y * vh);
        xMax = Math.max(xMax, lm.x * vw);
        yMax = Math.max(yMax, lm.y * vh);
      }

      // Add padding (40px like the original model)
      const pad = 40;
      xMin = Math.max(0, Math.floor(xMin) - pad);
      yMin = Math.max(0, Math.floor(yMin) - pad);
      xMax = Math.min(vw, Math.ceil(xMax) + pad);
      yMax = Math.min(vh, Math.ceil(yMax) + pad);

      const cropW = xMax - xMin;
      const cropH = yMax - yMin;
      if (cropW < 10 || cropH < 10) return null;

      // Create off-screen canvas for cropping + resizing to 224x224
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Draw hand crop resized to 224x224
      ctx.drawImage(videoEl, xMin, yMin, cropW, cropH, 0, 0, 224, 224);
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const pixels = imageData.data; // RGBA

      // Convert to CHW float32 tensor with ImageNet normalization
      const tensorData = new Float32Array(3 * 224 * 224);
      for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 224; x++) {
          const idx = (y * 224 + x) * 4;
          const r = pixels[idx] / 255;
          const g = pixels[idx + 1] / 255;
          const b = pixels[idx + 2] / 255;

          // Normalize with ImageNet mean/std
          tensorData[0 * 224 * 224 + y * 224 + x] = (r - MEAN[0]) / STD[0]; // R channel
          tensorData[1 * 224 * 224 + y * 224 + x] = (g - MEAN[1]) / STD[1]; // G channel
          tensorData[2 * 224 * 224 + y * 224 + x] = (b - MEAN[2]) / STD[2]; // B channel
        }
      }

      // Create ONNX tensor [1, 3, 224, 224]
      const inputTensor = new ort.Tensor("float32", tensorData, [1, 3, 224, 224]);

      // Run inference (synchronous-ish via blocking promise)
      // We'll return a promise that the caller can await
      return session.run({ input: inputTensor }).then((output) => {
        const logits = output.output.data;

        // Softmax
        const maxLogit = Math.max(...logits);
        const expLogits = Array.from(logits).map((l) => Math.exp(l - maxLogit));
        const sumExp = expLogits.reduce((a, b) => a + b, 0);
        const probs = expLogits.map((e) => e / sumExp);

        // Get top prediction
        let maxProb = 0;
        let maxIdx = 0;
        for (let i = 0; i < probs.length; i++) {
          if (probs[i] > maxProb) {
            maxProb = probs[i];
            maxIdx = i;
          }
        }

        return {
          letter: CLASS_MAP[maxIdx],
          confidence: maxProb,
        };
      });
    } catch (err) {
      console.warn("ResNet inference error:", err);
      return null;
    }
  }, []);

  return {
    isLoading,
    modelLoaded,
    predictFromVideo,
  };
}
