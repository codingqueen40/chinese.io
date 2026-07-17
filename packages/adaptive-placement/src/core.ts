// ─────────────────────────────────────────────────────────────
// adaptive-placement — a "staircase" adaptive placement engine.
//
// Responsibility: decide which tier to ask next, when to stop, and which
// level to infer from the answers. Nothing else. The module is PURE — no
// I/O, no framework, no persistence — and immutable: every transition
// returns a fresh state object. That's what makes it trivially testable.
//
// The engine works entirely in tier numbers (1..N); map tiers to your own
// level labels with a LevelScale (see scale.ts).
// ─────────────────────────────────────────────────────────────

import { DEFAULT_PLACEMENT_CONFIG, type PlacementConfig } from "./config";

/** One answer: the tier of the presented item + whether it was correct. */
export type PlacementAnswer = {
  tier: number;
  wasCorrect: boolean;
};

/** The test state. Immutable — each transition returns a new object. */
export type PlacementState = {
  /** Lowest available tier (low bound of the item pool). */
  minTier: number;
  /** Highest available tier (high bound of the item pool). */
  maxTier: number;
  /** Tier the NEXT item should be drawn from. */
  currentTier: number;
  /** Ordered history of answers. */
  answers: PlacementAnswer[];
};

/**
 * Initial state. Starts in the MIDDLE of the loaded range so it favours
 * neither a beginner nor an advanced taker.
 */
export function createInitialState(
  minTier: number,
  maxTier: number,
): PlacementState {
  const currentTier = clamp(
    Math.round((minTier + maxTier) / 2),
    minTier,
    maxTier,
  );
  return { minTier, maxTier, currentTier, answers: [] };
}

/**
 * "Staircase" transition: record the answer at the current tier, then step
 * up one rung if correct, down one if wrong — clamped to [minTier, maxTier].
 */
export function nextLevel(
  state: PlacementState,
  wasCorrect: boolean,
): PlacementState {
  const answers = [...state.answers, { tier: state.currentTier, wasCorrect }];
  const currentTier = clamp(
    state.currentTier + (wasCorrect ? 1 : -1),
    state.minTier,
    state.maxTier,
  );
  return { ...state, currentTier, answers };
}

/**
 * The test is over when the hard item cap is hit, OR once enough items have
 * been answered AND the staircase has stabilised (oscillating around the
 * competence boundary).
 */
export function isFinished(
  state: PlacementState,
  config: PlacementConfig = DEFAULT_PLACEMENT_CONFIG,
): boolean {
  const n = state.answers.length;
  if (n >= config.maxItems) return true;
  return n >= config.minItems && isStable(state.answers, config.stableWindow);
}

/**
 * Detected level = the HIGHEST "passed" tier (success rate ≥ threshold over a
 * large enough sample). Failing that, the floor is the lowest tier seen (a
 * taker who fails everywhere is placed at the bottom). Returns a TIER NUMBER —
 * convert it with your LevelScale's `tierToLevel`.
 */
export function computeDetectedLevel(
  answers: PlacementAnswer[],
  config: PlacementConfig = DEFAULT_PLACEMENT_CONFIG,
): number {
  if (answers.length === 0) {
    throw new Error("computeDetectedLevel: no answers to evaluate");
  }
  // Tiers seen, highest to lowest: keep the first one that passes.
  const tiers = [...new Set(answers.map((a) => a.tier))].sort((a, b) => b - a);
  for (const tier of tiers) {
    const seen = answers.filter((a) => a.tier === tier);
    if (seen.length < config.minItemsPerTier) continue;
    const rate = seen.filter((a) => a.wasCorrect).length / seen.length;
    if (rate >= config.passThreshold) return tier;
  }
  return Math.min(...answers.map((a) => a.tier));
}

/**
 * Convenience driver: run a full session against an oracle that answers each
 * presented tier. Returns the final state — feed `computeDetectedLevel` to it.
 */
export function simulatePlacement(
  answer: (tier: number) => boolean,
  options: {
    minTier: number;
    maxTier: number;
    config?: PlacementConfig;
  },
): PlacementState {
  const config = options.config ?? DEFAULT_PLACEMENT_CONFIG;
  let state = createInitialState(options.minTier, options.maxTier);
  while (!isFinished(state, config)) {
    state = nextLevel(state, answer(state.currentTier));
    // Safety net: the engine must stop before the cap plus a margin.
    if (state.answers.length > config.maxItems) break;
  }
  return state;
}

// ── internal helpers ─────────────────────────────────────────

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

/**
 * Stable if, over the trailing window, the visited tiers sit on a single tier
 * or two ADJACENT tiers — the signature of a converged staircase oscillating
 * around the right level.
 */
function isStable(answers: PlacementAnswer[], windowSize: number): boolean {
  const window = answers.slice(-windowSize).map((a) => a.tier);
  if (window.length < windowSize) return false;
  const distinct = [...new Set(window)].sort((a, b) => a - b);
  if (distinct.length === 1) return true;
  return distinct.length === 2 && distinct[1]! - distinct[0]! === 1;
}
