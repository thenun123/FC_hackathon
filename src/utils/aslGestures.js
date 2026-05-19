/**
 * ASL Gesture Definitions for Fingerpose
 *
 * All 26 ASL static alphabet letters defined using
 * fingerpose's curl + direction system.
 */

import fp from "fingerpose";

const { GestureDescription, Finger, FingerCurl, FingerDirection } = fp;

// Helper to create gesture quickly
function defineGesture(name, config) {
  const gesture = new GestureDescription(name);

  for (const [finger, rules] of Object.entries(config)) {
    const fingerEnum = Finger[finger];
    if (rules.curl) {
      for (const [curl, weight] of rules.curl) {
        gesture.addCurl(fingerEnum, FingerCurl[curl], weight);
      }
    }
    if (rules.direction) {
      for (const [dir, weight] of rules.direction) {
        gesture.addDirection(fingerEnum, FingerDirection[dir], weight);
      }
    }
  }

  return gesture;
}

// ═══════════════════════════════════════════
// ASL ALPHABET GESTURE DEFINITIONS
// ═══════════════════════════════════════════

// A: Fist with thumb to the side
const A = defineGesture("A", {
  Thumb: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Index: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5]],
  },
  Middle: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Ring: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
});

// B: All four fingers extended, thumb across palm
const B = defineGesture("B", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.7]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Ring: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Pinky: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
});

// C: Curved hand, like holding a cup
const C = defineGesture("C", {
  Thumb: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.7]],
    direction: [["DiagonalUpLeft", 1.0], ["DiagonalUpRight", 1.0], ["HorizontalLeft", 0.5], ["HorizontalRight", 0.5]],
  },
  Index: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Middle: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Ring: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Pinky: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
});

// D: Index pointing up, others curled with thumb touching middle
const D = defineGesture("D", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.7]],
  },
  Ring: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.7]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.7]],
  },
});

// E: All fingers curled, thumb tucked
const E = defineGesture("E", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["FullCurl", 1.0]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// F: Thumb + Index touching (OK), others extended
const F = defineGesture("F", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Index: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.8]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Ring: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Pinky: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
});

// G: Index pointing sideways, thumb parallel
const G = defineGesture("G", {
  Thumb: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["HorizontalLeft", 1.0], ["HorizontalRight", 1.0]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["HorizontalLeft", 1.0], ["HorizontalRight", 1.0]],
  },
  Middle: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Ring: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
});

// H: Index + Middle pointing sideways
const H = defineGesture("H", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.5]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["HorizontalLeft", 1.0], ["HorizontalRight", 1.0]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["HorizontalLeft", 1.0], ["HorizontalRight", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
});

// I: Pinky extended only
const I = defineGesture("I", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["FullCurl", 1.0]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
});

// K: Index + Middle up (V shape), thumb between
const K = defineGesture("K", {
  Thumb: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// L: L shape — index up, thumb out
const L = defineGesture("L", {
  Thumb: {
    curl: [["NoCurl", 1.0]],
    direction: [["HorizontalLeft", 1.0], ["HorizontalRight", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// M: Thumb under first three fingers
const M = defineGesture("M", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Middle: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Ring: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
});

// N: Thumb under first two fingers
const N = defineGesture("N", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.7]],
  },
  Middle: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.7]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// O: All fingers curved to touch thumb
const O = defineGesture("O", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Index: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.7]],
  },
  Middle: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.7]],
  },
  Ring: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.7]],
  },
  Pinky: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.7]],
  },
});

// P: Like K but pointing down
const P = defineGesture("P", {
  Thumb: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["VerticalDown", 0.5], ["DiagonalDownLeft", 1.0], ["DiagonalDownRight", 1.0]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalDown", 1.0], ["DiagonalDownLeft", 0.8], ["DiagonalDownRight", 0.8]],
  },
  Middle: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["VerticalDown", 1.0], ["DiagonalDownLeft", 0.8], ["DiagonalDownRight", 0.8]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// Q: Like G but pointing down
const Q = defineGesture("Q", {
  Thumb: {
    curl: [["NoCurl", 1.0], ["HalfCurl", 0.5]],
    direction: [["VerticalDown", 1.0], ["DiagonalDownLeft", 0.8], ["DiagonalDownRight", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalDown", 1.0], ["DiagonalDownLeft", 0.8], ["DiagonalDownRight", 0.8]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// R: Index + Middle crossed
const R = defineGesture("R", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// S: Fist with thumb over curled fingers
const S = defineGesture("S", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["NoCurl", 0.5]],
  },
  Index: {
    curl: [["FullCurl", 1.0]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// T: Thumb between index and middle in a fist
const T = defineGesture("T", {
  Thumb: {
    curl: [["HalfCurl", 1.0]],
  },
  Index: {
    curl: [["FullCurl", 1.0], ["HalfCurl", 0.5]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// U: Index + Middle together pointing up
const U = defineGesture("U", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// V: Index + Middle spread apart
const V = defineGesture("V", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 1.0], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpRight", 1.0], ["DiagonalUpLeft", 0.5]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// W: Index + Middle + Ring extended spread
const W = defineGesture("W", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.8]],
  },
  Index: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.8], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0]],
  },
  Ring: {
    curl: [["NoCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpRight", 0.8], ["DiagonalUpLeft", 0.5]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// X: Index hooked/bent
const X = defineGesture("X", {
  Thumb: {
    curl: [["HalfCurl", 1.0], ["FullCurl", 0.5]],
  },
  Index: {
    curl: [["HalfCurl", 1.0]],
    direction: [["VerticalUp", 1.0], ["DiagonalUpLeft", 0.5], ["DiagonalUpRight", 0.5]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["FullCurl", 1.0]],
  },
});

// Y: Thumb + Pinky extended (shaka)
const Y = defineGesture("Y", {
  Thumb: {
    curl: [["NoCurl", 1.0]],
    direction: [["DiagonalUpLeft", 1.0], ["DiagonalUpRight", 1.0], ["HorizontalLeft", 0.8], ["HorizontalRight", 0.8]],
  },
  Index: {
    curl: [["FullCurl", 1.0]],
  },
  Middle: {
    curl: [["FullCurl", 1.0]],
  },
  Ring: {
    curl: [["FullCurl", 1.0]],
  },
  Pinky: {
    curl: [["NoCurl", 1.0]],
    direction: [["DiagonalUpLeft", 1.0], ["DiagonalUpRight", 1.0], ["VerticalUp", 0.5]],
  },
});

export const ASL_GESTURES = [
  A, B, C, D, E, F, G, H, I,
  K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y,
];

export default ASL_GESTURES;
