/**
 * useGrammarCheck — LanguageTool Public API Hook
 *
 * Calls https://api.languagetool.org/v2/check for free grammar checking.
 * 20 req/min, no API key, no backend needed.
 */

import { useState, useCallback } from "react";

export function useGrammarCheck() {
  const [corrections, setCorrections] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkGrammar = useCallback(async (text) => {
    if (!text || text.trim().length < 3) {
      setCorrections([]);
      return [];
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text,
          language: "en-US",
        }),
      });

      if (!response.ok) {
        throw new Error(`LanguageTool API error: ${response.status}`);
      }

      const data = await response.json();

      const results = (data.matches || []).map((match) => ({
        offset: match.offset,
        length: match.length,
        original: text.substring(match.offset, match.offset + match.length),
        message: match.message,
        suggestions: (match.replacements || []).slice(0, 3).map((r) => r.value),
        type: match.rule?.issueType || "grammar",
      }));

      setCorrections(results);
      return results;
    } catch (err) {
      console.error("Grammar check error:", err);
      setError(err.message);
      setCorrections([]);
      return [];
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clearCorrections = useCallback(() => {
    setCorrections([]);
    setError(null);
  }, []);

  return {
    corrections,
    isChecking,
    error,
    checkGrammar,
    clearCorrections,
  };
}
