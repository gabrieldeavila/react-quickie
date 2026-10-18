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
    expect(describeSubagentStatus("queued")).toBe("na fila");
    expect(describeSubagentStatus("aborted")).toBe("interrompido");
    expect(describeStepState("denied")).toBe("não executado");
  });

  it("summarizes a group by how many are still active", () => {
    expect(
      describeSubagentGroup([
        view("running"),
        view("queued"),
        view("completed"),
      ]),
    ).toBe("3 subagentes · 2 em execução");
    expect(describeSubagentGroup([view("completed"), view("failed")])).toBe(
      "2 subagentes · concluídos",
    );
  });
});
