import { describe, expect, it } from "vitest";
import { parseSlashInput } from "./parse-slash-input";

describe("parseSlashInput", () => {
  it("reads the query after a leading slash", () => {
    expect(parseSlashInput("/")).toBe("");
    expect(parseSlashInput("/mcp")).toBe("mcp");
    expect(parseSlashInput("/landing-pages")).toBe("landing-pages");
    expect(parseSlashInput("/MCP")).toBe("mcp");
  });

  it("ignores paths, sentences and multi-line text", () => {
    for (const input of [
      "",
      "mcp",
      " /mcp",
      "/mcp ",
      "/usr/bin is missing",
      "/usr/bin",
      "/new\nchat",
      "/foo.bar",
      "//",
    ]) {
      expect(parseSlashInput(input)).toBeNull();
    }
  });
});
