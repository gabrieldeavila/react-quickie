import { getMcpApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import type { McpServersResponse } from "../domain/mcp-server.types";
import { McpConflictError } from "./mcp-conflict.error";

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
  } catch {
    // Not JSON: fall through to the status code.
  }
  return `MCP request failed (${response.status}).`;
}

/**
 * Every MCP endpoint answers with the refreshed server list. A 409 (file
 * changed elsewhere) throws McpConflictError with the list the API sent.
 */
export async function requestMcp<
  T extends McpServersResponse = McpServersResponse,
>(path: string, init?: RequestInit): Promise<T> {
  const response = await authFetch(`${getMcpApiUrl()}${path}`, init);
  if (response.status === 409) {
    const body = (await response.json()) as McpServersResponse & {
      message?: string;
    };
    throw new McpConflictError(
      body.message ?? "The MCP config changed elsewhere.",
      body,
    );
  }
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

export function sendJson(
  method: "PUT" | "PATCH",
  body: unknown,
): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function postJson(body: unknown, signal?: AbortSignal): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  };
}
