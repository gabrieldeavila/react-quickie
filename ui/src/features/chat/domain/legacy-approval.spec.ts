import { describe, expect, it } from "vitest";
import {
  isLegacyApprovalControlMessage,
  isLegacyApprovalRequestOutput,
  isLegacySyntheticToolPart,
} from "./legacy-approval";

describe("legacy approval detection", () => {
  it("detects the control message by its prefix, from parts or content", () => {
    expect(
      isLegacyApprovalControlMessage({
        role: "user",
        parts: [{ type: "text", text: "[bash-approval-control] ok" }],
      }),
    ).toBe(true);
    expect(
      isLegacyApprovalControlMessage({
        role: "user",
        content: "[bash-approval-control] ok",
      }),
    ).toBe(true);
    expect(
      isLegacyApprovalControlMessage({
        role: "assistant",
        parts: [{ type: "text", text: "[bash-approval-control] ok" }],
      }),
    ).toBe(false);
    expect(
      isLegacyApprovalControlMessage({
        role: "user",
        parts: [{ type: "text", text: "what is [bash-approval-control]?" }],
      }),
    ).toBe(false);
  });

  it("tells hand-made tool parts from real ones", () => {
    expect(
      isLegacySyntheticToolPart({ type: "tool-run_bash_command", approvalId: "a" }),
    ).toBe(true);
    expect(
      isLegacySyntheticToolPart({
        type: "tool-run_bash_command",
        approvalId: "a",
        toolCallId: "c",
      }),
    ).toBe(false);
    expect(isLegacySyntheticToolPart({ type: "text", approvalId: "a" })).toBe(
      false,
    );
    expect(isLegacySyntheticToolPart(null)).toBe(false);
  });

  it("detects the old 'waiting for approval' output", () => {
    expect(isLegacyApprovalRequestOutput({ approvalRequired: true })).toBe(true);
    expect(isLegacyApprovalRequestOutput({ success: true })).toBe(false);
    expect(isLegacyApprovalRequestOutput("text")).toBe(false);
  });
});
