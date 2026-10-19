import { describe, expect, it } from "vitest";
import {
  buildAlternativeReason,
  describeApprovalInput,
  describeApprovalTitle,
  getDeniedReason,
  getPendingApproval,
} from "./tool-approval";

describe("getPendingApproval", () => {
  it("reads an approval-requested static tool part", () => {
    expect(
      getPendingApproval({
        type: "tool-run_bash_command",
        state: "approval-requested",
        input: { command: "rm -rf dist" },
        approval: { id: "ap-1" },
      }),
    ).toEqual({
      approvalId: "ap-1",
      toolName: "run_bash_command",
      input: { command: "rm -rf dist" },
    });
  });

  it("uses toolName for dynamic tools", () => {
    expect(
      getPendingApproval({
        type: "dynamic-tool",
        toolName: "mcp__github__create_issue",
        state: "approval-requested",
        approval: { id: "ap-2" },
      })?.toolName,
    ).toBe("mcp__github__create_issue");
  });

  it("returns null for any other state or a missing approval id", () => {
    expect(
      getPendingApproval({
        type: "tool-run_bash_command",
        state: "approval-responded",
        approval: { id: "ap-1" },
      }),
    ).toBeNull();
    expect(
      getPendingApproval({ type: "tool-x", state: "approval-requested" }),
    ).toBeNull();
  });
});

describe("approval texts", () => {
  it("shows the bash command, or the raw input for other tools", () => {
    expect(
      describeApprovalInput({
        approvalId: "a",
        toolName: "run_bash_command",
        input: { command: "npm i" },
      }),
    ).toBe("npm i");
    expect(
      describeApprovalInput({
        approvalId: "a",
        toolName: "x",
        input: { a: 1 },
      }),
    ).toBe('{\n  "a": 1\n}');
  });

  it("shows a subagent's task", () => {
    expect(
      describeApprovalInput({
        approvalId: "a",
        toolName: "run_subagent",
        input: { agent: "implementer", task: "Add a test" },
      }),
    ).toBe("Add a test");
  });

  it("titles the card by tool", () => {
    const approval = (toolName: string, input: unknown = {}) => ({
      approvalId: "a",
      toolName,
      input,
    });

    expect(describeApprovalTitle(approval("run_bash_command"), "x")).toBe(
      "The agent needs permission to run:",
    );
    expect(
      describeApprovalTitle(
        approval("run_subagent", { agent: "implementer" }),
        "x",
      ),
    ).toBe("The implementer sub-agent wants to make changes:");
    expect(describeApprovalTitle(approval("mcp__gh__x"), "gh › x")).toBe(
      "The agent needs permission to use gh › x:",
    );
  });

  it("builds the alternative-command reason for the model", () => {
    expect(buildAlternativeReason("  npm ci ")).toBe(
      "User suggests running instead: npm ci",
    );
  });

  it("reads the denial reason only from denied parts", () => {
    expect(
      getDeniedReason({
        type: "tool-x",
        state: "output-denied",
        approval: { reason: "blocked by policy" },
      }),
    ).toBe("blocked by policy");
    expect(
      getDeniedReason({ type: "tool-x", state: "output-denied", approval: {} }),
    ).toBeUndefined();
    expect(
      getDeniedReason({ type: "tool-x", state: "output-available" }),
    ).toBeUndefined();
  });
});
