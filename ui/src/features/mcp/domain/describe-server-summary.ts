import type { McpServerView } from "./mcp-server.types";

function toolsLabel(count: number): string {
  return count === 1 ? "1 tool" : `${count} tools`;
}

/** The row's second line: "http · global · 12 tools", "stdio · project · disabled". */
export function describeServerSummary(server: McpServerView): string {
  const parts: string[] = [];
  if (server.transport !== "unknown") parts.push(server.transport);
  parts.push(server.scope);
  if (server.disabled) parts.push("disabled");
  else if (server.status === "untrusted") parts.push("not trusted");
  else if (server.toolCount !== undefined) parts.push(toolsLabel(server.toolCount));
  return parts.join(" · ");
}

/** What a project server would run, shown before the user trusts the file. */
export function describeServerLaunch(server: McpServerView): string {
  const config =
    server.config && typeof server.config === "object"
      ? (server.config as Record<string, unknown>)
      : {};
  if (typeof config.command === "string") {
    const args = Array.isArray(config.args)
      ? config.args.filter((arg): arg is string => typeof arg === "string")
      : [];
    return [config.command, ...args].join(" ");
  }
  if (typeof config.url === "string") return config.url;
  return "(invalid entry)";
}
