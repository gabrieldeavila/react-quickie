import { describe, expect, it } from "vitest";
import { compactSubagentOutput } from "./compact-subagent-output";

describe("compactSubagentOutput", () => {
  const part = {
    type: "tool-run_subagent",
    state: "output-available",
    output: {
      status: "completed",
      text: "answer",
      needsApproval: ["npm test"],
      steps: [{ id: "s1", tool: "read_file" }],
    },
  };

  it("drops the step list and keeps everything else", () => {
    expect(compactSubagentOutput(part).output).toEqual({
      status: "completed",
      text: "answer",
      needsApproval: ["npm test"],
    });
  });

  it("leaves other tools, unfinished calls and legacy outputs alone", () => {
    const other = { ...part, type: "tool-read_file" };
    const running = { ...part, state: "input-available" };
    const legacy = { ...part, output: { success: true, result: "r" } };

    expect(compactSubagentOutput(other)).toBe(other);
    expect(compactSubagentOutput(running)).toBe(running);
    expect(compactSubagentOutput(legacy)).toBe(legacy);
  });
});
