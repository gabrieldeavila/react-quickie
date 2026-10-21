import { getInstructionsApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
  } catch {
    // Not JSON: fall through to the status code.
  }
  return `Instructions request failed (${response.status}).`;
}

/** `path` and `?root=` under `/instructions`; throws the API's message on failure. */
export async function requestInstructions(
  path: string,
  root: string | undefined,
  init?: RequestInit,
): Promise<Response> {
  const query = root ? `?root=${encodeURIComponent(root)}` : "";
  const response = await authFetch(
    `${getInstructionsApiUrl()}${path}${query}`,
    init,
  );
  if (!response.ok) throw new Error(await readError(response));
  return response;
}
