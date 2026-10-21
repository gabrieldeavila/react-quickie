import { describe, expect, it } from "vitest";
import { parseHostMessage } from "./host-messages";

const selection = {
  type: "insertSelection",
  file: "a.ts",
  startLine: 1,
  endLine: 2,
  languageId: "typescript",
  text: "x",
};

describe("parseHostMessage", () => {
  it("reads selections", () => {
    expect(parseHostMessage(selection)).toEqual(selection);
  });

  it("reads known title-bar commands", () => {
    expect(parseHostMessage({ type: "runCommand", command: "newChat" })).toEqual(
      { type: "runCommand", command: "newChat" },
    );
    expect(
      parseHostMessage({ type: "runCommand", command: "showHistory", extra: 1 }),
    ).toEqual({ type: "runCommand", command: "showHistory" });
  });

  it("rejects unknown commands and malformed messages", () => {
    expect(parseHostMessage(null)).toBeNull();
    expect(parseHostMessage({ type: "runCommand", command: "rm" })).toBeNull();
    expect(parseHostMessage({ type: "runCommand", command: "openMcp" })).toEqual(
      { type: "runCommand", command: "openMcp" },
    );
    expect(parseHostMessage({ type: "insertSelection", file: "a.ts" })).toBeNull();
    expect(parseHostMessage({ type: "other" })).toBeNull();
  });
});
