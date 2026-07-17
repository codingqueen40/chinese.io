// ─────────────────────────────────────────────────────────────
// Tunable knobs for the placement algorithm, grouped and named so they
// can be adjusted without touching the engine — and read clearly in tests.
// Every function accepts an optional config and falls back to the default.
// ─────────────────────────────────────────────────────────────

export type PlacementConfig = {
  /** Hard stop: never present more than this many items. */
  maxItems: number;
  /** Below this, never stop early — even if the staircase already looks stable. */
  minItems: number;
  /** Minimum success rate (0-1) required to "pass" a tier. */
  passThreshold: number;
  /** Minimum items seen at a tier before its success rate is allowed to count. */
  minItemsPerTier: number;
  /** Size of the trailing window inspected to detect stabilisation. */
  stableWindow: number;
};

export const DEFAULT_PLACEMENT_CONFIG: PlacementConfig = {
  maxItems: 12,
  minItems: 8,
  passThreshold: 0.7,
  minItemsPerTier: 2,
  stableWindow: 4,
};
