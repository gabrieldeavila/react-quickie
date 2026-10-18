import { describe, expect, it } from "vitest";
import { isToolResult } from "./tool-result.helper";

describe("isToolResult", () => {
  it("accepts success and failure results", () => {
    expect(isToolResult({ success: true, message: "ok", data: [] })).toBe(
      true,
    );
    expect(isToolResult({ success: false, message: "no", error: "x" })).toBe(
      true,
    );
  });

  it("rejects values without success or message", () => {
    expect(isToolResult({ success: true })).toBe(false);
    expect(isToolResult({ message: "ok" })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isToolResult(null)).toBe(false);
    expect(isToolResult("ok")).toBe(false);
    expect(isToolResult(undefined)).toBe(false);
  });
});
