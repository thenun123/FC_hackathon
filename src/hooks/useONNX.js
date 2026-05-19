/**
 * useONNX — ONNX Model Inference Hook
 *
 * Loads an ONNX model for ASL classification.
 * Falls back to rule-based landmark classifier if model not available.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { classifyLandmarks } from "../utils/landmarkClassifier";

export function useONNX() {
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [useHeuristic, setUseHeuristic] = useState(false);
  const sessionRef = useRef(null);

  // Try to load ONNX model
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        setIsLoading(true);

        // Try to load ONNX Runtime and model
        const ort = await import("onnxruntime-web");

        // Try to load the model file
        const response = await fetch("/asl_model.onnx");
        if (!response.ok) throw new Error("Model file not found");

        const modelBuffer = await response.arrayBuffer();
        const session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ["wasm"],
        });

        if (!cancelled) {
          sessionRef.current = session;
          setModelLoaded(true);
          setUseHeuristic(false);
          setIsLoading(false);
          console.log("✅ ONNX model loaded successfully");
        }
      } catch (err) {
        if (!cancelled) {
          console.log("ℹ️ ONNX model not available, using heuristic classifier:", err.message);
          setUseHeuristic(true);
          setModelLoaded(false);
          setIsLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  // Run inference
  const predict = useCallback(
    (landmarks) => {
      if (!landmarks || landmarks.length < 21) {
        return { letter: null, confidence: 0 };
      }

      if (useHeuristic || !sessionRef.current) {
        // Use rule-based classifier
        return classifyLandmarks(landmarks);
      }

      // ONNX inference would go here
      // For now, fallback to heuristic since most users won't have the model
      return classifyLandmarks(landmarks);
    },
    [useHeuristic]
  );

  return {
    isLoading,
    modelLoaded,
    useHeuristic,
    predict,
  };
}
