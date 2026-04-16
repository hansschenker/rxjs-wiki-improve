import { describe, it, expect } from "vitest";
import {
  nodeRadius,
  MIN_RADIUS,
  MAX_RADIUS,
  getColorPalette,
  DARK_PALETTE,
} from "../graph-render";

describe("graph-render", () => {
  describe("nodeRadius", () => {
    it("returns MIN_RADIUS for nodes with no links", () => {
      expect(nodeRadius(0)).toBe(MIN_RADIUS);
    });

    it("grows with link count", () => {
      expect(nodeRadius(4)).toBeGreaterThan(nodeRadius(1));
      expect(nodeRadius(10)).toBeGreaterThan(nodeRadius(4));
    });

    it("never exceeds MAX_RADIUS", () => {
      expect(nodeRadius(1000)).toBe(MAX_RADIUS);
      expect(nodeRadius(10_000)).toBe(MAX_RADIUS);
    });
  });

  describe("getColorPalette", () => {
    it("returns DARK_PALETTE when window is undefined (SSR)", () => {
      // vitest runs in node by default, so window is undefined here
      expect(getColorPalette()).toBe(DARK_PALETTE);
    });
  });
});
