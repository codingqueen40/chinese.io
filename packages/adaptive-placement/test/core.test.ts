import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLACEMENT_CONFIG as CFG,
  type PlacementAnswer,
  type PlacementState,
  computeDetectedLevel,
  createInitialState,
  createLevelScale,
  isFinished,
  nextLevel,
  simulatePlacement,
} from "../src/index";

// The engine is pure → the tests are pure. We target the invariants of the
// "staircase" algorithm, not magic numbers: expectations are derived from the
// config where relevant, so they survive a future tuning of the thresholds.

// Build a list of answers at the same tier (readability helper).
function answersAt(tier: number, results: boolean[]): PlacementAnswer[] {
  return results.map((wasCorrect) => ({ tier, wasCorrect }));
}

describe("createLevelScale (generic tier ↔ label mapping)", () => {
  // Any comparable labels work — here a 7-band language scale.
  const scale = createLevelScale([
    "novice",
    "beginner",
    "elementary",
    "intermediate",
    "upper",
    "advanced",
    "mastery",
  ]);

  it("maps each label to a tier 1..N in order", () => {
    expect(scale.levelToTier("novice")).toBe(1);
    expect(scale.levelToTier("beginner")).toBe(2);
    expect(scale.levelToTier("elementary")).toBe(3);
    expect(scale.levelToTier("mastery")).toBe(scale.count);
  });

  it("round-trips tier ↔ label consistently", () => {
    for (let tier = 1; tier <= scale.count; tier++) {
      const level = scale.tierToLevel(tier);
      expect(level).not.toBeNull();
      expect(scale.levelToTier(level!)).toBe(tier);
    }
  });

  it("returns null (label) / -1 (tier) out of range", () => {
    expect(scale.tierToLevel(0)).toBeNull();
    expect(scale.tierToLevel(scale.count + 1)).toBeNull();
    expect(scale.levelToTier("unknown")).toBe(-1);
  });

  it("supports merging real levels into one tier (numeric labels too)", () => {
    // e.g. three top grades collapsed into a single highest tier "7-9".
    const banded = createLevelScale([1, 2, 3, 4, 5, 6, "7-9"]);
    expect(banded.levelToTier("7-9")).toBe(7);
    expect(banded.tierToLevel(7)).toBe("7-9");
  });
});

describe("createInitialState", () => {
  it("starts in the MIDDLE of the range (neither low nor high)", () => {
    expect(createInitialState(1, 3).currentTier).toBe(2);
    expect(createInitialState(1, 4).currentTier).toBe(3); // round(2.5) = 3
    expect(createInitialState(2, 5).currentTier).toBe(4); // round(3.5) = 4
  });

  it("keeps the given bounds and starts with no answers", () => {
    const s = createInitialState(1, 3);
    expect(s).toMatchObject({ minTier: 1, maxTier: 3, answers: [] });
  });

  it("handles a single-tier range", () => {
    expect(createInitialState(2, 2).currentTier).toBe(2);
  });
});

describe("nextLevel", () => {
  it("records the CURRENT tier in the answer (not the next one)", () => {
    // Core invariant: the answer is attributed to the tier that was asked,
    // never to the one we move toward. The whole UI depends on this.
    const s = createInitialState(1, 3); // currentTier = 2
    const after = nextLevel(s, true);
    expect(after.answers).toEqual([{ tier: 2, wasCorrect: true }]);
    expect(after.currentTier).toBe(3); // move happens AFTER
  });

  it("steps up one rung if correct, down one if wrong", () => {
    const base: PlacementState = {
      minTier: 1,
      maxTier: 5,
      currentTier: 3,
      answers: [],
    };
    expect(nextLevel(base, true).currentTier).toBe(4);
    expect(nextLevel(base, false).currentTier).toBe(2);
  });

  it("clamps at the top: a pass at maxTier does not overshoot", () => {
    const top: PlacementState = {
      minTier: 1,
      maxTier: 3,
      currentTier: 3,
      answers: [],
    };
    expect(nextLevel(top, true).currentTier).toBe(3);
  });

  it("clamps at the bottom: a fail at minTier does not go lower", () => {
    const bottom: PlacementState = {
      minTier: 1,
      maxTier: 3,
      currentTier: 1,
      answers: [],
    };
    expect(nextLevel(bottom, false).currentTier).toBe(1);
  });

  it("is immutable: it does not mutate the input state", () => {
    const s = createInitialState(1, 3);
    nextLevel(s, true);
    expect(s.answers).toEqual([]);
    expect(s.currentTier).toBe(2);
  });
});

