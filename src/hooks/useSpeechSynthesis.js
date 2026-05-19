/**
 * useSpeechSynthesis — Browser Native Text-to-Speech Hook
 *
 * Uses the Web Speech API (SpeechSynthesis) for free TTS.
 * No API keys, no backend, no cost. Works offline.
 */

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    function loadVoices() {
      const available = speechSynthesis.getVoices();
      // Filter to English voices for better UX
      const englishVoices = available.filter((v) =>
        v.lang.startsWith("en")
      );
      setVoices(englishVoices.length > 0 ? englishVoices : available);
    }

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text, options = {}) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || "en-US";
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      if (options.voice) {
        const selectedVoice = voices.find((v) => v.name === options.voice);
        if (selectedVoice) utterance.voice = selectedVoice;
      } else {
        // Pick a nice default English voice
        const preferred = voices.find(
          (v) => v.lang === "en-US" && v.name.includes("Google")
        );
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    voices,
    isSupported,
  };
}
