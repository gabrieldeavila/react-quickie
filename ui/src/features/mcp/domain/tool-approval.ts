import type {
  McpApprovalMode,
  McpApprovalSetting,
} from "./mcp-server.types";

function isMode(value: unknown): value is McpApprovalMode {
  return value === "ask" || value === "never";
}

/** The server's `approval` from its raw entry; anything else means the default ("ask"). */
export function readApprovalSetting(config: unknown): McpApprovalSetting {
  const approval =
    config && typeof config === "object"
      ? (config as Record<string, unknown>).approval
      : undefined;
  if (isMode(approval)) return approval;
  if (approval && typeof approval === "object" && !Array.isArray(approval)) {
    return Object.fromEntries(
      Object.entries(approval).filter(([, mode]) => isMode(mode)),
    ) as Record<string, McpApprovalMode>;
  }
  return "ask";
}

/** Mode for one tool; tools missing from a per-tool map ask. */
export function approvalFor(
  setting: McpApprovalSetting,
  tool: string,
): McpApprovalMode {
  return typeof setting === "string" ? setting : (setting[tool] ?? "ask");
}

/**
 * The setting after changing one tool. Collapses to "ask" / "never" when
 * every known tool agrees, otherwise a per-tool map.
 */
export function withToolApproval(
  setting: McpApprovalSetting,
  tool: string,
  mode: McpApprovalMode,
  toolNames: string[],
): McpApprovalSetting {
  const names = toolNames.includes(tool) ? toolNames : [...toolNames, tool];
  const map = Object.fromEntries(
    names.map((name) => [name, name === tool ? mode : approvalFor(setting, name)]),
  ) as Record<string, McpApprovalMode>;
  const modes = new Set(Object.values(map));
  if (modes.size === 1) return [...modes][0];
  return map;
}
