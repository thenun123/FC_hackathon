/**
 * Rule-Based ASL Landmark Classifier
 *
 * Classifies MediaPipe hand landmarks into ASL alphabet letters (A-Y).
 * J and Z require motion and are not supported in static classification.
 *
 * Uses finger extension/curl analysis and relative landmark positions.
 * This is a fallback when no ONNX model is available.
 */

// MediaPipe landmark indices
const WRIST = 0;
const THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8;
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_DIP = 11, MIDDLE_TIP = 12;
const RING_MCP = 13, RING_PIP = 14, RING_DIP = 15, RING_TIP = 16;
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_DIP = 19, PINKY_TIP = 20;

/**
 * Check if a finger is extended (straight) by comparing tip position to PIP joint
 */
function isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];

  // Finger is extended if tip is farther from wrist than PIP
  // Use y-coordinate (lower y = higher in image for MediaPipe)
  const tipDist = Math.sqrt(
    (tip.x - landmarks[WRIST].x) ** 2 + (tip.y - landmarks[WRIST].y) ** 2
  );
  const pipDist = Math.sqrt(
    (pip.x - landmarks[WRIST].x) ** 2 + (pip.y - landmarks[WRIST].y) ** 2
  );

  // Also check if tip is above PIP (for vertical orientation)
  const tipAbovePip = tip.y < pip.y;
  const tipFarther = tipDist > pipDist * 0.9;

  return tipAbovePip || tipFarther;
}

/**
 * Check if thumb is extended
 */
function isThumbExtended(landmarks) {
  const tip = landmarks[THUMB_TIP];
  const ip = landmarks[THUMB_IP];
  const mcp = landmarks[THUMB_MCP];

  // Thumb extended if tip is far from palm center
  const palmCenter = {
    x: (landmarks[INDEX_MCP].x + landmarks[PINKY_MCP].x) / 2,
    y: (landmarks[INDEX_MCP].y + landmarks[PINKY_MCP].y) / 2,
  };

  const tipDist = Math.sqrt(
    (tip.x - palmCenter.x) ** 2 + (tip.y - palmCenter.y) ** 2
  );

  return tipDist > 0.1;
}

/**
 * Get finger curl amount (0 = fully extended, 1 = fully curled)
 */
function getFingerCurl(landmarks, tipIdx, dipIdx, pipIdx, mcpIdx) {
  const tip = landmarks[tipIdx];
  const mcp = landmarks[mcpIdx];

  const dist = Math.sqrt((tip.x - mcp.x) ** 2 + (tip.y - mcp.y) ** 2);
  // Normalize: extended fingers have dist ~0.15-0.25, curled ~0.02-0.08
  const curl = 1 - Math.min(dist / 0.2, 1);
  return Math.max(0, Math.min(1, curl));
}

/**
 * Get finger states for all 5 fingers
 */
function getFingerStates(landmarks) {
  return {
    thumb: isThumbExtended(landmarks),
    index: isFingerExtended(landmarks, INDEX_TIP, INDEX_PIP, INDEX_MCP),
    middle: isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP),
    ring: isFingerExtended(landmarks, RING_TIP, RING_PIP, RING_MCP),
    pinky: isFingerExtended(landmarks, PINKY_TIP, PINKY_PIP, PINKY_MCP),
    thumbCurl: getFingerCurl(landmarks, THUMB_TIP, THUMB_IP, THUMB_MCP, THUMB_CMC),
    indexCurl: getFingerCurl(landmarks, INDEX_TIP, INDEX_DIP, INDEX_PIP, INDEX_MCP),
    middleCurl: getFingerCurl(landmarks, MIDDLE_TIP, MIDDLE_DIP, MIDDLE_PIP, MIDDLE_MCP),
    ringCurl: getFingerCurl(landmarks, RING_TIP, RING_DIP, RING_PIP, RING_MCP),
    pinkyCurl: getFingerCurl(landmarks, PINKY_TIP, PINKY_DIP, PINKY_PIP, PINKY_MCP),
  };
}

/**
 * Count extended fingers
 */
function countExtended(states) {
  return [states.thumb, states.index, states.middle, states.ring, states.pinky]
    .filter(Boolean).length;
}

/**
 * Check if two fingertips are touching
 */
function areTouching(landmarks, idx1, idx2, threshold = 0.05) {
  const p1 = landmarks[idx1];
  const p2 = landmarks[idx2];
  const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  return dist < threshold;
}

