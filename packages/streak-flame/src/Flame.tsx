import * as React from "react";
import {
  DEFAULT_FLAME_THRESHOLDS,
  flameTier,
  type FlameThresholds,
  type FlameTier,
} from "./tier";

// ─────────────────────────────────────────────────────────────
// Animated SVG streak flame. 100% CSS animation → works inside a React
// Server Component. `tier="none"` (or streak ≤ 0) renders nothing. Colours,
// tier scales and the flicker delay are driven by CSS custom properties, so
// the whole look is themeable without touching this file.
//
// Requires the stylesheet: import "streak-flame/styles.css" once in your app.
// ─────────────────────────────────────────────────────────────

export type FlameProps = {
  /** Current streak length. Ignored if `tier` is given. */
  streak?: number;
  /** Force a tier directly instead of deriving it from `streak`. */
  tier?: FlameTier;
  /** Tier thresholds when deriving from `streak`. */
  thresholds?: FlameThresholds;
  /** Rendered width in px (height keeps the 100:140 ratio). Default 44. */
  size?: number;
  /** Offset the flicker — useful to stagger a row of flames. */
  delayMs?: number;
  /** Extra class on the wrapper. */
  className?: string;
  /**
   * Accessible label. When provided, the SVG is exposed as an image with a
   * `<title>`; otherwise it is hidden from assistive tech (decorative).
   */
  title?: string;
};

export function Flame({
  streak,
  tier,
  thresholds = DEFAULT_FLAME_THRESHOLDS,
  size = 44,
  delayMs = 0,
  className,
  title,
}: FlameProps): React.ReactElement | null {
  const resolved: FlameTier = tier ?? flameTier(streak ?? 0, thresholds);
  if (resolved === "none") return null;

  const style = { "--sf-delay": `${delayMs}ms` } as React.CSSProperties;
  const wrapClass = ["sf-wrap", `sf-${resolved}`, className]
    .filter(Boolean)
    .join(" ");
  const a11y = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true };

  return (
    <span className={wrapClass} style={style}>
      <svg
        viewBox="0 0 100 140"
        width={size}
        height={(size * 140) / 100}
        className="sf-svg"
        {...a11y}
      >
        {title ? <title>{title}</title> : null}
        <g className="sf-flicker">
          <path
            className="sf-outer"
            d="M50 8 C64 34 84 46 84 82 C84 112 69 132 50 132 C31 132 16 112 16 82 C16 46 36 34 50 8 Z"
          />
          <path
            className="sf-mid"
            d="M50 40 C60 56 71 64 71 88 C71 110 61 124 50 124 C39 124 29 110 29 88 C29 64 40 56 50 40 Z"
          />
          <path
            className="sf-core"
            d="M50 66 C57 76 62 82 62 98 C62 112 56 122 50 122 C44 122 38 112 38 98 C38 82 43 76 50 66 Z"
          />
        </g>
        <g className="sf-sparks">
          <circle className="sf-sp sf-sp1" cx="38" cy="60" r="2.4" />
          <circle className="sf-sp sf-sp2" cx="63" cy="52" r="1.8" />
          <circle className="sf-sp sf-sp3" cx="52" cy="44" r="2.1" />
        </g>
      </svg>
    </span>
  );
}
