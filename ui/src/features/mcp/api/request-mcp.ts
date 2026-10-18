import { getMcpApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import type { McpServersResponse } from "../domain/mcp-server.types";

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
  } catch {
    // Not JSON: fall through to the status code.
  }
  return `Falha na requisição MCP (${response.status}).`;
}

/** Every MCP endpoint answers with the refreshed server list. */
export async function requestMcp(
  path: string,
  init?: RequestInit,
): Promise<McpServersResponse> {
  const response = await authFetch(`${getMcpApiUrl()}${path}`, init);
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as McpServersResponse;
}

export function postJson(body: unknown, signal?: AbortSignal): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  };
}
