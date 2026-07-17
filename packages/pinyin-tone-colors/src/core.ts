// ─────────────────────────────────────────────────────────────
// pinyin-tone-colors — framework-agnostic core.
//
// Colours Mandarin hanzi or pinyin by tone, deriving the tone from a
// *numbered* pinyin string (e.g. "ni3 hao3") used as the source of truth,
// while displaying either the hanzi or the diacritic pinyin — the tone
// numbers are never shown.
//
// The module is pure: no I/O, no DOM, no framework. It returns plain data
// (`ToneColoredSegment[]`) so any renderer — React, Vue, a template string,
// canvas — can decide how to paint it.
// ─────────────────────────────────────────────────────────────

import { DEFAULT_TONE_COLORS, toneColor, type Tone, type TonePalette } from "./palette";

/** A run of text with the tone that should colour it (0 = no colour). */
export type ToneColoredSegment = { text: string; tone: Tone };

/** Which text to colour: the characters, or the romanisation. */
export type Mode = "hanzi" | "pinyin";

/**
 * Split numbered pinyin into `{ toneless, tone }` syllables.
 *
 *   "peng2 you5" → [{ toneless: "peng", tone: 2 }, { toneless: "you", tone: 5 }]
 *
 * A syllable that doesn't end in a tone digit keeps `tone: 0`. `ü`/`v` are
 * accepted in the toneless body; a trailing 1-5 is the tone.
 */
export function parseNumberedPinyin(
  numbered: string,
): { toneless: string; tone: Tone }[] {
  return numbered
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((syllable) => {
      const m = /^([a-zü]+?)([1-5])$/i.exec(syllable);
      return m
        ? { toneless: m[1]!, tone: Number(m[2]) as Tone }
        : { toneless: syllable, tone: 0 as Tone };
    });
}

/**
 * Colour each HANZI by the tone of its syllable. Relies on a 1:1 match
 * between characters and syllables; on any mismatch it falls back to a
 * single uncoloured segment (never mangles the text).
 */
export function colorHanzi(
  hanzi: string,
  numbered: string | null,
): ToneColoredSegment[] {
  if (!numbered) return [{ text: hanzi, tone: 0 }];
  const chars = Array.from(hanzi);
  const syllables = parseNumberedPinyin(numbered);
  if (chars.length !== syllables.length) return [{ text: hanzi, tone: 0 }];
  return chars.map((char, i) => ({ text: char, tone: syllables[i]!.tone }));
}

/**
 * Colour the diacritic PINYIN while keeping the exact accented form. The
 * string is normalised to NFC (so each accented vowel is a single code
 * point) and syllable separators (apostrophe, hyphen, spaces) are removed
 * from the output. Segment lengths come from the numbered form.
 *
 * On any length mismatch it falls back to a single uncoloured segment, so
 * the text is never truncated.
 */
export function colorPinyin(
  pinyin: string,
  numbered: string | null,
): ToneColoredSegment[] {
  if (!numbered) return [{ text: pinyin, tone: 0 }];
  const syllables = parseNumberedPinyin(numbered);
  const clean = Array.from(pinyin.normalize("NFC").replace(/['’‘\-\s]/g, ""));
  const segments: ToneColoredSegment[] = [];
  let i = 0;
  for (const syllable of syllables) {
    const len = syllable.toneless.length; // one code point per letter
    segments.push({ text: clean.slice(i, i + len).join(""), tone: syllable.tone });
    i += len;
  }
  // Unexpected misalignment → uncoloured fallback rather than truncated text.
  if (i !== clean.length) return [{ text: pinyin, tone: 0 }];
  return segments;
}

/** Dispatch to {@link colorHanzi} or {@link colorPinyin} by `mode`. */
export function toneSegments(
  text: string,
  numbered: string | null,
  mode: Mode = "hanzi",
): ToneColoredSegment[] {
  return mode === "pinyin"
    ? colorPinyin(text, numbered)
    : colorHanzi(text, numbered);
}

const HTML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"]/g, (c) => HTML_ESCAPE[c]!);
}

/**
 * Render segments to an HTML string with inline colours — for non-React
 * consumers (server templates, plain DOM, the demo page). Text is escaped.
 */
export function segmentsToHtml(
  segments: ToneColoredSegment[],
  palette: TonePalette = DEFAULT_TONE_COLORS,
): string {
  return segments
    .map((seg) => {
      const color = toneColor(seg.tone, palette);
      const style = color ? ` style="color:${color}"` : "";
      return `<span${style}>${escapeHtml(seg.text)}</span>`;
    })
    .join("");
}

/** One-shot convenience: text + numbered pinyin → coloured HTML string. */
export function toHtml(
  text: string,
  numbered: string | null,
  mode: Mode = "hanzi",
  palette: TonePalette = DEFAULT_TONE_COLORS,
): string {
  return segmentsToHtml(toneSegments(text, numbered, mode), palette);
}
