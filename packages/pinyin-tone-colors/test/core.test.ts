import { describe, expect, it } from "vitest";
import {
  DEFAULT_TONE_COLORS,
  colorHanzi,
  colorPinyin,
  parseNumberedPinyin,
  segmentsToHtml,
  toHtml,
  toneColor,
  toneSegments,
} from "../src/index";

// Pure module → pure tests. We target the invariants of the algorithm
// (1:1 alignment, graceful fallback, NFC handling), not brittle snapshots.

describe("parseNumberedPinyin", () => {
  it("splits syllables and reads the trailing tone digit", () => {
    expect(parseNumberedPinyin("ni3 hao3")).toEqual([
      { toneless: "ni", tone: 3 },
      { toneless: "hao", tone: 3 },
    ]);
  });

  it("maps the neutral tone (5)", () => {
    expect(parseNumberedPinyin("peng2 you5")).toEqual([
      { toneless: "peng", tone: 2 },
      { toneless: "you", tone: 5 },
    ]);
  });

  it("keeps tone 0 for a syllable without a tone digit", () => {
    expect(parseNumberedPinyin("de")).toEqual([{ toneless: "de", tone: 0 }]);
  });

  it("accepts u-umlaut and v in the toneless body", () => {
    expect(parseNumberedPinyin("lü4")).toEqual([
      { toneless: "lü", tone: 4 },
    ]);
    expect(parseNumberedPinyin("lv4")).toEqual([{ toneless: "lv", tone: 4 }]);
  });

  it("tolerates extra whitespace", () => {
    expect(parseNumberedPinyin("  ni3   hao3 ")).toHaveLength(2);
  });
});

describe("colorHanzi", () => {
  it("colours each character by its syllable tone", () => {
    expect(colorHanzi("你好", "ni3 hao3")).toEqual([
      { text: "你", tone: 3 },
      { text: "好", tone: 3 },
    ]);
  });

  it("handles astral characters via code-point iteration", () => {
    // U+20000 is outside the BMP; Array.from must not split the surrogate pair.
    const segs = colorHanzi("\u{20000}吗", "a1 ma5");
    expect(segs).toEqual([
      { text: "\u{20000}", tone: 1 },
      { text: "吗", tone: 5 },
    ]);
  });

  it("falls back to one uncoloured segment when counts mismatch", () => {
    expect(colorHanzi("你好", "ni3")).toEqual([
      { text: "你好", tone: 0 },
    ]);
  });

  it("falls back when numbered pinyin is null", () => {
    expect(colorHanzi("你好", null)).toEqual([
      { text: "你好", tone: 0 },
    ]);
  });
});

describe("colorPinyin", () => {
  // Precomposed diacritic vowels, spelled with code points for clarity.
  const ni = "nǐ"; // nǐ
  const hao = "hǎo"; // hǎo

  it("keeps the diacritic form and colours per syllable", () => {
    expect(colorPinyin(ni + hao, "ni3 hao3")).toEqual([
      { text: ni, tone: 3 },
      { text: hao, tone: 3 },
    ]);
  });

  it("strips apostrophe / hyphen / space separators from the output", () => {
    expect(colorPinyin("xī'ān", "xi1 an1")).toEqual([
      { text: "xī", tone: 1 }, // xī
      { text: "ān", tone: 1 }, // ān
    ]);
    expect(colorPinyin(hao + "-de", "hao3 de5")).toEqual([
      { text: hao, tone: 3 },
      { text: "de", tone: 5 },
    ]);
  });

  it("normalises decomposed (NFD) input to NFC before slicing", () => {
    // n + i + combining caron, h + a + combining caron + o.
    const decomposed = "nǐhǎo";
    expect(colorPinyin(decomposed, "ni3 hao3")).toEqual([
      { text: ni, tone: 3 },
      { text: hao, tone: 3 },
    ]);
  });

  it("falls back to one uncoloured segment on length mismatch", () => {
    // Cleaned pinyin length (5) doesn't match summed syllable length (6).
    expect(colorPinyin("nihao", "ni3 haos3")).toEqual([
      { text: "nihao", tone: 0 },
    ]);
  });

  it("falls back when numbered pinyin is null", () => {
    expect(colorPinyin(ni + hao, null)).toEqual([
      { text: ni + hao, tone: 0 },
    ]);
  });
});

describe("toneSegments dispatch", () => {
  it("colours hanzi by default", () => {
    expect(toneSegments("好", "hao3")).toEqual([{ text: "好", tone: 3 }]);
  });

  it("colours pinyin when mode is 'pinyin'", () => {
    expect(toneSegments("hǎo", "hao3", "pinyin")).toEqual([
      { text: "hǎo", tone: 3 },
    ]);
  });
});

describe("toneColor / palette", () => {
  it("returns undefined for tone 0 (inherit)", () => {
    expect(toneColor(0)).toBeUndefined();
  });

  it("returns the default colour for a tone", () => {
    expect(toneColor(1)).toBe(DEFAULT_TONE_COLORS[1]);
  });

  it("honours a custom palette override", () => {
    const palette = { ...DEFAULT_TONE_COLORS, 1: "#000000" };
    expect(toneColor(1, palette)).toBe("#000000");
  });
});

describe("segmentsToHtml / toHtml", () => {
  it("wraps each segment in a span with an inline colour", () => {
    const html = toHtml("你好", "ni3 hao3");
    expect(html).toBe(
      `<span style="color:${DEFAULT_TONE_COLORS[3]}">你</span>` +
        `<span style="color:${DEFAULT_TONE_COLORS[3]}">好</span>`,
    );
  });

  it("omits the style attribute for tone 0", () => {
    expect(segmentsToHtml([{ text: "de", tone: 0 }])).toBe("<span>de</span>");
  });

  it("escapes HTML-special characters in the text", () => {
    expect(segmentsToHtml([{ text: '<a>&"', tone: 0 }])).toBe(
      '<span>&lt;a&gt;&amp;&quot;</span>',
    );
  });
});
