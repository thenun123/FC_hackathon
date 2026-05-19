/**
 * WordBuilder — Accumulates letters into words and sentences
 */

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Delete, Space, Trash2, CheckCircle, Loader } from "lucide-react";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useGrammarCheck } from "../hooks/useGrammarCheck";
import useStore from "../store";

export default function WordBuilder() {
  const wordLetters = useStore((s) => s.wordLetters);
  const sentence = useStore((s) => s.sentence);
  const removeLetter = useStore((s) => s.removeLetter);
  const commitWord = useStore((s) => s.commitWord);
  const clearWord = useStore((s) => s.clearWord);
  const clearSentence = useStore((s) => s.clearSentence);
  const settings = useStore((s) => s.settings);

  const { speak, isSpeaking, isSupported: ttsSupported } = useSpeechSynthesis();
  const { corrections, isChecking, checkGrammar, clearCorrections } = useGrammarCheck();

  const currentWord = wordLetters.join("");
  const fullText = sentence + currentWord;

  const handleSpeak = () => {
    if (!fullText.trim()) return;
    speak(fullText.trim(), {
      rate: settings.ttsRate,
      pitch: settings.ttsPitch,
      voice: settings.ttsVoice,
    });
  };

  const handleCheckGrammar = () => {
    if (!fullText.trim()) return;
    checkGrammar(fullText.trim());
  };

  return (
    <motion.div
      className="glass-card word-builder"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.6rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-text-dim)",
          }}
        >
          Word Builder
        </h3>
        <span className="badge badge-purple">
          {wordLetters.length} letters
        </span>
      </div>

      {/* Current word display */}
      <div className="word-display">
        {sentence && (
          <span style={{ color: "var(--color-text-secondary)" }}>
            {sentence}
          </span>
        )}
        <AnimatePresence>
          {wordLetters.map((l, i) => (
            <motion.span
              key={`${l}-${i}`}
              className="letter-chip"
              initial={{ scale: 0.5, opacity: 0, y: -4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              style={{ color: "var(--color-accent-secondary)" }}
            >
              {l}
            </motion.span>
          ))}
        </AnimatePresence>
        <span className="cursor-blink" />
      </div>

      {/* Action buttons */}
      <div className="word-actions">
        <button className="btn-secondary" onClick={removeLetter} disabled={wordLetters.length === 0}>
          <Delete size={13} /> Backspace
        </button>
        <button className="btn-secondary" onClick={commitWord} disabled={wordLetters.length === 0}>
          <Space size={13} /> Space
        </button>
        <button className="btn-secondary" onClick={clearWord} disabled={wordLetters.length === 0}>
          <Trash2 size={13} /> Clear Word
        </button>
        <button className="btn-danger" onClick={() => { clearSentence(); clearCorrections(); }} disabled={!fullText}>
          <Trash2 size={13} /> Clear All
        </button>
      </div>

      {/* Speech & Grammar */}
      <div className="word-actions" style={{ marginTop: "0.6rem" }}>
        {ttsSupported && (
          <motion.button
            className="btn-primary"
            onClick={handleSpeak}
            disabled={!fullText.trim() || isSpeaking}
            whileTap={{ scale: 0.96 }}
          >
            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isSpeaking ? "Speaking..." : "Speak"}
          </motion.button>
        )}
        <motion.button
          className="btn-secondary"
          onClick={handleCheckGrammar}
          disabled={!fullText.trim() || isChecking}
          whileTap={{ scale: 0.96 }}
        >
          {isChecking ? <Loader size={13} style={{ animation: "spin-slow 1s linear infinite" }} /> : <CheckCircle size={13} />}
          {isChecking ? "Checking..." : "Check Grammar"}
        </motion.button>
      </div>

      {/* Grammar corrections */}
      <AnimatePresence>
        {corrections.length > 0 && (
          <motion.div
            className="sentence-display"
            style={{ marginTop: "0.75rem" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                color: "var(--color-warning)",
                fontWeight: 600,
                marginBottom: "0.4rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Grammar Suggestions
            </p>
            {corrections.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: "0.4rem 0",
                  borderBottom: i < corrections.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                }}
              >
                <p style={{ fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                  <span style={{ textDecoration: "line-through", color: "var(--color-danger)" }}>
                    {c.original}
                  </span>
                  {c.suggestions.length > 0 && (
                    <span>
                      {" → "}
                      <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                        {c.suggestions[0]}
                      </span>
                    </span>
                  )}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                  {c.message}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
