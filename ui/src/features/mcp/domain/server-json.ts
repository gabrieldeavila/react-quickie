/** The "Edit JSON" view of one server entry. */
export function serverToJson(config: unknown): string {
  return JSON.stringify(config ?? {}, null, 2);
}

export type ParsedServerJson =
  | { ok: true; config: Record<string, unknown> }
  | { ok: false; error: string };

/** Text → server entry; the API validates the fields themselves. */
export function parseServerJson(text: string): ParsedServerJson {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: "That isn't valid JSON." };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "The server must be a JSON object." };
  }
  return { ok: true, config: value as Record<string, unknown> };
}
