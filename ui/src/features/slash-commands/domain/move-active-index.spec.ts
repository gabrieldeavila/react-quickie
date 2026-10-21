import { describe, expect, it } from "vitest";
import { moveActiveIndex } from "./move-active-index";

describe("moveActiveIndex", () => {
  it("moves and wraps in both directions", () => {
    expect(moveActiveIndex(0, 1, 3)).toBe(1);
    expect(moveActiveIndex(2, 1, 3)).toBe(0);
    expect(moveActiveIndex(0, -1, 3)).toBe(2);
  });

  it("is 0 for an empty list", () => {
    expect(moveActiveIndex(4, 1, 0)).toBe(0);
  });
});
