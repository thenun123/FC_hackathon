/**
 * StatsPanel — User progress tracking
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Target, Hash, Clock, RotateCcw } from "lucide-react";
import { ASL_ALPHABET } from "../utils/landmarkClassifier";
import { resetAllData } from "../utils/storageHelpers";
import useStore from "../store";

const statCardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

export default function StatsPanel() {
  const stats = useStore((s) => s.stats);
  const letterStats = useStore((s) => s.letterStats);
  const refreshStats = useStore((s) => s.refreshStats);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    resetAllData();
    refreshStats();
    setShowConfirm(false);
  };

  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const data of Object.values(letterStats)) {
    totalAttempts += data.attempts;
    totalCorrect += data.correct;
  }
  const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  const statCards = [
    { value: stats.streak, label: "Day Streak", color: "var(--color-accent-tertiary)", icon: <Flame size={22} /> },
    { value: stats.totalSigns, label: "Total Signs", color: "var(--color-accent-secondary)" },
    { value: `${overallAccuracy.toFixed(0)}%`, label: "Accuracy", color: "var(--color-success)" },
    { value: stats.bestStreak || 0, label: "Best Streak", color: "var(--color-warning)" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.85rem" }}>
        Your Progress
      </h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="glass-card stat-card"
            custom={i}
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="stat-value" style={{ color: card.color, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
              {card.icon || null}
              {card.value}
            </div>
            <p className="stat-label">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Per-Letter Accuracy */}
      {totalAttempts > 0 && (
        <motion.div
          className="glass-card accuracy-chart"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <h3 style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-dim)", marginBottom: "0.6rem" }}>
            Per-Letter Accuracy
          </h3>
          {ASL_ALPHABET.map((letter, i) => {
            const data = letterStats[letter];
            if (!data) return null;
            const accuracy = (data.correct / data.attempts) * 100;

            return (
              <div key={letter} className="accuracy-row">
                <span className="letter-label">{letter}</span>
                <div className="accuracy-bar-bg">
                  <motion.div
                    className="accuracy-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ delay: 0.3 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="accuracy-value">{accuracy.toFixed(0)}%</span>
              </div>
            );
          }).filter(Boolean)}
        </motion.div>
      )}

      {/* Empty state */}
      {totalAttempts === 0 && (
        <motion.div
          className="glass-card"
          style={{ padding: "1.75rem", textAlign: "center", color: "var(--color-text-dim)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Target size={36} style={{ opacity: 0.3, marginBottom: "0.4rem" }} />
          <p style={{ fontSize: "0.85rem" }}>No practice data yet.</p>
          <p style={{ fontSize: "0.75rem", marginTop: "0.2rem" }}>Start signing to track your progress!</p>
        </motion.div>
      )}

      {/* Reset */}
      <div style={{ marginTop: "1.25rem" }}>
        <AnimatePresence mode="wait">
          {!showConfirm ? (
            <motion.div key="reset-btn" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button className="btn-danger" onClick={() => setShowConfirm(true)}>
                <RotateCcw size={13} /> Reset All Data
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span style={{ fontSize: "0.78rem", color: "var(--color-danger)" }}>
                This cannot be undone.
              </span>
              <button className="btn-danger" onClick={handleReset}>Confirm</button>
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
