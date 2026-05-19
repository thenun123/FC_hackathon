/**
 * VoiceInput — Browser Speech-to-Text with ASL Image Display
 *
 * When a hearing person speaks → text appears → ASL sign images
 * are shown one by one so a deaf person can learn the signs.
 */

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Trash2, AlertCircle, Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function VoiceInput() {
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    start,
    stop,
    clearTranscript,
  } = useSpeechRecognition();

  const [showingSigns, setShowingSigns] = useState(false);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [signLetters, setSignLetters] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef(null);

  // Convert transcript to letter array when it changes
  useEffect(() => {
    if (transcript) {
      const letters = transcript
        .toUpperCase()
        .split("")
        .filter((ch) => /[A-Z ]/.test(ch));
      setSignLetters(letters);
    }
  }, [transcript]);

  // Auto-play through letters
  useEffect(() => {
    if (isAutoPlaying && showingSigns && currentSignIndex < signLetters.length) {
      autoPlayRef.current = setTimeout(() => {
        setCurrentSignIndex((prev) => prev + 1);
      }, 1500); // Show each sign for 1.5 seconds
    }

    if (currentSignIndex >= signLetters.length && isAutoPlaying) {
      setIsAutoPlaying(false);
    }

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [isAutoPlaying, showingSigns, currentSignIndex, signLetters.length]);

  const handleShowSigns = () => {
    if (signLetters.length === 0) return;
    setShowingSigns(true);
    setCurrentSignIndex(0);
    setIsAutoPlaying(true);
  };

  const handleNext = () => {
    if (currentSignIndex < signLetters.length - 1) {
      setCurrentSignIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSignIndex > 0) {
      setCurrentSignIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentSignIndex(0);
    setIsAutoPlaying(true);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const currentLetter =
    signLetters.length > 0 && currentSignIndex < signLetters.length
      ? signLetters[currentSignIndex]
      : null;

  const getImagePath = (letter) => {
    if (letter === " ") return "/asl-images/SPACE.jpg";
    return `/asl-images/${letter}.jpg`;
  };

  if (!isSupported) {
    return (
      <div className="glass-card voice-input-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-text-muted)",
            fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={16} />
          Speech recognition not supported in this browser. Use Chrome or Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card voice-input-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-text-muted)",
          }}
        >
          &#127908; Voice to ASL Signs
        </h3>
        <span
          className={`badge ${isListening ? "badge-green" : "badge-purple"}`}
        >
          {isListening ? "LISTENING" : "READY"}
        </span>
      </div>

      {/* Mic + Instructions */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          className={`mic-btn ${isListening ? "recording" : ""}`}
          onClick={isListening ? stop : start}
          title={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              marginBottom: "0.25rem",
            }}
          >
            {isListening
              ? "Listening... Speak now."
              : "Click the mic to start voice input."}
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
            Hearing person speaks &#8594; Text appears &#8594; ASL signs shown
            to deaf person
          </p>
        </div>
      </div>

      {/* Transcript */}
      {(transcript || interimTranscript) && (
        <div className="voice-transcript" style={{ marginTop: "0.75rem" }}>
          {transcript && <span>{transcript}</span>}
          {interimTranscript && (
            <span
              style={{
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              {" "}
              {interimTranscript}
            </span>
          )}
        </div>
      )}

      {/* Show Signs Button */}
      {transcript && !showingSigns && (
        <button
          className="btn-primary"
          onClick={handleShowSigns}
          style={{ marginTop: "0.75rem" }}
        >
          <Play size={14} /> Show ASL Signs for Deaf Person
        </button>
      )}

      {/* === ASL Sign Image Display === */}
      {showingSigns && signLetters.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "var(--color-bg-primary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
          }}
        >
          {/* Progress indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Sign {Math.min(currentSignIndex + 1, signLetters.length)} of{" "}
              {signLetters.length}
            </span>
            <span className="badge badge-cyan">
              {isAutoPlaying ? "AUTO" : "MANUAL"}
            </span>
          </div>

          {/* Letter sequence with highlight */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginBottom: "1rem",
              padding: "0.5rem",
              background: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {signLetters.map((letter, i) => (
              <span
                key={i}
                onClick={() => {
                  setCurrentSignIndex(i);
                  setIsAutoPlaying(false);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: letter === " " ? "1rem" : "1.5rem",
                  height: "1.5rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background:
                    i === currentSignIndex
                      ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                      : i < currentSignIndex
                      ? "rgba(16, 185, 129, 0.2)"
                      : "var(--color-bg-card)",
                  color:
                    i === currentSignIndex
                      ? "white"
                      : i < currentSignIndex
                      ? "var(--color-accent-success)"
                      : "var(--color-text-muted)",
                  border:
                    i === currentSignIndex
                      ? "1px solid var(--color-accent-primary)"
                      : "1px solid transparent",
                  boxShadow:
                    i === currentSignIndex
                      ? "0 0 10px var(--color-glow-purple)"
                      : "none",
                }}
              >
                {letter === " " ? "·" : letter}
              </span>
            ))}
          </div>

          {/* Current Sign Image */}
          {currentLetter != null && currentSignIndex < signLetters.length && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img
                  src={getImagePath(currentLetter)}
                  alt={`ASL sign for ${currentLetter === " " ? "SPACE" : currentLetter}`}
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-lg)",
                    border: currentLetter === " "
                      ? "2px solid rgba(6, 182, 212, 0.3)"
                      : "2px solid rgba(124, 58, 237, 0.3)",
                    animation: "letter-pop 0.3s ease-out",
                  }}
                  key={currentSignIndex}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-0.5rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background:
                      currentLetter === " "
                        ? "linear-gradient(135deg, var(--color-accent-secondary), #0891b2)"
                        : "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                    color: "white",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: currentLetter === " " ? "0.65rem" : "1.25rem",
                    minWidth: "2.5rem",
                    height: "2.5rem",
                    padding: "0 0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--radius-full)",
                    boxShadow: "0 0 15px var(--color-glow-purple)",
                  }}
                >
                  {currentLetter === " " ? "SPACE" : currentLetter}
                </div>
              </div>
            </div>
          )}

          {/* Finished message */}
          {currentSignIndex >= signLetters.length && (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                color: "var(--color-accent-success)",
              }}
            >
              <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                &#10003; All signs shown!
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            <button
              className="btn-secondary"
              onClick={handlePrev}
              disabled={currentSignIndex <= 0}
              style={{ padding: "0.5rem" }}
            >
              <SkipForward
                size={16}
                style={{ transform: "rotate(180deg)" }}
              />
            </button>
            <button className="btn-primary" onClick={toggleAutoPlay}>
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isAutoPlaying ? "Pause" : "Play"}
            </button>
            <button
              className="btn-secondary"
              onClick={handleNext}
              disabled={currentSignIndex >= signLetters.length - 1}
              style={{ padding: "0.5rem" }}
            >
              <SkipForward size={16} />
            </button>
            <button className="btn-secondary" onClick={handleRestart}>
              <RotateCcw size={14} /> Restart
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-accent-danger)",
            marginTop: "0.5rem",
          }}
        >
          Error: {error}
        </p>
      )}

      {/* Clear */}
      {transcript && (
        <button
          className="btn-secondary"
          onClick={() => {
            clearTranscript();
            setShowingSigns(false);
            setSignLetters([]);
            setCurrentSignIndex(0);
          }}
          style={{ marginTop: "0.75rem" }}
        >
          <Trash2 size={14} /> Clear All
        </button>
      )}
    </div>
  );
}