describe("isFinished", () => {
  it("does not stop below minItems, even when stable", () => {
    const answers = answersAt(2, Array(CFG.minItems - 1).fill(true));
    expect(
      isFinished({ minTier: 1, maxTier: 3, currentTier: 2, answers }),
    ).toBe(false);
  });

  it("stops at minItems when the staircase is stable (single tier)", () => {
    const answers = answersAt(2, Array(CFG.minItems).fill(true));
    expect(
      isFinished({ minTier: 1, maxTier: 3, currentTier: 2, answers }),
    ).toBe(true);
  });

  // Keep the total strictly between minItems and maxItems so we isolate the
  // "stabilisation" branch from the "hard cap" branch. Only the final window
  // (the last few) decides stability; the head just clears minItems.
  const headBelowCap = answersAt(2, Array(CFG.minItems - 2).fill(true));

  it("treats oscillation over two ADJACENT tiers as stable", () => {
    const tail: PlacementAnswer[] = [
      { tier: 2, wasCorrect: true },
      { tier: 3, wasCorrect: false },
      { tier: 2, wasCorrect: true },
      { tier: 3, wasCorrect: false },
    ];
    const answers = [...headBelowCap, ...tail]; // window = {2,3}, adjacent
    expect(
      isFinished({ minTier: 1, maxTier: 3, currentTier: 2, answers }),
    ).toBe(true);
  });

  it("does NOT stop if the final window jumps non-adjacent tiers", () => {
    const tail: PlacementAnswer[] = [
      { tier: 1, wasCorrect: true },
      { tier: 3, wasCorrect: false },
      { tier: 1, wasCorrect: true },
      { tier: 3, wasCorrect: false },
    ];
    const answers = [...headBelowCap, ...tail]; // window = {1,3}, gap 2 → unstable
    expect(
      isFinished({ minTier: 1, maxTier: 3, currentTier: 2, answers }),
    ).toBe(false);
  });

  it("hard-stops at maxItems even when unstable", () => {
    const answers: PlacementAnswer[] = Array.from(
      { length: CFG.maxItems },
      (_, i) => ({ tier: i % 2 === 0 ? 1 : 3, wasCorrect: false }),
    );
    expect(
      isFinished({ minTier: 1, maxTier: 3, currentTier: 1, answers }),
    ).toBe(true);
  });
});

describe("computeDetectedLevel", () => {
  it("throws with no answers (contract: the caller owns the empty case)", () => {
    expect(() => computeDetectedLevel([])).toThrow();
  });

  it("keeps the HIGHEST passed tier (rate ≥ threshold, large enough sample)", () => {
    const answers = [
      ...answersAt(2, [true, true]),
      ...answersAt(3, [true, true, true]),
    ];
    expect(computeDetectedLevel(answers)).toBe(3);
  });

  it("ignores an under-sampled higher tier and falls back to the one below", () => {
    const answers = [...answersAt(2, [true, true]), ...answersAt(3, [true])];
    expect(computeDetectedLevel(answers)).toBe(2);
  });

  it("does not award a tier whose rate is below the threshold", () => {
    const answers = [
      ...answersAt(2, [true, true]),
      ...answersAt(3, [true, false]),
    ];
    expect(computeDetectedLevel(answers)).toBe(2);
  });

  it("passes exactly at the threshold (≥ comparison)", () => {
    const total = 10;
    const correct = Math.round(CFG.passThreshold * total); // 7 for 0.7
    const results = [
      ...Array(correct).fill(true),
      ...Array(total - correct).fill(false),
    ];
    expect(computeDetectedLevel(answersAt(3, results))).toBe(3);
  });

  it("floor: if no tier passes, returns the lowest tier seen", () => {
    const answers = [
      ...answersAt(2, [false, false]),
      ...answersAt(3, [false, false]),
    ];
    expect(computeDetectedLevel(answers)).toBe(2);
  });

  it("with a single answer: no passed tier → floor = that tier", () => {
    expect(computeDetectedLevel(answersAt(2, [true]))).toBe(2);
  });
});

describe("config override", () => {
  it("honours a custom passThreshold", () => {
    // Tier 2 is aced (2/2 = 1.0); tier 3 is 3/5 = 0.6.
    const answers = [
      ...answersAt(2, [true, true]),
      ...answersAt(3, [true, true, true, false, false]),
    ];
    // Default 0.7 → tier 3 fails, so the highest passed tier is 2.
    expect(computeDetectedLevel(answers)).toBe(2);
    // Lower the bar to 0.5 → tier 3 now passes and wins.
    expect(computeDetectedLevel(answers, { ...CFG, passThreshold: 0.5 })).toBe(3);
  });
});

describe("simulatePlacement (end-to-end)", () => {
  it("places a taker 'solid up to tier 2' at tier 2", () => {
    const state = simulatePlacement((tier) => tier <= 2, {
      minTier: 1,
      maxTier: 3,
    });
    expect(state.answers.length).toBeLessThanOrEqual(CFG.maxItems);
    expect(computeDetectedLevel(state.answers)).toBe(2);
  });

  it("places a taker who knows everything at the top tier", () => {
    const state = simulatePlacement(() => true, { minTier: 1, maxTier: 5 });
    expect(computeDetectedLevel(state.answers)).toBe(5);
  });

  it("respects a lowered maxItems via config", () => {
    const state = simulatePlacement((tier) => (tier % 2 === 0 ? true : false), {
      minTier: 1,
      maxTier: 4,
      config: { ...CFG, maxItems: 6 },
    });
    expect(state.answers.length).toBeLessThanOrEqual(6);
  });
});
