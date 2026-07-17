import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Flame } from "../src/index";

describe("<Flame>", () => {
  it("renders nothing for a broken streak", () => {
    expect(renderToStaticMarkup(<Flame streak={0} />)).toBe("");
    expect(renderToStaticMarkup(<Flame tier="none" />)).toBe("");
  });

  it("derives the tier class from the streak", () => {
    expect(renderToStaticMarkup(<Flame streak={3} />)).toContain("sf-lit");
    expect(renderToStaticMarkup(<Flame streak={10} />)).toContain("sf-strong");
    expect(renderToStaticMarkup(<Flame streak={40} />)).toContain("sf-blaze");
  });

  it("honours custom thresholds", () => {
    const html = renderToStaticMarkup(
      <Flame streak={4} thresholds={{ strong: 3, blaze: 10 }} />,
    );
    expect(html).toContain("sf-strong");
  });

  it("lets `tier` override `streak`", () => {
    expect(renderToStaticMarkup(<Flame streak={100} tier="lit" />)).toContain(
      "sf-lit",
    );
  });

  it("sets the flicker delay as a CSS variable", () => {
    const html = renderToStaticMarkup(<Flame streak={5} delayMs={250} />);
    expect(html).toContain("--sf-delay:250ms");
  });

  it("scales width and height together via `size`", () => {
    const html = renderToStaticMarkup(<Flame streak={5} size={100} />);
    expect(html).toContain('width="100"');
    expect(html).toContain('height="140"'); // 100 * 140 / 100
  });

  it("is decorative (aria-hidden) by default", () => {
    const html = renderToStaticMarkup(<Flame streak={5} />);
    expect(html).toContain("aria-hidden");
    expect(html).not.toContain("<title>");
  });

  it("exposes an accessible image when a title is given", () => {
    const html = renderToStaticMarkup(
      <Flame streak={5} title="5-day streak" />,
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="5-day streak"');
    expect(html).toContain("<title>5-day streak</title>");
  });
});
