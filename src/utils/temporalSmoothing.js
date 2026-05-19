/**
 * Temporal Smoothing — Prediction Buffer
 *
 * Sliding window + majority voting to eliminate flicker
 * in real-time ASL letter predictions.
 */

export class PredictionBuffer {
  constructor(windowSize = 15, confirmThreshold = 8, minConfidence = 0.6) {
    this.windowSize = windowSize;
    this.confirmThreshold = confirmThreshold;
    this.minConfidence = minConfidence;
    this.buffer = [];
    this.lastConfirmed = null;
    this.lastConfirmedTime = 0;
    this.cooldownMs = 600;
  }

  addPrediction(letter, confidence) {
    this.buffer.push({ letter, confidence, timestamp: Date.now() });
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }
  }

  getStablePrediction() {
    if (this.buffer.length < 3) return null;

    // Count weighted votes
    const votes = {};
    for (const entry of this.buffer) {
      if (entry.confidence < this.minConfidence) continue;
      if (!votes[entry.letter]) {
        votes[entry.letter] = { count: 0, totalConfidence: 0 };
      }
      votes[entry.letter].count += 1;
      votes[entry.letter].totalConfidence += entry.confidence;
    }

    // Find winner
    let winner = null;
    let maxScore = 0;
    for (const [letter, data] of Object.entries(votes)) {
      const score = data.count * (data.totalConfidence / data.count);
      if (score > maxScore) {
        maxScore = score;
        winner = letter;
      }
    }

    if (!winner) return null;

    const winnerData = votes[winner];
    const avgConfidence = winnerData.totalConfidence / winnerData.count;

    return {
      letter: winner,
      confidence: avgConfidence,
      count: winnerData.count,
      isStable: winnerData.count >= this.confirmThreshold,
      progress: Math.min(winnerData.count / this.confirmThreshold, 1),
    };
  }

  confirmLetter() {
    const prediction = this.getStablePrediction();
    if (!prediction || !prediction.isStable) return null;

    const now = Date.now();
    // Cooldown: don't confirm the same letter too quickly
    if (
      prediction.letter === this.lastConfirmed &&
      now - this.lastConfirmedTime < this.cooldownMs
    ) {
      return null;
    }

    this.lastConfirmed = prediction.letter;
    this.lastConfirmedTime = now;
    this.buffer = [];
    return prediction.letter;
  }

  reset() {
    this.buffer = [];
    this.lastConfirmed = null;
    this.lastConfirmedTime = 0;
  }

  setWindowSize(size) {
    this.windowSize = size;
  }

  setConfirmThreshold(threshold) {
    this.confirmThreshold = threshold;
  }

  setMinConfidence(confidence) {
    this.minConfidence = confidence;
  }
}
