import { getMcpApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import type { SignInRequest } from "../domain/sign-in-request.types";

const base = () => `${getMcpApiUrl()}/sign-in-requests`;

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
  } catch {
    // Not JSON: fall through to the status code.
  }
  return `Sign-in request failed (${response.status}).`;
}

async function post(path: string, root: string): Promise<Response> {
  const response = await authFetch(`${base()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ root }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response;
}

export async function fetchSignInRequests(
  root: string,
  signal?: AbortSignal,
): Promise<SignInRequest[]> {
  const query = new URLSearchParams({ root });
  const response = await authFetch(`${base()}?${query}`, { signal });
  if (!response.ok) throw new Error(await readError(response));
  return ((await response.json()) as { requests: SignInRequest[] }).requests;
}

/** The page to open; none when the server could sign in without one. */
export async function acceptSignInRequest(
  root: string,
  id: string,
): Promise<string | undefined> {
  const response = await post(`/${encodeURIComponent(id)}/accept`, root);
  return ((await response.json()) as { url?: string }).url;
}

export async function dismissSignInRequest(
  root: string,
  id: string,
): Promise<void> {
  await post(`/${encodeURIComponent(id)}/dismiss`, root);
}
