/**
 * ASL Translator — Main Application
 *
 * Real-time American Sign Language fingerspelling recognition
 * powered by MediaPipe, ONNX Runtime, and browser-native AI.
 *
 * 100% browser-side. No backend. $0 cost.
 */

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, BookOpen, BarChart3, Settings as SettingsIcon, GraduationCap } from "lucide-react";

import VideoFeed from "./components/VideoFeed";
import PredictionDisplay from "./components/PredictionDisplay";
import WordBuilder from "./components/WordBuilder";
import VoiceInput from "./components/VoiceInput";
import DictionaryMode from "./components/DictionaryMode";
import LearnMode from "./components/LearnMode";
import StatsPanel from "./components/StatsPanel";
import Settings from "./components/Settings";

import { useMediaPipe } from "./hooks/useMediaPipe";
import { useONNX } from "./hooks/useONNX";
import { usePredictionBuffer } from "./hooks/usePredictionBuffer";
import { incrementTotalSigns, updateLetterStats } from "./utils/storageHelpers";
import useStore from "./store";

const TABS = [
  { id: "translate", label: "Translate", icon: Hand },
  { id: "learn", label: "Learn", icon: GraduationCap },
  { id: "dictionary", label: "Dictionary", icon: BookOpen },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastPredictionRef = useRef(0);

  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const settings = useStore((s) => s.settings);

  // Determine if camera tabs are active
  const showCamera = activeTab === "translate" || activeTab === "learn";

  // Use refs for store actions to avoid dependency loops
  const storeRef = useRef(useStore.getState());
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      storeRef.current = state;
    });
    return unsub;
  }, []);

  // ── ML Pipeline ──
  const {
    isLoading: mpLoading,
    error: mpError,
    landmarks,
    fps,
    isDetecting,
  } = useMediaPipe(videoRef, canvasRef, showCamera);

  const { isLoading: onnxLoading, useHeuristic, predict } = useONNX();

  const { currentPrediction, confirmedLetter, addPrediction } =
    usePredictionBuffer({
      windowSize: settings.smoothingFrames,
      confirmThreshold: settings.confirmThreshold,
      minConfidence: settings.confidenceThreshold,
    });

  // Update model status
  useEffect(() => {
    const store = useStore.getState();
    if (mpLoading || onnxLoading) {
      store.setModelStatus("loading");
    } else if (mpError) {
      store.setModelStatus("error");
    } else {
      store.setModelStatus("ready", useHeuristic ? "heuristic" : "onnx");
    }
  }, [mpLoading, onnxLoading, mpError, useHeuristic]);

  // ── Run prediction when landmarks change (throttled) ──
  useEffect(() => {
    if (!landmarks || mpLoading || onnxLoading) return;

    const now = Date.now();
    if (now - lastPredictionRef.current < 100) return;
    lastPredictionRef.current = now;

    const result = predict(landmarks);
    if (result && result.letter) {
      useStore.getState().setPrediction(result.letter, result.confidence, false);
      addPrediction(result.letter, result.confidence);
    }
  }, [landmarks, mpLoading, onnxLoading, predict, addPrediction]);

  // ── Handle confirmed letter ──
  useEffect(() => {
    if (confirmedLetter) {
      const store = useStore.getState();
      store.addLetter(confirmedLetter);
      store.addToHistory(confirmedLetter);
      incrementTotalSigns();
      updateLetterStats(confirmedLetter, true);
      store.refreshStats();
    }
  }, [confirmedLetter]);

  return (
    <div className="app-container">
      {/* Header */}
      <motion.header
        className="app-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1>
          <span className="gradient-text">✋ ASL Translator</span>
        </h1>

        <nav className="tab-nav">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ position: "relative" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--color-bg-card)",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Icon size={14} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="app-main">
        {/*
          Camera is rendered ONCE and persisted across Translate/Learn tabs.
          This prevents camera re-init and MediaPipe losing the video stream.
          We hide it with CSS when not on a camera tab.
        */}
        <div style={{ display: showCamera ? "block" : "none" }}>
          <div className="translate-layout">
            <div className="translate-left">
              <VideoFeed
                videoRef={videoRef}
                canvasRef={canvasRef}
                fps={fps}
                isDetecting={isDetecting}
                isLoading={mpLoading || onnxLoading}
              />
              <PredictionDisplay currentPrediction={currentPrediction} />
            </div>
            <div className="translate-right">
              <AnimatePresence mode="wait">
                {activeTab === "translate" && (
                  <motion.div key="translate-panel" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <WordBuilder />
                      <VoiceInput />
                    </div>
                  </motion.div>
                )}
                {activeTab === "learn" && (
                  <motion.div key="learn-panel" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <LearnMode />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Non-camera tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "dictionary" && (
            <motion.div key="dictionary" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <DictionaryMode />
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div key="stats" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StatsPanel />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "0.75rem",
          fontSize: "0.65rem",
          color: "var(--color-text-dim)",
          borderTop: "1px solid rgba(255, 255, 255, 0.03)",
        }}
      >
        Built for FC Hackathon · 100% Browser-Side AI · $0 Cost
      </footer>
    </div>
  );
}
