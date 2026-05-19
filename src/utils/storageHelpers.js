/**
 * Storage Helpers — localStorage wrappers for user data persistence
 */

const KEYS = {
  SESSIONS: "asl_sessions",
  STATS: "asl_stats",
  SETTINGS: "asl_settings",
  LETTER_STATS: "asl_letter_stats",
};

// ── Generic helpers ──

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn("localStorage save failed:", e);
    return false;
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn("localStorage load failed:", e);
    return fallback;
  }
}

// ── Sessions ──

export function saveSession(signs, accuracy) {
  const sessions = loadFromStorage(KEYS.SESSIONS, []);
  sessions.push({
    signs,
    accuracy,
    timestamp: new Date().toISOString(),
    duration: signs.length * 2, // rough estimate in seconds
  });
  // Keep last 100 sessions
  if (sessions.length > 100) sessions.splice(0, sessions.length - 100);
  saveToStorage(KEYS.SESSIONS, sessions);
  updateStreak();
  return sessions.length;
}

export function getSessions() {
  return loadFromStorage(KEYS.SESSIONS, []);
}

// ── Letter Stats ──

export function updateLetterStats(letter, correct) {
  const stats = loadFromStorage(KEYS.LETTER_STATS, {});
  if (!stats[letter]) {
    stats[letter] = { attempts: 0, correct: 0 };
  }
  stats[letter].attempts += 1;
  if (correct) stats[letter].correct += 1;
  saveToStorage(KEYS.LETTER_STATS, stats);
  return stats[letter];
}

export function getLetterStats() {
  return loadFromStorage(KEYS.LETTER_STATS, {});
}

// ── Streak ──

export function updateStreak() {
  const stats = loadFromStorage(KEYS.STATS, {
    totalSigns: 0,
    streak: 0,
    lastDate: null,
    bestStreak: 0,
    totalPracticeTime: 0,
  });

  const today = new Date().toDateString();

  if (stats.lastDate === today) {
    // Already practiced today
    return stats;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (stats.lastDate === yesterday.toDateString()) {
    stats.streak += 1;
  } else if (stats.lastDate !== today) {
    stats.streak = 1;
  }

  if (stats.streak > stats.bestStreak) {
    stats.bestStreak = stats.streak;
  }

  stats.lastDate = today;
  saveToStorage(KEYS.STATS, stats);
  return stats;
}

export function getStats() {
  const stats = loadFromStorage(KEYS.STATS, {
    totalSigns: 0,
    streak: 0,
    lastDate: null,
    bestStreak: 0,
    totalPracticeTime: 0,
  });

  // Check if streak is still active
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (stats.lastDate !== today && stats.lastDate !== yesterday.toDateString()) {
    stats.streak = 0;
  }

  return stats;
}

export function incrementTotalSigns(count = 1) {
  const stats = loadFromStorage(KEYS.STATS, {
    totalSigns: 0,
    streak: 0,
    lastDate: null,
    bestStreak: 0,
    totalPracticeTime: 0,
  });
  stats.totalSigns += count;
  saveToStorage(KEYS.STATS, stats);
  return stats.totalSigns;
}

// ── Settings ──

const DEFAULT_SETTINGS = {
  confidenceThreshold: 0.6,
  smoothingFrames: 15,
  confirmThreshold: 8,
  darkMode: true,
  ttsRate: 1,
  ttsPitch: 1,
  ttsVoice: null,
  cameraId: null,
  showSkeleton: true,
  showFps: true,
};

export function getSettings() {
  return loadFromStorage(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
  saveToStorage(KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...settings });
}

export function resetAllData() {
  localStorage.removeItem(KEYS.SESSIONS);
  localStorage.removeItem(KEYS.STATS);
  localStorage.removeItem(KEYS.LETTER_STATS);
}