/**
 * Classify hand landmarks into an ASL letter
 * @param {Array} landmarks - 21 MediaPipe hand landmarks [{x, y, z}, ...]
 * @returns {{ letter: string, confidence: number }}
 */
export function classifyLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { letter: null, confidence: 0 };
  }

  const states = getFingerStates(landmarks);
  const extended = countExtended(states);

  // Start matching rules — ordered by distinctiveness
  const candidates = [];

  // ── 5 fingers extended ──
  if (extended >= 4 && states.index && states.middle && states.ring && states.pinky) {
    if (states.thumb) {
      // B or 5
      // B: fingers together, thumb across palm
      // 5: fingers spread, thumb out
      const fingerSpread = Math.abs(landmarks[INDEX_TIP].x - landmarks[PINKY_TIP].x);
      if (fingerSpread > 0.12) {
        candidates.push({ letter: "B", confidence: 0.65 });
      } else {
        candidates.push({ letter: "B", confidence: 0.75 });
      }
    } else {
      candidates.push({ letter: "B", confidence: 0.7 });
    }
  }

  // ── W: Index + Middle + Ring extended ──
  if (states.index && states.middle && states.ring && !states.pinky && !states.thumb) {
    candidates.push({ letter: "W", confidence: 0.8 });
  }

  // ── V/U: Index + Middle extended ──
  if (states.index && states.middle && !states.ring && !states.pinky) {
    const spread = Math.abs(landmarks[INDEX_TIP].x - landmarks[MIDDLE_TIP].x);
    if (spread > 0.06) {
      candidates.push({ letter: "V", confidence: 0.8 });
    } else {
      candidates.push({ letter: "U", confidence: 0.75 });
    }
  }

  // ── R: Index + Middle crossed ──
  if (states.index && states.middle && !states.ring && !states.pinky) {
    // Check if index and middle cross
    if (landmarks[INDEX_TIP].x > landmarks[MIDDLE_TIP].x + 0.02) {
      candidates.push({ letter: "R", confidence: 0.7 });
    }
  }

  // ── L: Index + Thumb at right angle ──
  if (states.index && states.thumb && !states.middle && !states.ring && !states.pinky) {
    const angle = Math.abs(landmarks[THUMB_TIP].x - landmarks[INDEX_TIP].x);
    if (angle > 0.08) {
      candidates.push({ letter: "L", confidence: 0.8 });
    }
  }

  // ── D: Index up, others curled touching thumb ──
  if (states.index && !states.middle && !states.ring && !states.pinky) {
    if (areTouching(landmarks, THUMB_TIP, MIDDLE_TIP, 0.06)) {
      candidates.push({ letter: "D", confidence: 0.75 });
    } else {
      candidates.push({ letter: "D", confidence: 0.6 });
    }
  }

  // ── I: Pinky only ──
  if (states.pinky && !states.index && !states.middle && !states.ring) {
    candidates.push({ letter: "I", confidence: 0.8 });
  }

  // ── Y: Thumb + Pinky extended ──
  if (states.thumb && states.pinky && !states.index && !states.middle && !states.ring) {
    candidates.push({ letter: "Y", confidence: 0.85 });
  }

  // ── C: Curved hand shape ──
  if (extended <= 1 && !states.index && !states.pinky) {
    const thumbTipX = landmarks[THUMB_TIP].x;
    const indexTipX = landmarks[INDEX_TIP].x;
    const gap = Math.abs(thumbTipX - indexTipX);
    if (gap > 0.05 && gap < 0.15) {
      candidates.push({ letter: "C", confidence: 0.6 });
    }
  }

  // ── O: Fingers form a circle ──
  if (areTouching(landmarks, THUMB_TIP, INDEX_TIP, 0.04) && !states.middle && !states.ring) {
    candidates.push({ letter: "O", confidence: 0.7 });
  }

  // ── F: OK sign — Thumb + Index touching, others extended ──
  if (areTouching(landmarks, THUMB_TIP, INDEX_TIP, 0.04) && states.middle && states.ring && states.pinky) {
    candidates.push({ letter: "F", confidence: 0.8 });
  }

  // ── A: Fist with thumb to side ──
  if (extended === 0 || (extended === 1 && states.thumb)) {
    if (!states.index && !states.middle && !states.ring && !states.pinky) {
      if (states.thumb) {
        candidates.push({ letter: "A", confidence: 0.7 });
      } else {
        // Could be S, E, M, N, T
        candidates.push({ letter: "S", confidence: 0.55 });
        candidates.push({ letter: "E", confidence: 0.5 });
      }
    }
  }

  // ── G: Index pointing sideways ──
  if (states.index && !states.middle && !states.ring && !states.pinky) {
    const indexHorizontal = Math.abs(landmarks[INDEX_TIP].y - landmarks[INDEX_MCP].y) < 0.06;
    if (indexHorizontal) {
      candidates.push({ letter: "G", confidence: 0.7 });
    }
  }

  // ── H: Index + Middle pointing sideways ──
  if (states.index && states.middle && !states.ring && !states.pinky) {
    const indexH = Math.abs(landmarks[INDEX_TIP].y - landmarks[INDEX_MCP].y) < 0.06;
    const middleH = Math.abs(landmarks[MIDDLE_TIP].y - landmarks[MIDDLE_MCP].y) < 0.06;
    if (indexH && middleH) {
      candidates.push({ letter: "H", confidence: 0.75 });
    }
  }

  // ── K: Index + Middle up, thumb between them ──
  if (states.index && states.middle && !states.ring && !states.pinky && states.thumb) {
    candidates.push({ letter: "K", confidence: 0.6 });
  }

  // ── P: Like K but pointing down ──
  if (states.index && states.middle && !states.ring && !states.pinky) {
    if (landmarks[INDEX_TIP].y > landmarks[INDEX_MCP].y) {
      candidates.push({ letter: "P", confidence: 0.6 });
    }
  }

  // ── Q: Like G but pointing down ──
  if (states.index && !states.middle && !states.ring && !states.pinky) {
    if (landmarks[INDEX_TIP].y > landmarks[WRIST].y) {
      candidates.push({ letter: "Q", confidence: 0.6 });
    }
  }

  // ── X: Index bent/hooked ──
  if (!states.index && !states.middle && !states.ring && !states.pinky) {
    const indexPartial = landmarks[INDEX_TIP].y < landmarks[INDEX_PIP].y &&
                         landmarks[INDEX_TIP].y > landmarks[INDEX_MCP].y - 0.05;
    if (indexPartial) {
      candidates.push({ letter: "X", confidence: 0.55 });
    }
  }

  // Sort by confidence and return best match
  candidates.sort((a, b) => b.confidence - a.confidence);

  if (candidates.length > 0) {
    return candidates[0];
  }

  return { letter: null, confidence: 0 };
}

