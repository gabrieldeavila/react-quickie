import { describe, expect, it } from "vitest";
import { filterInstructions } from "./filter-instructions";
import type { InstructionSummary } from "./instruction.types";

const make = (
  id: string,
  name: string,
  description = "",
): InstructionSummary => ({
  id,
  name,
  description,
  starters: [],
  source: "built-in",
  editable: false,
});

const list = [
  make("forms", "Forms", "Typed forms with Zod"),
  make("landing-pages", "Landing pages"),
];

describe("filterInstructions", () => {
  it("returns everything for an empty query", () => {
    expect(filterInstructions(list, "  ")).toBe(list);
  });

  it("matches name, id and description, ignoring case", () => {
    const ids = (query: string) =>
      filterInstructions(list, query).map(({ id }) => id);

    expect(ids("LANDING")).toEqual(["landing-pages"]);
    expect(ids("zod")).toEqual(["forms"]);
    expect(ids("pages")).toEqual(["landing-pages"]);
    expect(ids("nothing")).toEqual([]);
  });
});
