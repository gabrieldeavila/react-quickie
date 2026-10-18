import { describe, expect, it } from "vitest";
import {
  isLegacySubagentPart,
  migrateLegacySubagentPart,
} from "./legacy-subagent";

describe("legacy run_subagent parts", () => {
  const legacy = {
    type: "tool-run_subagent",
    toolCallId: "c1",
    state: "output-available",
    input: { name: "pesquisa", task: "find X", context: "ctx" },
  };

  it("detects calls made with the old { name } input", () => {
    expect(isLegacySubagentPart(legacy)).toBe(true);
    expect(
      isLegacySubagentPart({
        ...legacy,
        input: { agent: "explorer", task: "t" },
      }),
    ).toBe(false);
    expect(isLegacySubagentPart({ ...legacy, type: "tool-read_file" })).toBe(
      false,
    );
  });

  it("renames name to agent and keeps the rest", () => {
    expect(migrateLegacySubagentPart(legacy)).toEqual({
      ...legacy,
      input: { agent: "pesquisa", task: "find X", context: "ctx" },
    });
  });

  it("returns other parts unchanged", () => {
    const part = { type: "text", text: "hi" };
    expect(migrateLegacySubagentPart(part)).toBe(part);
  });
});
