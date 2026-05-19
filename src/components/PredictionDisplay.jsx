/**
 * PredictionDisplay — Shows current predicted letter with confidence
 */

import { motion, AnimatePresence } from "framer-motion";
import ConfidenceBar from "./ConfidenceBar";
import useStore from "../store";

export default function PredictionDisplay({ currentPrediction }) {
  const predictionHistory = useStore((s) => s.predictionHistory);

  const letter = currentPrediction?.letter || "—";
  const confidence = currentPrediction?.confidence || 0;
  const progress = currentPrediction?.progress || 0;
  const isStable = currentPrediction?.isStable || false;

  const confidenceColor =
    confidence > 0.8
      ? "var(--color-success)"
      : confidence > 0.5
      ? "var(--color-warning)"
      : "var(--color-danger)";

  return (
    <motion.div
      className="glass-card prediction-card"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <p className="prediction-label">Current Sign</p>

      <ConfidenceBar value={confidence} size={130}>
        <AnimatePresence mode="wait">
          <motion.span
            key={letter}
            className="prediction-letter gradient-text"
            initial={{ scale: 0.7, opacity: 0, rotateX: -20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            style={{ fontSize: "4rem", display: "block" }}
          >
            {letter}
          </motion.span>
        </AnimatePresence>
      </ConfidenceBar>

      <motion.p
        className="prediction-confidence"
        style={{ color: confidenceColor }}
        key={Math.round(confidence * 10)}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {(confidence * 100).toFixed(0)}% confidence
      </motion.p>

      {/* Progress bar */}
      {currentPrediction && !isStable && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "0.6rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--color-text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            Confirming
          </span>
          <div
            style={{
              width: 72,
              height: 3,
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: "var(--color-accent)",
                borderRadius: "var(--radius-full)",
              }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.12 }}
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isStable && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: "0.4rem",
              fontSize: "0.7rem",
              color: "var(--color-success)",
              fontWeight: 600,
            }}
          >
            ✓ Letter confirmed
          </motion.p>
        )}
      </AnimatePresence>

      {/* History */}
      {predictionHistory.length > 0 && (
        <div className="prediction-history">
          {predictionHistory.slice(-8).map((h, i) => (
            <motion.span
              key={`${h}-${i}`}
              className="history-letter"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 20 }}
            >
              {h}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
