// Public entry — framework-agnostic. The React component lives at
// "pinyin-tone-colors/react" so this core stays zero-dependency.
export {
  DEFAULT_TONE_COLORS,
  toneColor,
  type Tone,
  type TonePalette,
} from "./palette";

export {
  parseNumberedPinyin,
  colorHanzi,
  colorPinyin,
  toneSegments,
  segmentsToHtml,
  toHtml,
  type Mode,
  type ToneColoredSegment,
} from "./core";