/**
 * Get the full ASL alphabet (for dictionary mode)
 */
export const ASL_ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");
// Note: J and Z require motion — excluded from static classification

/**
 * Get description of how to sign a letter
 */
export const ASL_DESCRIPTIONS = {
  A: "Make a fist with thumb resting on the side of the index finger.",
  B: "Hold all four fingers straight up and together, with thumb tucked across palm.",
  C: "Curve all fingers and thumb into a C shape, like holding a cup.",
  D: "Point index finger up, touch thumb to middle finger, curl others.",
  E: "Curl all fingers down, thumb tucked under fingertips.",
  F: "Touch index finger and thumb together in a circle, extend other 3 fingers.",
  G: "Point index finger sideways, thumb parallel, close other fingers.",
  H: "Point index and middle finger sideways together, close others.",
  I: "Extend pinky finger up, close all other fingers into fist.",
  K: "Point index and middle finger up in a V, thumb between them.",
  L: "Extend index finger and thumb to form an L shape, close others.",
  M: "Place thumb under first three fingers (index, middle, ring).",
  N: "Place thumb under first two fingers (index, middle).",
  O: "Curve all fingers and thumb to touch, forming an O shape.",
  P: "Like K but point hand downward.",
  Q: "Like G but point hand downward.",
  R: "Cross index and middle finger, close others.",
  S: "Make a fist with thumb over curled fingers.",
  T: "Place thumb between index and middle finger in a fist.",
  U: "Extend index and middle finger together pointing up, close others.",
  V: "Extend index and middle finger spread apart in a V, close others.",
  W: "Extend index, middle, and ring finger spread apart, close others.",
  X: "Hook index finger (partially bent), close all other fingers.",
  Y: "Extend thumb and pinky, close other three fingers.",
};
