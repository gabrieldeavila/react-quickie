import { describe, expect, it } from "vitest";
import {
  describeStepState,
  describeSubagentGroup,
  describeSubagentStatus,
} from "./describe-subagent-status";
import type { SubagentView } from "./subagent-view";

const view = (status: SubagentView["status"]): SubagentView => ({
  agent: "explorer",
  task: "t",
  status,
  steps: [],
  text: "",
  needsApproval: [],
});

describe("describe-subagent-status", () => {
  it("labels run and step states", () => {
    expect(describeSubagentStatus("queued")).toBe("queued");
    expect(describeSubagentStatus("aborted")).toBe("stopped");
    expect(describeStepState("denied")).toBe("not run");
  });

  it("summarizes a group by how many are still active", () => {
    expect(
      describeSubagentGroup([
        view("running"),
        view("queued"),
        view("completed"),
      ]),
    ).toBe("3 sub-agents · 2 running");
    expect(describeSubagentGroup([view("completed"), view("failed")])).toBe(
      "2 sub-agents · done",
    );
  });
});
