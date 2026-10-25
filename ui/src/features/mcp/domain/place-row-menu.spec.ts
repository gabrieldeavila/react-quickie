import { describe, expect, it } from "vitest";
import { placeRowMenu } from "./place-row-menu";

const viewport = { width: 1000, height: 600 };

describe("placeRowMenu", () => {
  it("opens below the trigger, aligned to its right edge", () => {
    expect(
      placeRowMenu({ top: 100, bottom: 136, right: 700 }, 200, viewport),
    ).toEqual({ top: 144, right: 300 });
  });

  it("opens above when it doesn't fit below", () => {
    expect(
      placeRowMenu({ top: 450, bottom: 486, right: 700 }, 200, viewport),
    ).toEqual({ top: 242, right: 300 });
  });

  it("stays below when there's even less room above", () => {
    expect(
      placeRowMenu({ top: 60, bottom: 96, right: 700 }, 600, viewport),
    ).toEqual({ top: 104, right: 300 });
  });

  it("never goes above the viewport", () => {
    expect(
      placeRowMenu({ top: 300, bottom: 336, right: 700 }, 500, viewport),
    ).toEqual({ top: 8, right: 300 });
  });
});
