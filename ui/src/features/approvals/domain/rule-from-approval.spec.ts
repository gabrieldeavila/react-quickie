import { describe, expect, it } from "vitest";
import { alwaysAllowOptions } from "./rule-from-approval";

const requests = (toolName: string, input: unknown) =>
  alwaysAllowOptions(toolName, input).map((option) => option.request);

describe("alwaysAllowOptions", () => {
  it("saves the exact normalized Bash command, per project or everywhere", () => {
    expect(requests("run_bash_command", { command: " rm  -rf dist" })).toEqual([
      {
        kind: "rule",
        scope: "project",
        tool: "run_bash_command",
        command: "rm -rf dist",
      },
      {
        kind: "rule",
        scope: "global",
        tool: "run_bash_command",
        command: "rm -rf dist",
      },
    ]);
  });

  it("offers nothing for a chained or redirected command", () => {
    expect(requests("run_bash_command", { command: "a && rm -rf b" })).toEqual(
      [],
    );
    expect(requests("run_bash_command", { command: "echo x > f" })).toEqual([]);
    expect(requests("run_bash_command", {})).toEqual([]);
  });

  it("offers the MCP tool or its whole server", () => {
    const options = alwaysAllowOptions("mcp__drive__list_items", {});

    expect(options.map((option) => option.label)).toEqual([
      "Always allow list_items",
      "Always allow every drive tool",
    ]);
    expect(options.map((option) => option.request)).toEqual([
      { kind: "mcp", tool: "mcp__drive__list_items", wholeServer: false },
      { kind: "mcp", tool: "mcp__drive__list_items", wholeServer: true },
    ]);
  });

  it("saves the tool name for other tools", () => {
    expect(requests("create_commit", { message: "x" })).toEqual([
      { kind: "rule", scope: "project", tool: "create_commit" },
      { kind: "rule", scope: "global", tool: "create_commit" },
    ]);
  });
});
