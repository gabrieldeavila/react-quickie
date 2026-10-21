import { describe, expect, it } from "vitest";
import {
  approvalFor,
  readApprovalSetting,
  withToolApproval,
} from "./tool-approval";

describe("readApprovalSetting", () => {
  it("reads a mode or a per-tool map and defaults to ask", () => {
    expect(readApprovalSetting({ approval: "never" })).toBe("never");
    expect(
      readApprovalSetting({ approval: { a: "never", b: "bogus" } }),
    ).toEqual({ a: "never" });
    expect(readApprovalSetting({})).toBe("ask");
    expect(readApprovalSetting(undefined)).toBe("ask");
  });
});

describe("approvalFor", () => {
  it("applies a mode to every tool and lets unlisted tools ask", () => {
    expect(approvalFor("never", "x")).toBe("never");
    expect(approvalFor({ a: "never" }, "a")).toBe("never");
    expect(approvalFor({ a: "never" }, "b")).toBe("ask");
  });
});

describe("withToolApproval", () => {
  const tools = ["create", "search"];

  it("builds a per-tool map when tools differ", () => {
    expect(withToolApproval("ask", "search", "never", tools)).toEqual({
      create: "ask",
      search: "never",
    });
  });

  it("collapses to a single mode when every tool agrees", () => {
    expect(
      withToolApproval({ create: "never", search: "ask" }, "search", "never", tools),
    ).toBe("never");
    expect(
      withToolApproval({ create: "ask", search: "never" }, "search", "ask", tools),
    ).toBe("ask");
  });

  it("handles a tool that isn't in the known list", () => {
    expect(withToolApproval("ask", "other", "never", tools)).toEqual({
      create: "ask",
      search: "ask",
      other: "never",
    });
  });
});
