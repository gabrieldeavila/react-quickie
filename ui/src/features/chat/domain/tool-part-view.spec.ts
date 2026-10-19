import { describe, expect, it } from "vitest";
import {
  formatToolOutput,
  getToolStatus,
  LEGACY_APPROVAL_TEXT,
} from "./tool-part-view";

const part = (state: string, extra: Record<string, unknown> = {}) => ({
  type: "tool-run_bash_command",
  state,
  ...extra,
});

describe("getToolStatus", () => {
  it("maps tool states onto card statuses", () => {
    expect(getToolStatus(part("input-streaming"))).toBe("loading");
    expect(
      getToolStatus(part("approval-responded", { approval: { approved: true } })),
    ).toBe("loading");
    expect(
      getToolStatus(
        part("approval-responded", { approval: { approved: false } }),
      ),
    ).toBe("error");
    expect(getToolStatus(part("output-available", { output: "x" }))).toBe(
      "success",
    );
    expect(getToolStatus(part("output-error"))).toBe("error");
    expect(getToolStatus(part("output-denied"))).toBe("error");
    expect(
      getToolStatus(part("output-available", { output: { success: false } })),
    ).toBe("error");
  });
});

describe("formatToolOutput", () => {
  it("formats tool results", () => {
    expect(
      formatToolOutput(
        part("output-available", {
          output: { success: true, message: "Feito.", data: ["a"] },
        }),
      ),
    ).toBe('Feito.\n\n[\n  "a"\n]');
    expect(
      formatToolOutput(
        part("output-available", { output: { success: false, error: "boom" } }),
      ),
    ).toBe("boom");
  });

  it("explains denials and errors", () => {
    expect(
      formatToolOutput(
        part("output-denied", { approval: { reason: "blocked by policy" } }),
      ),
    ).toBe("Denied: blocked by policy");
    expect(formatToolOutput(part("output-denied", { approval: {} }))).toBe(
      "Denied by the user.",
    );
    // Policy denials stay `approval-responded` (isAutomatic) in the UI message.
    expect(
      formatToolOutput(
        part("approval-responded", {
          approval: { approved: false, isAutomatic: true, reason: "blocked" },
        }),
      ),
    ).toBe("Denied: blocked");
    expect(
      formatToolOutput(part("output-error", { errorText: "interrupted" })),
    ).toBe("interrupted");
  });

  it("labels old-flow approval outputs as no longer answerable", () => {
    expect(
      formatToolOutput(
        part("output-available", { output: { approvalRequired: true } }),
      ),
    ).toBe(LEGACY_APPROVAL_TEXT);
  });
});
