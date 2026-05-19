/**
 * DictionaryMode — A-Z + Special signs ASL reference with training images
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Dumbbell, ChevronLeft } from "lucide-react";
import { ASL_DESCRIPTIONS } from "../utils/landmarkClassifier";
import useStore from "../store";

const ALL_SIGNS = [
  ...("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")),
  "SPACE", "DEL", "NOTHING",
];

const SIGN_LABELS = {
  SPACE: "Space",
  DEL: "Delete",
  NOTHING: "Nothing / Rest",
};

const SIGN_DESCRIPTIONS = {
  ...ASL_DESCRIPTIONS,
  SPACE: "Open palm facing down, hand flat. Used between words to indicate a space.",
  DEL: "Hand gesture to indicate deleting the previous letter. Swipe motion.",
  NOTHING: "No hand sign detected — resting position or empty frame.",
};

function getImagePath(sign) {
  return `/asl-images/${sign}.jpg`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.015, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function DictionaryMode() {
  const [selectedSign, setSelectedSign] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceTarget, setPracticeTarget] = useState(null);
  const letterStats = useStore((s) => s.letterStats);

  const startPractice = () => {
    const randomIdx = Math.floor(Math.random() * ALL_SIGNS.length);
    setPracticeTarget(ALL_SIGNS[randomIdx]);
    setPracticeMode(true);
  };

  const nextPractice = () => {
    const randomIdx = Math.floor(Math.random() * ALL_SIGNS.length);
    setPracticeTarget(ALL_SIGNS[randomIdx]);
  };

  if (selectedSign) {
    const label = SIGN_LABELS[selectedSign] || selectedSign;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
        <button className="btn-secondary" onClick={() => setSelectedSign(null)} style={{ marginBottom: "0.75rem" }}>
          <ChevronLeft size={14} /> Back
        </button>

        <motion.div
          className="glass-card"
          style={{ padding: "1.75rem", textAlign: "center" }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <motion.img
            src={getImagePath(selectedSign)}
            alt={`ASL sign for ${label}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "var(--radius-lg)",
              border: "2px solid rgba(255, 255, 255, 0.06)",
              margin: "0 auto",
              display: "block",
            }}
          />

          <h2
            className="gradient-text"
            style={{
              fontSize: "2.5rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              margin: "0.75rem 0 0.4rem",
            }}
          >
            {label}
          </h2>

          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto", fontSize: "0.85rem" }}>
            {SIGN_DESCRIPTIONS[selectedSign] || "Practice this sign by mimicking the hand position shown above."}
          </p>

          {letterStats[selectedSign] && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: "1.25rem",
                padding: "0.85rem",
                background: "var(--color-bg-primary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <p style={{ fontSize: "0.65rem", color: "var(--color-text-dim)", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Your Stats
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem" }}>
                {letterStats[selectedSign].correct} / {letterStats[selectedSign].attempts} correct
                <span style={{ marginLeft: "0.4rem", color: "var(--color-accent-secondary)" }}>
                  ({((letterStats[selectedSign].correct / letterStats[selectedSign].attempts) * 100).toFixed(0)}%)
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <BookOpen size={16} style={{ color: "var(--color-accent)" }} />
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>ASL Dictionary</h2>
        </div>
        <motion.button className="btn-primary" onClick={startPractice} whileTap={{ scale: 0.96 }}>
          <Dumbbell size={13} /> Practice
        </motion.button>
      </div>

      {/* Practice Mode */}
      <AnimatePresence>
        {practiceMode && practiceTarget && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "1.25rem", textAlign: "center", marginBottom: "0.85rem", overflow: "hidden" }}
          >
            <p style={{ fontSize: "0.65rem", color: "var(--color-text-dim)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
              Practice: Sign this
            </p>

            <motion.img
              key={practiceTarget}
              src={getImagePath(practiceTarget)}
              alt={`ASL sign for ${SIGN_LABELS[practiceTarget] || practiceTarget}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                width: "160px",
                height: "160px",
                objectFit: "cover",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid rgba(255, 255, 255, 0.06)",
                margin: "0 auto 0.4rem",
                display: "block",
              }}
            />

            <span className="gradient-text" style={{ fontSize: "2rem", fontFamily: "var(--font-mono)", fontWeight: 800 }}>
              {SIGN_LABELS[practiceTarget] || practiceTarget}
            </span>

            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "0.35rem", maxWidth: 320, margin: "0.35rem auto 0" }}>
              {SIGN_DESCRIPTIONS[practiceTarget] || "Try to match the hand position shown above."}
            </p>

            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "0.75rem" }}>
              <motion.button className="btn-primary" onClick={nextPractice} whileTap={{ scale: 0.96 }}>Next Sign</motion.button>
              <button className="btn-secondary" onClick={() => setPracticeMode(false)}>Exit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alphabet */}
      <p style={{ fontSize: "0.62rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem", fontWeight: 500 }}>
        Alphabet
      </p>

      <div className="dictionary-grid">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter, i) => {
          const stats = letterStats[letter];
          const isMastered = stats && stats.attempts >= 5 && stats.correct / stats.attempts >= 0.8;

          return (
            <motion.div
              key={letter}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`glass-card dict-card ${isMastered ? "mastered" : ""}`}
              onClick={() => setSelectedSign(letter)}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.96 }}
              style={{ padding: "0.45rem" }}
            >
              <img
                src={getImagePath(letter)}
                alt={`ASL ${letter}`}
                style={{
                  width: "52px",
                  height: "52px",
                  objectFit: "cover",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              />
              <span className="letter" style={{ fontSize: "1.1rem" }}>{letter}</span>
              {stats && <span className="label">{((stats.correct / stats.attempts) * 100).toFixed(0)}%</span>}
              {!stats && <span className="label">New</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Special Signs */}
      <p style={{ fontSize: "0.62rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "1rem", marginBottom: "0.4rem", fontWeight: 500 }}>
        Special Signs
      </p>

      <div className="dictionary-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {["SPACE", "DEL", "NOTHING"].map((sign, i) => (
          <motion.div
            key={sign}
            custom={i + 26}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="glass-card dict-card"
            onClick={() => setSelectedSign(sign)}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.96 }}
            style={{ padding: "0.6rem" }}
          >
            <img
              src={getImagePath(sign)}
              alt={`ASL ${SIGN_LABELS[sign]}`}
              style={{
                width: "52px",
                height: "52px",
                objectFit: "cover",
                borderRadius: "var(--radius-xs)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
              }}
            />
            <span className="letter" style={{ fontSize: "0.85rem" }}>{SIGN_LABELS[sign]}</span>
            <span className="label">Special</span>
          </motion.div>
        ))}
      </div>

      <p style={{ marginTop: "0.75rem", fontSize: "0.68rem", color: "var(--color-text-dim)", textAlign: "center" }}>
        Training dataset images · Letters J and Z require motion
      </p>
    </div>
  );
}
