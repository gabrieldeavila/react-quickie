import { describe, expect, it } from "vitest";
import type { InstructionSummary } from "./instruction.types";
import { instructionsChipLabel } from "./instructions-chip-label";

const make = (name: string): InstructionSummary => ({
  id: name.toLowerCase(),
  name,
  description: "",
  starters: [],
  source: "global",
  editable: true,
});

describe("instructionsChipLabel", () => {
  it("says Instructions when none is selected", () => {
    expect(instructionsChipLabel([])).toBe("Instructions");
  });

  it("names the first and counts the rest", () => {
    expect(instructionsChipLabel([make("Forms")])).toBe("Forms");
    expect(
      instructionsChipLabel([make("Forms"), make("API"), make("Tests")]),
    ).toBe("Forms +2");
  });
});
