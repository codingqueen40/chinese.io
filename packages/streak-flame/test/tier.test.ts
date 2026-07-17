import { describe, expect, it } from "vitest";
import { DEFAULT_FLAME_THRESHOLDS, flameTier } from "../src/index";

describe("flameTier — default boundaries (strong=7, blaze=30)", () => {
  it("0 and a broken streak → none", () => {
    expect(flameTier(0)).toBe("none");
    expect(flameTier(-3)).toBe("none");
  });

  it("1 → lit (first day)", () => {
    expect(flameTier(1)).toBe("lit");
  });

  it("6 → lit (last day of the low band)", () => {
    expect(flameTier(6)).toBe("lit");
  });

  it("7 → strong (switch)", () => {
    expect(flameTier(7)).toBe("strong");
  });

  it("29 → strong (last before blaze)", () => {
    expect(flameTier(29)).toBe("strong");
  });

  it("30+ → blaze (switch)", () => {
    expect(flameTier(30)).toBe("blaze");
    expect(flameTier(365)).toBe("blaze");
  });

  it("exposes the default thresholds", () => {
    expect(DEFAULT_FLAME_THRESHOLDS).toEqual({ strong: 7, blaze: 30 });
  });
});

describe("flameTier — custom thresholds", () => {
  const t = { strong: 3, blaze: 10 };

  it("respects a lowered 'strong' boundary", () => {
    expect(flameTier(2, t)).toBe("lit");
    expect(flameTier(3, t)).toBe("strong");
  });

  it("respects a lowered 'blaze' boundary", () => {
    expect(flameTier(9, t)).toBe("strong");
    expect(flameTier(10, t)).toBe("blaze");
  });
});
