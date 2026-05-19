/**
 * usePredictionBuffer — Temporal Smoothing Hook
 *
 * Wraps the PredictionBuffer class in a React hook.
 * Provides stable predictions with anti-flicker logic.
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { PredictionBuffer } from "../utils/temporalSmoothing";

export function usePredictionBuffer(settings = {}) {
  const {
    windowSize = 15,
    confirmThreshold = 8,
    minConfidence = 0.6,
  } = settings;

  const bufferRef = useRef(new PredictionBuffer(windowSize, confirmThreshold, minConfidence));
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [confirmedLetter, setConfirmedLetter] = useState(null);
  const [history, setHistory] = useState([]);

  // Update buffer settings when they change
  useEffect(() => {
    bufferRef.current.setWindowSize(windowSize);
    bufferRef.current.setConfirmThreshold(confirmThreshold);
    bufferRef.current.setMinConfidence(minConfidence);
  }, [windowSize, confirmThreshold, minConfidence]);

  const addPrediction = useCallback((letter, confidence) => {
    if (!letter) return;

    bufferRef.current.addPrediction(letter, confidence);
    const stable = bufferRef.current.getStablePrediction();
    setCurrentPrediction(stable);

    // Try to confirm
    const confirmed = bufferRef.current.confirmLetter();
    if (confirmed) {
      setConfirmedLetter(confirmed);
      setHistory((prev) => {
        const next = [...prev, confirmed];
        return next.slice(-10); // Keep last 10
      });
    }
  }, []);

  const reset = useCallback(() => {
    bufferRef.current.reset();
    setCurrentPrediction(null);
    setConfirmedLetter(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    currentPrediction,
    confirmedLetter,
    history,
    addPrediction,
    reset,
    clearHistory,
  };
}
