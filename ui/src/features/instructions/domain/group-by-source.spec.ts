import { describe, expect, it } from "vitest";
import { groupBySource } from "./group-by-source";
import type { InstructionSource, InstructionSummary } from "./instruction.types";

const make = (id: string, source: InstructionSource): InstructionSummary => ({
  id,
  name: id,
  description: "",
  starters: [],
  source,
  editable: source !== "built-in",
});

describe("groupBySource", () => {
  it("orders project, global, built-in and skips empty groups", () => {
    const groups = groupBySource([
      make("forms", "built-in"),
      make("api", "project"),
      make("landing", "built-in"),
    ]);

    expect(
      groups.map(({ label, instructions }) => [
        label,
        instructions.map(({ id }) => id),
      ]),
    ).toEqual([
      ["Project", ["api"]],
      ["Built-in", ["forms", "landing"]],
    ]);
  });
});
