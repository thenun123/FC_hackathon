/**
 * LearnMode — Interactive ASL Teaching with Camera Verification
 *
 * Phase 1: "Copy Me" — Show each letter sign, user mimics it via camera
 * Phase 2: Feedback — Real-time verification with corrective hints
 * Phase 3: Graduation — Words & sentences once alphabet is mastered
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap, CheckCircle, XCircle, ChevronRight,
  RotateCcw, Trophy, Lock, Unlock, Star, Sparkles,
} from "lucide-react";
import { ASL_DESCRIPTIONS } from "../utils/landmarkClassifier";
import useStore from "../store";

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const PRACTICE_WORDS = [
  "HI", "HELLO", "YES", "NO", "LOVE", "HELP",
  "THANK", "GOOD", "BAD", "COOL", "DEAF", "SIGN",
];

const PRACTICE_SENTENCES = [
  "I LOVE YOU",
  "HELP ME",
  "GOOD JOB",
  "THANK YOU",
  "HI FRIEND",
];

function getImagePath(letter) {
  return `/asl-images/${letter}.jpg`;
}

// Feedback hints based on what the classifier returns vs expected
function getHint(expected, detected, fingerStates) {
  if (!detected) return "Show your hand to the camera clearly";

  const hints = {
    A: "Make a tight fist with your thumb on the side",
    B: "Straighten all four fingers together, thumb tucked",
    C: "Curve your hand like holding a cup",
    D: "Point your index finger up, others touch thumb",
    E: "Curl all fingers down tightly",
    F: "Touch thumb and index in a circle, extend others",
    G: "Point index finger sideways",
    H: "Point index and middle fingers sideways",
    I: "Only extend your pinky finger",
    J: "Start with I, then trace a J motion",
    K: "Index and middle up, thumb between them",
    L: "Make an L with index and thumb",
    M: "Tuck thumb under three fingers",
    N: "Tuck thumb under two fingers",
    O: "Touch all fingertips to thumb in an O",
    P: "Like K but point downward",
    Q: "Like G but point downward",
    R: "Cross your index and middle fingers",
    S: "Fist with thumb over fingers",
    T: "Thumb between index and middle in a fist",
    U: "Index and middle together, pointing up",
    V: "Spread index and middle apart",
    W: "Spread index, middle, and ring apart",
    X: "Hook your index finger",
    Y: "Extend thumb and pinky only",
    Z: "Trace a Z shape with your index finger",
  };

  if (detected === expected) return null; // Correct!
  return hints[expected] || `Try to form the letter ${expected}`;
}

export default function LearnMode() {
  const [phase, setPhase] = useState("alphabet"); // alphabet | words | sentences
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mastered, setMastered] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("asl_learn_mastered") || "{}");
    } catch { return {}; }
  });
  const [holdTimer, setHoldTimer] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [wordProgress, setWordProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const holdRef = useRef(null);
  const requiredHoldFrames = 20; // Must hold correct sign for ~20 frames

  // Pull live prediction from store
  const currentLetter = useStore((s) => s.currentLetter);
  const confidence = useStore((s) => s.confidence);

  // Save mastered state
  useEffect(() => {
    localStorage.setItem("asl_learn_mastered", JSON.stringify(mastered));
  }, [mastered]);

  // Current target
  const currentTarget = phase === "alphabet"
    ? ALL_LETTERS[currentIndex]
    : phase === "words"
    ? PRACTICE_WORDS[currentIndex]
    : PRACTICE_SENTENCES[currentIndex];

  const currentTargetLetter = phase === "alphabet"
    ? currentTarget
    : currentTarget[wordProgress];

  const totalItems = phase === "alphabet"
    ? ALL_LETTERS.length
    : phase === "words"
    ? PRACTICE_WORDS.length
    : PRACTICE_SENTENCES.length;

  const masteredCount = ALL_LETTERS.filter((l) => mastered[l]).length;
  const alphabetComplete = masteredCount === 26;
  const wordsUnlocked = masteredCount >= 10;

  // ── Real-time verification ──
  useEffect(() => {
    if (justCompleted) return;

    if (currentLetter === currentTargetLetter && confidence > 0.5) {
      setIsCorrect(true);
      setHoldTimer((prev) => {
        const next = prev + 1;
        if (next >= requiredHoldFrames) {
          // Letter is confirmed!
          handleLetterSuccess();
          return 0;
        }
        return next;
      });
    } else {
      setIsCorrect(false);
      setHoldTimer(0);
    }
  }, [currentLetter, confidence, currentTargetLetter, justCompleted]);

  const handleLetterSuccess = useCallback(() => {
    if (phase === "alphabet") {
      setJustCompleted(true);
      setMastered((prev) => ({ ...prev, [currentTargetLetter]: true }));

      // Celebration animation
      setTimeout(() => {
        setJustCompleted(false);
        if (currentIndex < ALL_LETTERS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setShowCelebration(true);
        }
      }, 1200);
    } else {
      // Words/sentences: advance to next letter in the word
      const target = currentTarget;
      const nextChar = wordProgress + 1;

      if (nextChar >= target.length) {
        // Word complete!
        setJustCompleted(true);
        setTimeout(() => {
          setJustCompleted(false);
          setWordProgress(0);
          if (currentIndex < totalItems - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setShowCelebration(true);
          }
        }, 1500);
      } else {
        // Skip spaces in word/sentence
        let next = nextChar;
        while (next < target.length && target[next] === " ") {
          next++;
        }
        if (next >= target.length) {
          setJustCompleted(true);
          setTimeout(() => {
            setJustCompleted(false);
            setWordProgress(0);
            if (currentIndex < totalItems - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              setShowCelebration(true);
            }
          }, 1500);
        } else {
          setWordProgress(next);
        }
      }
    }
  }, [phase, currentIndex, currentTarget, currentTargetLetter, wordProgress, totalItems]);

  const goToLetter = (idx) => {
    setCurrentIndex(idx);
    setHoldTimer(0);
    setIsCorrect(false);
    setJustCompleted(false);
  };

  const skipLetter = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHoldTimer(0);
      setIsCorrect(false);
      setJustCompleted(false);
      setWordProgress(0);
    }
  };

  const resetProgress = () => {
    setMastered({});
    setCurrentIndex(0);
    setPhase("alphabet");
    setWordProgress(0);
    setShowCelebration(false);
    localStorage.removeItem("asl_learn_mastered");
  };

  const holdProgress = Math.min(holdTimer / requiredHoldFrames, 1);
  const hint = !isCorrect && !justCompleted
    ? getHint(currentTargetLetter, currentLetter)
    : null;

  // ── Celebration Screen ──
  if (showCelebration) {
    return (
      <div style={{ animation: "fade-in 0.3s ease-out", textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}>
          🏆
        </div>
        <h2 className="gradient-text" style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          {phase === "alphabet" ? "Alphabet Complete!" : phase === "words" ? "Words Mastered!" : "Sentences Complete!"}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
          {phase === "alphabet"
            ? "You've learned all 26 ASL letters! Ready for words?"
            : "Amazing work! Keep practicing to build fluency."}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {phase === "alphabet" && (
            <button className="btn-primary" onClick={() => { setPhase("words"); setCurrentIndex(0); setShowCelebration(false); }}>
              <Sparkles size={16} /> Start Words
            </button>
          )}
          {phase === "words" && (
            <button className="btn-primary" onClick={() => { setPhase("sentences"); setCurrentIndex(0); setShowCelebration(false); }}>
              <Sparkles size={16} /> Start Sentences
            </button>
          )}
          <button className="btn-secondary" onClick={() => { setCurrentIndex(0); setShowCelebration(false); }}>
            <RotateCcw size={14} /> Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <GraduationCap size={20} style={{ color: "var(--color-accent-primary)" }} />
          <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Learn ASL</h2>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="badge badge-purple">{masteredCount}/26 Letters</span>
        </div>
      </div>

      {/* Phase Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          className={phase === "alphabet" ? "btn-primary" : "btn-secondary"}
          onClick={() => { setPhase("alphabet"); setCurrentIndex(0); setWordProgress(0); }}
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
        >
          <Star size={12} /> Alphabet
        </button>
        <button
          className={phase === "words" ? "btn-primary" : "btn-secondary"}
          onClick={() => wordsUnlocked && (setPhase("words"), setCurrentIndex(0), setWordProgress(0))}
          disabled={!wordsUnlocked}
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", opacity: wordsUnlocked ? 1 : 0.5 }}
        >
          {wordsUnlocked ? <Unlock size={12} /> : <Lock size={12} />} Words
        </button>
        <button
          className={phase === "sentences" ? "btn-primary" : "btn-secondary"}
          onClick={() => alphabetComplete && (setPhase("sentences"), setCurrentIndex(0), setWordProgress(0))}
          disabled={!alphabetComplete}
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", opacity: alphabetComplete ? 1 : 0.5 }}
        >
          {alphabetComplete ? <Unlock size={12} /> : <Lock size={12} />} Sentences
        </button>
      </div>

      {/* ═══ ALPHABET PHASE ═══ */}
      {phase === "alphabet" && (
        <>
          {/* Progress dots */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "1rem",
            padding: "0.5rem", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)",
          }}>
            {ALL_LETTERS.map((letter, i) => (
              <span
                key={letter}
                onClick={() => goToLetter(i)}
                style={{
                  width: "1.5rem", height: "1.5rem",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                  borderRadius: "var(--radius-sm)", cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: mastered[letter]
                    ? "rgba(16, 185, 129, 0.2)"
                    : i === currentIndex
                    ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                    : "var(--color-bg-card)",
                  color: mastered[letter]
                    ? "var(--color-accent-success)"
                    : i === currentIndex ? "white"
                    : "var(--color-text-muted)",
                  border: i === currentIndex ? "1px solid var(--color-accent-primary)" : "1px solid transparent",
                }}
              >
                {mastered[letter] ? "✓" : letter}
              </span>
            ))}
          </div>

          {/* Main Teaching Card */}
          <div className="glass-card" style={{
            padding: "1.5rem", textAlign: "center",
            border: justCompleted
              ? "2px solid var(--color-accent-success)"
              : isCorrect
              ? "2px solid rgba(16, 185, 129, 0.4)"
              : "1px solid rgba(124, 58, 237, 0.15)",
            transition: "border 0.3s ease",
          }}>
            <p style={{
              fontSize: "0.7rem", color: "var(--color-text-muted)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem",
            }}>
              {justCompleted ? "✓ Perfect!" : "Copy this sign"}
            </p>

            {/* Reference Image */}
            <img
              src={getImagePath(currentTarget)}
              alt={`ASL sign for ${currentTarget}`}
              key={currentTarget}
              style={{
                width: "180px", height: "180px", objectFit: "cover",
                borderRadius: "var(--radius-lg)", margin: "0 auto",
                display: "block",
                border: justCompleted
                  ? "3px solid var(--color-accent-success)"
                  : isCorrect
                  ? "3px solid rgba(16, 185, 129, 0.5)"
                  : "3px solid rgba(124, 58, 237, 0.3)",
                boxShadow: justCompleted
                  ? "0 0 30px rgba(16, 185, 129, 0.4)"
                  : "0 0 20px var(--color-glow-purple)",
                animation: justCompleted ? "letter-pop 0.3s ease-out" : "none",
                transition: "border 0.3s, box-shadow 0.3s",
              }}
            />

            {/* Letter Label */}
            <h2 className="gradient-text" style={{
              fontSize: "3rem", fontFamily: "var(--font-mono)",
              fontWeight: 800, margin: "0.75rem 0 0.25rem",
            }}>
              {currentTarget}
            </h2>

            {/* Description */}
            <p style={{
              color: "var(--color-text-secondary)", fontSize: "0.85rem",
              maxWidth: 380, margin: "0 auto 1rem",
            }}>
              {ASL_DESCRIPTIONS[currentTarget] || "Mimic the hand position shown above."}
            </p>

            {/* Hold Progress Ring */}
            {isCorrect && !justCompleted && (
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{
                  width: "100%", height: "6px",
                  background: "var(--color-bg-primary)", borderRadius: "var(--radius-full)",
                  overflow: "hidden", maxWidth: 200, margin: "0 auto",
                }}>
                  <div style={{
                    width: `${holdProgress * 100}%`, height: "100%",
                    background: "linear-gradient(90deg, var(--color-accent-success), #34d399)",
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.1s linear",
                  }} />
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--color-accent-success)", marginTop: "0.25rem" }}>
                  Hold it... {Math.round(holdProgress * 100)}%
                </p>
              </div>
            )}

            {/* Feedback */}
            {justCompleted && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", color: "var(--color-accent-success)", marginBottom: "0.5rem",
                animation: "letter-pop 0.3s ease-out",
              }}>
                <CheckCircle size={24} />
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Perfect! ✨</span>
              </div>
            )}

            {hint && !justCompleted && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", padding: "0.75rem",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-accent-warning)", fontSize: "0.8rem",
              }}>
                <XCircle size={16} style={{ flexShrink: 0 }} />
                {hint}
              </div>
            )}

            {/* Detected sign indicator */}
            {currentLetter && !justCompleted && (
              <p style={{
                fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.5rem",
              }}>
                Detecting: <span style={{
                  fontFamily: "var(--font-mono)", fontWeight: 700,
                  color: isCorrect ? "var(--color-accent-success)" : "var(--color-accent-danger)",
                }}>{currentLetter}</span>
                {" "}({Math.round(confidence * 100)}%)
              </p>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                className="btn-secondary"
                onClick={() => goToLetter(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                ← Prev
              </button>
              <button className="btn-secondary" onClick={skipLetter} style={{ padding: "0.5rem 0.75rem" }}>
                Skip <ChevronRight size={14} />
              </button>
              <button
                className="btn-secondary"
                onClick={() => goToLetter(Math.min(ALL_LETTERS.length - 1, currentIndex + 1))}
                disabled={currentIndex >= ALL_LETTERS.length - 1}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══ WORDS / SENTENCES PHASE ═══ */}
      {(phase === "words" || phase === "sentences") && (
        <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{
            fontSize: "0.7rem", color: "var(--color-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem",
          }}>
            {phase === "words" ? `Word ${currentIndex + 1} of ${totalItems}` : `Sentence ${currentIndex + 1} of ${totalItems}`}
          </p>

          {/* Word/Sentence with highlighted progress */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "6px",
            flexWrap: "wrap", marginBottom: "1.5rem",
          }}>
            {currentTarget.split("").map((ch, i) => {
              if (ch === " ") {
                return <span key={i} style={{ width: "1rem" }} />;
              }
              const isDone = i < wordProgress;
              const isCurrent = i === wordProgress;
              return (
                <span
                  key={i}
                  style={{
                    width: "2.5rem", height: "2.5rem",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1.25rem",
                    borderRadius: "var(--radius-sm)",
                    background: isDone
                      ? "rgba(16, 185, 129, 0.2)"
                      : isCurrent
                      ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                      : "var(--color-bg-card)",
                    color: isDone
                      ? "var(--color-accent-success)"
                      : isCurrent ? "white"
                      : "var(--color-text-muted)",
                    border: isCurrent ? "2px solid var(--color-accent-primary)" : "1px solid rgba(124, 58, 237, 0.1)",
                    boxShadow: isCurrent ? "0 0 15px var(--color-glow-purple)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDone ? "✓" : ch}
                </span>
              );
            })}
          </div>

          {/* Current letter to sign */}
          {currentTargetLetter && (
            <>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                Sign this letter:
              </p>

              <img
                src={getImagePath(currentTargetLetter)}
                alt={`ASL sign for ${currentTargetLetter}`}
                key={`${currentTarget}-${wordProgress}`}
                style={{
                  width: "140px", height: "140px", objectFit: "cover",
                  borderRadius: "var(--radius-lg)", margin: "0 auto 0.5rem",
                  display: "block",
                  border: isCorrect
                    ? "3px solid rgba(16, 185, 129, 0.5)"
                    : "3px solid rgba(124, 58, 237, 0.3)",
                  animation: "letter-pop 0.3s ease-out",
                }}
              />

              <h3 className="gradient-text" style={{
                fontSize: "2rem", fontFamily: "var(--font-mono)", fontWeight: 800,
              }}>
                {currentTargetLetter}
              </h3>

              {/* Hold Progress */}
              {isCorrect && !justCompleted && (
                <div style={{ margin: "0.5rem auto", maxWidth: 200 }}>
                  <div style={{
                    width: "100%", height: "6px",
                    background: "var(--color-bg-primary)", borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${holdProgress * 100}%`, height: "100%",
                      background: "linear-gradient(90deg, var(--color-accent-success), #34d399)",
                      borderRadius: "var(--radius-full)", transition: "width 0.1s linear",
                    }} />
                  </div>
                </div>
              )}

              {justCompleted && (
                <div style={{
                  color: "var(--color-accent-success)", fontWeight: 700,
                  fontSize: "1.1rem", marginTop: "0.5rem",
                  animation: "letter-pop 0.3s ease-out",
                }}>
                  ✨ {phase === "words" ? "Word Complete!" : "Sentence Complete!"} ✨
                </div>
              )}

              {hint && !justCompleted && (
                <p style={{
                  fontSize: "0.8rem", color: "var(--color-accent-warning)",
                  marginTop: "0.5rem", padding: "0.5rem",
                  background: "rgba(245, 158, 11, 0.08)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  💡 {hint}
                </p>
              )}

              {currentLetter && !justCompleted && (
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                  Detecting: <span style={{
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                    color: isCorrect ? "var(--color-accent-success)" : "var(--color-accent-danger)",
                  }}>{currentLetter}</span>
                </p>
              )}
            </>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              className="btn-secondary"
              onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setWordProgress(0); }}
              disabled={currentIndex === 0}
              style={{ padding: "0.5rem 0.75rem" }}
            >
              ← Prev
            </button>
            <button className="btn-secondary" onClick={skipLetter} style={{ padding: "0.5rem 0.75rem" }}>
              Skip <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Reset */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button className="btn-secondary" onClick={resetProgress} style={{ fontSize: "0.75rem" }}>
          <RotateCcw size={12} /> Reset All Progress
        </button>
      </div>
    </div>
  );
}
