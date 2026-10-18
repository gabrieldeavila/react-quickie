import { describe, expect, it } from "vitest";
import { getMcpToolLabel, parseMcpToolName } from "./mcp-tool-label";

describe("parseMcpToolName", () => {
  it("splits server and tool", () => {
    expect(parseMcpToolName("mcp__github__search_issues")).toEqual({
      server: "github",
      tool: "search_issues",
    });
  });

  it("keeps later double underscores in the tool part", () => {
    expect(parseMcpToolName("mcp__db__run__query")).toEqual({
      server: "db",
      tool: "run__query",
    });
  });

  it("returns null for built-in or malformed names", () => {
    expect(parseMcpToolName("read_file")).toBeNull();
    expect(parseMcpToolName("mcp__only")).toBeNull();
    expect(parseMcpToolName("mcp____tool")).toBeNull();
    expect(parseMcpToolName("mcp__server__")).toBeNull();
  });
});

describe("getMcpToolLabel", () => {
  it("formats MCP tools as server › tool", () => {
    expect(getMcpToolLabel("mcp__github__search")).toBe("github › search");
  });

  it("returns null for other tools so callers keep their own label", () => {
    expect(getMcpToolLabel("run_bash_command")).toBeNull();
  });
});
