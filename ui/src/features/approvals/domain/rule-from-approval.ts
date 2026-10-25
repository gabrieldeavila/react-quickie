import { parseMcpToolName } from "@/features/chat/domain/mcp-tool-label";
import type {
  AlwaysAllowOption,
  ApprovalRuleScope,
} from "./always-allow.types";
import { normalizeCommand } from "./normalize-command";

const BASH_TOOL = "run_bash_command";

const SCOPE_LABELS: Record<ApprovalRuleScope, string> = {
  project: "Always allow in this project",
  global: "Always allow everywhere",
};

function commandOf(input: unknown): string | undefined {
  const command = (input as { command?: unknown } | undefined)?.command;
  return typeof command === "string" ? command : undefined;
}

function scopedOptions(tool: string, command?: string): AlwaysAllowOption[] {
  return (["project", "global"] as const).map((scope) => ({
    key: scope,
    label: SCOPE_LABELS[scope],
    request: {
      kind: "rule",
      scope,
      tool,
      ...(command === undefined ? {} : { command }),
    },
  }));
}

/**
 * The "Always allow" choices for a pending call. Bash saves the exact
 * command (none for chained/redirected ones); MCP saves its `mcp.json`
 * setting for the tool or the whole server; any other tool saves its name.
 */
export function alwaysAllowOptions(
  toolName: string,
  input: unknown,
): AlwaysAllowOption[] {
  if (toolName === BASH_TOOL) {
    const raw = commandOf(input);
    const command = raw === undefined ? undefined : normalizeCommand(raw);
    return command ? scopedOptions(toolName, command) : [];
  }

  const mcp = parseMcpToolName(toolName);
  if (mcp) {
    return [
      {
        key: "mcp-tool",
        label: `Always allow ${mcp.tool}`,
        request: { kind: "mcp", tool: toolName, wholeServer: false },
      },
      {
        key: "mcp-server",
        label: `Always allow every ${mcp.server} tool`,
        request: { kind: "mcp", tool: toolName, wholeServer: true },
      },
    ];
  }

  return scopedOptions(toolName);
}
