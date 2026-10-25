import { describe, expect, it } from "vitest";
import { normalizeCommand } from "./normalize-command";

describe("normalizeCommand", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeCommand("  rm   -rf\tdist ")).toBe("rm -rf dist");
  });

  it.each([
    "a; b",
    "a && b",
    "a | b",
    "a > f",
    "a < f",
    "echo $(x)",
    "`x`",
    "a\nb",
  ])("refuses %s", (command) => {
    expect(normalizeCommand(command)).toBeUndefined();
  });
});
