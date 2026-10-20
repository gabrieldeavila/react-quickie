import { describe, expect, it } from "vitest";
import type { InstructionSummary } from "./instruction.types";
import { resolveSelection } from "./resolve-selection";

const make = (id: string): InstructionSummary => ({
  id,
  name: id,
  description: "",
  starters: [],
  source: "built-in",
  editable: false,
});

describe("resolveSelection", () => {
  it("keeps selection order and drops ids that no longer exist", () => {
    const available = [make("a"), make("b"), make("c")];

    expect(
      resolveSelection(available, ["c", "gone", "a"]).map(({ id }) => id),
    ).toEqual(["c", "a"]);
  });
});
