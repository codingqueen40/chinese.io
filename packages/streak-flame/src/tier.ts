// ─────────────────────────────────────────────────────────────
// Streak → flame tier. A PURE, testable function: the UI layer maps the
// tier to size / colour / sparks. Depends only on the current streak count.
// Thresholds are configurable; the defaults match a "week / month" rhythm.
// ─────────────────────────────────────────────────────────────

export type FlameTier = "none" | "lit" | "strong" | "blaze";

export type FlameThresholds = {
  /** Streak at which the flame becomes "strong". */
  strong: number;
  /** Streak at which the flame becomes a "blaze". */
  blaze: number;
};

export const DEFAULT_FLAME_THRESHOLDS: FlameThresholds = { strong: 7, blaze: 30 };

export function flameTier(
  streak: number,
  thresholds: FlameThresholds = DEFAULT_FLAME_THRESHOLDS,
): FlameTier {
  if (streak <= 0) return "none"; // broken streak → no flame
  if (streak < thresholds.strong) return "lit"; // 1 .. strong-1
  if (streak < thresholds.blaze) return "strong"; // strong .. blaze-1
  return "blaze"; // blaze+
}
