// ─────────────────────────────────────────────────────────────
// Level scale — the only domain-aware seam, and it's fully generic.
//
// The engine reasons purely in TIER NUMBERS (1..N). A LevelScale maps those
// tiers to whatever labels your domain uses — CEFR strings, difficulty enums,
// grade bands, anything comparable by identity. Merge several real levels
// into one tier simply by giving that tier a single label.
// ─────────────────────────────────────────────────────────────

export type LevelScale<T> = {
  /** Number of tiers (= number of labels). */
  readonly count: number;
  /** The ordered labels, lowest tier first. */
  readonly levels: readonly T[];
  /** Tier (1..count) → label, or `null` when out of range. */
  tierToLevel(tier: number): T | null;
  /** Label → tier (1..count), or `-1` when the label is unknown. */
  levelToTier(level: T): number;
};

/**
 * Build a scale from an ordered list of labels. A tier is simply
 * `index + 1`, so `createLevelScale(["A1","A2","B1"])` maps A1→1, A2→2, B1→3.
 * Labels are compared by identity (`indexOf`), so use primitives or stable
 * references.
 */
export function createLevelScale<T>(levels: readonly T[]): LevelScale<T> {
  return {
    count: levels.length,
    levels,
    tierToLevel(tier: number): T | null {
      return levels[tier - 1] ?? null;
    },
    levelToTier(level: T): number {
      const index = levels.indexOf(level);
      return index === -1 ? -1 : index + 1;
    },
  };
}
