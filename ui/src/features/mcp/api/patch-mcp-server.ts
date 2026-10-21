import type {
  McpApprovalSetting,
  McpScope,
  McpServersResponse,
} from "../domain/mcp-server.types";
import { requestMcp, sendJson } from "./request-mcp";

export type McpServerPatch = {
  scope: McpScope;
  baseHash: string | null;
  disabled?: boolean;
  toolApproval?: McpApprovalSetting;
};

/** `PATCH /mcp/servers/:name`: enable/disable or set per-tool approval. */
export function patchMcpServer(
  root: string,
  name: string,
  patch: McpServerPatch,
): Promise<McpServersResponse> {
  return requestMcp(
    `/servers/${encodeURIComponent(name)}?root=${encodeURIComponent(root)}`,
    sendJson("PATCH", patch),
  );
}
