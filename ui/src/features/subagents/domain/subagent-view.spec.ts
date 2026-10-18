import { describe, expect, it } from "vitest";
import { isSubagentActive, toSubagentView } from "./subagent-view";

const input = { agent: "explorer", task: "find X" };

describe("toSubagentView", () => {
  it("shows a call whose input is still arriving as starting", () => {
    expect(toSubagentView({ state: "input-available", input })).toMatchObject({
      agent: "explorer",
      task: "find X",
      status: "starting",
      steps: [],
    });
  });

  it("reads preliminary and final outputs", () => {
    const steps = [
      { id: "a", tool: "read_file", inputSummary: "a.ts", state: "done" },
    ];
    expect(
      toSubagentView({
        state: "output-available",
        input,
        output: {
          status: "completed",
          text: "Found.",
          steps,
          needsApproval: ["npm test"],
        },
      }),
    ).toEqual({
      ...input,
      status: "completed",
      steps,
      text: "Found.",
      needsApproval: ["npm test"],
      error: undefined,
    });
    expect(
      toSubagentView({
        state: "output-available",
        input,
        output: { status: "queued" },
      }).status,
    ).toBe("queued");
  });

  it("reads the pre-Phase-4 input and output", () => {
    expect(
      toSubagentView({
        state: "output-available",
        input: { name: "pesquisa", task: "t" },
        output: { success: true, subagentId: "x", result: "old" },
      }),
    ).toMatchObject({ agent: "pesquisa", status: "completed", text: "old" });
    expect(
      toSubagentView({
        state: "output-available",
        input,
        output: { success: false, error: "boom" },
      }),
    ).toMatchObject({ status: "failed", error: "boom" });
  });

  it("shows denials with the reason and errors with their text", () => {
    expect(
      toSubagentView({
        state: "approval-responded",
        input,
        approval: { approved: false, reason: "Unknown agent" },
      }),
    ).toMatchObject({ status: "denied", error: "Unknown agent" });
    expect(toSubagentView({ state: "output-denied", input }).status).toBe(
      "denied",
    );
    expect(
      toSubagentView({
        state: "output-error",
        input,
        errorText: "interrupted by user",
      }),
    ).toMatchObject({ status: "failed", error: "interrupted by user" });
  });
});

describe("isSubagentActive", () => {
  it("is true until the run ends", () => {
    const view = toSubagentView({ state: "input-available", input });
    expect(isSubagentActive(view)).toBe(true);
    expect(isSubagentActive({ ...view, status: "running" })).toBe(true);
    expect(isSubagentActive({ ...view, status: "completed" })).toBe(false);
    expect(isSubagentActive({ ...view, status: "denied" })).toBe(false);
  });
});
