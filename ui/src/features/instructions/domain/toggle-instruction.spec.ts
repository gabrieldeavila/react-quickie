import { describe, expect, it } from "vitest";
import {
  MAX_SELECTED_INSTRUCTIONS,
  toggleInstruction,
} from "./toggle-instruction";

describe("toggleInstruction", () => {
  it("adds an id at the end and removes a selected one", () => {
    expect(toggleInstruction(["forms"], "api")).toEqual(["forms", "api"]);
    expect(toggleInstruction(["forms", "api"], "forms")).toEqual(["api"]);
  });

  it("doesn't add past the limit but still removes", () => {
    const full = Array.from(
      { length: MAX_SELECTED_INSTRUCTIONS },
      (_, index) => `i${index}`,
    );

    expect(toggleInstruction(full, "extra")).toBe(full);
    expect(toggleInstruction(full, "i0")).toHaveLength(
      MAX_SELECTED_INSTRUCTIONS - 1,
    );
  });
});
