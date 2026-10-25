/** The API's `message`, or a generic text with the status code. */
export async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
  } catch {
    // Not JSON: fall through to the status code.
  }
  return `Request failed (${response.status}).`;
}
