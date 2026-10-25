import type { AlwaysAllowRequest } from "../domain/always-allow.types";
import { allowMcpTool } from "./allow-mcp-tool";
import { saveApprovalRule } from "./save-approval-rule";

/** Sends an "Always allow" choice to the endpoint that stores it. */
export function saveAlwaysAllow(
  root: string,
  request: AlwaysAllowRequest,
): Promise<void> {
  if (request.kind === "mcp") {
    return allowMcpTool(root, request.tool, request.wholeServer);
  }
  const { scope, tool, command } = request;
  return saveApprovalRule(root, { scope, tool, command });
}
