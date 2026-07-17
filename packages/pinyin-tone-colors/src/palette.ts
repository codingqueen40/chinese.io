// ─────────────────────────────────────────────────────────────
// Tone palette. Standard Mandarin has four tones plus a neutral one.
// A tone of 0 means "no tone information" → the segment inherits the
// surrounding text color (currentColor) and gets no override.
//
// The default palette below is a perceptually balanced, colorblind-aware
// set tuned for study UIs. Every colour is overridable: pass your own
// `TonePalette` to any coloring helper or to the React component.
// ─────────────────────────────────────────────────────────────

/** 0 = no coloring (inherit). 1-4 = the four Mandarin tones. 5 = neutral tone. */
export type Tone = 0 | 1 | 2 | 3 | 4 | 5;

/** A concrete colour (any CSS colour string) for each toned syllable. */
export type TonePalette = Record<Exclude<Tone, 0>, string>;

/**
 * Default tone colours. Chosen so the four tones stay distinguishable for the
 * most common colour-vision deficiencies and readable on light backgrounds.
 */
export const DEFAULT_TONE_COLORS: TonePalette = {
  1: "#E24B4A", // first tone  — high & flat
  2: "#BA7517", // second tone — rising
  3: "#639922", // third tone  — dipping
  4: "#378ADD", // fourth tone — falling
  5: "#888780", // neutral tone
};

/** Resolve a tone to a colour, or `undefined` for tone 0 (inherit). */
export function toneColor(
  tone: Tone,
  palette: TonePalette = DEFAULT_TONE_COLORS,
): string | undefined {
  return tone === 0 ? undefined : palette[tone];
}
