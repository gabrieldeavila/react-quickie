import { describe, expect, it } from "vitest";
import { groupSubagentParts } from "./group-subagent-parts";

const part = (type: string) => ({ type });

describe("groupSubagentParts", () => {
  it("groups consecutive run_subagent parts and keeps their indexes", () => {
    const parts = [
      part("text"),
      part("tool-run_subagent"),
      part("tool-run_subagent"),
      part("text"),
    ];

    expect(groupSubagentParts(parts)).toEqual([
      { kind: "part", part: parts[0], index: 0 },
      {
        kind: "subagents",
        items: [
          { part: parts[1], index: 1 },
          { part: parts[2], index: 2 },
        ],
      },
      { kind: "part", part: parts[3], index: 3 },
    ]);
  });

  it("starts a new group after any other part", () => {
    const groups = groupSubagentParts([
      part("tool-run_subagent"),
      part("step-start"),
      part("tool-run_subagent"),
    ]);

    expect(groups.map((group) => group.kind)).toEqual([
      "subagents",
      "part",
      "subagents",
    ]);
  });
});
