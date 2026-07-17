import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Pinyin } from "../src/react";
import { DEFAULT_TONE_COLORS } from "../src/index";

// The wrapper is presentational; render it to static markup (no DOM needed)
// and assert the structure a Server Component would emit.

describe("<Pinyin>", () => {
  it("renders one coloured span per hanzi", () => {
    const html = renderToStaticMarkup(<Pinyin text="你好" numbered="ni3 hao3" />);
    expect(html).toContain("你");
    expect(html).toContain("好");
    expect(html).toContain(`color:${DEFAULT_TONE_COLORS[3]}`);
  });

  it("colours the pinyin in mode='pinyin'", () => {
    const html = renderToStaticMarkup(
      <Pinyin text="hǎo" numbered="hao3" mode="pinyin" />,
    );
    expect(html).toContain("hǎo");
    expect(html).toContain(`color:${DEFAULT_TONE_COLORS[3]}`);
  });

  it("uses toneClassName instead of inline colour when provided", () => {
    const html = renderToStaticMarkup(
      <Pinyin
        text="好"
        numbered="hao3"
        toneClassName={(tone) => `tone-${tone}`}
      />,
    );
    expect(html).toContain('class="tone-3"');
    expect(html).not.toContain("style");
  });

  it("renders with a custom wrapper element via `as`", () => {
    const html = renderToStaticMarkup(
      <Pinyin as="div" text="好" numbered="hao3" />,
    );
    expect(html.startsWith("<div")).toBe(true);
  });
});
