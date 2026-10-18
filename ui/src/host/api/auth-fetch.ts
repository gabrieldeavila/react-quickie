import { getRuntimeConfig } from "../runtime-config";

/** `Authorization` header for the API token (VSCode); empty in the browser. */
export function authHeaders(): Record<string, string> {
  const { token } = getRuntimeConfig();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** `fetch` that adds the API token when the host provided one. */
export function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  for (const [name, value] of Object.entries(authHeaders())) {
    headers.set(name, value);
  }
  return fetch(input, { ...init, headers });
}
