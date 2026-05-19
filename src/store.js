/**
 * Zustand Store — Global State Management
 */

import { create } from "zustand";
import { getSettings, saveSettings, getStats, getLetterStats } from "./utils/storageHelpers";

const useStore = create((set, get) => ({
  // ── Active Tab ──
  activeTab: "translate",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Prediction State ──
  currentLetter: null,
  confidence: 0,
  isConfirmed: false,
  predictionHistory: [],

  setPrediction: (letter, confidence, isConfirmed = false) =>
    set({ currentLetter: letter, confidence, isConfirmed }),

  addToHistory: (letter) =>
    set((state) => ({
      predictionHistory: [...state.predictionHistory, letter].slice(-10),
    })),

  // ── Word Builder ──
  wordLetters: [],
  sentence: "",

  addLetter: (letter) =>
    set((state) => ({
      wordLetters: [...state.wordLetters, letter],
    })),

  removeLetter: () =>
    set((state) => ({
      wordLetters: state.wordLetters.slice(0, -1),
    })),

  addSpace: () =>
    set((state) => ({
      sentence: state.sentence + state.wordLetters.join("") + " ",
      wordLetters: [],
    })),

  commitWord: () =>
    set((state) => {
      const word = state.wordLetters.join("");
      if (!word) return state;
      return {
        sentence: state.sentence + word + " ",
        wordLetters: [],
      };
    }),

  clearWord: () => set({ wordLetters: [] }),
  clearSentence: () => set({ sentence: "", wordLetters: [] }),

  // ── Settings ──
  settings: getSettings(),
  updateSettings: (updates) =>
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  // ── Stats (loaded from localStorage) ──
  stats: getStats(),
  letterStats: getLetterStats(),

  refreshStats: () =>
    set({
      stats: getStats(),
      letterStats: getLetterStats(),
    }),

  // ── Camera ──
  cameraReady: false,
  setCameraReady: (ready) => set({ cameraReady: ready }),

  // ── Model ──
  modelStatus: "loading", // loading | ready | error
  modelType: "heuristic", // heuristic | onnx
  setModelStatus: (status, type) => set({ modelStatus: status, modelType: type || get().modelType }),
}));

export default useStore;
