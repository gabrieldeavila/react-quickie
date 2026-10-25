import { getMcpApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import { readApiError } from "./read-api-error";

/** `POST /mcp/tools/always-allow`: sets `approval: never` in `mcp.json`. */
export async function allowMcpTool(
  root: string,
  tool: string,
  wholeServer: boolean,
): Promise<void> {
  const response = await authFetch(`${getMcpApiUrl()}/tools/always-allow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ root, tool, wholeServer }),
  });
  if (!response.ok) throw new Error(await readApiError(response));
}
