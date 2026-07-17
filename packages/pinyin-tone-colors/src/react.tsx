// ─────────────────────────────────────────────────────────────
// Optional React wrapper — import from "pinyin-tone-colors/react".
// React is a peer dependency; the core package has no dependencies.
//
// 100% presentational and side-effect free → safe inside a React Server
// Component. Colours are applied inline from the palette by default; pass
// `toneClassName` to colour via your own CSS classes instead (e.g. Tailwind
// or CSS variables).
// ─────────────────────────────────────────────────────────────

import * as React from "react";
import { toneSegments, type Mode } from "./core";
import { DEFAULT_TONE_COLORS, type Tone, type TonePalette } from "./palette";

export type PinyinProps = {
  /** Hanzi (mode="hanzi") or diacritic pinyin (mode="pinyin") to render. */
  text: string;
  /** Numbered pinyin, the tone source of truth, e.g. "ni3 hao3" (or null). */
  numbered: string | null;
  /** Colour the characters ("hanzi", default) or the romanisation ("pinyin"). */
  mode?: Mode;
  /** Override the tone colours. */
  palette?: TonePalette;
  /** Wrapping element. Default "span". */
  as?: React.ElementType;
  /** Class on the wrapper element. */
  className?: string;
  /**
   * Return a CSS class per tone instead of an inline colour. When provided,
   * inline colours are not applied — style the tones with your own CSS.
   */
  toneClassName?: (tone: Tone) => string | undefined;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">;

export function Pinyin({
  text,
  numbered,
  mode = "hanzi",
  palette = DEFAULT_TONE_COLORS,
  as: Wrapper = "span",
  className,
  toneClassName,
  ...rest
}: PinyinProps): React.ReactElement {
  const segments = toneSegments(text, numbered, mode);
  return (
    <Wrapper className={className} {...rest}>
      {segments.map((seg, i) => {
        const cls = toneClassName?.(seg.tone);
        const style =
          cls || seg.tone === 0 ? undefined : { color: palette[seg.tone] };
        return (
          <span key={i} className={cls} style={style}>
            {seg.text}
          </span>
        );
      })}
    </Wrapper>
  );
}
