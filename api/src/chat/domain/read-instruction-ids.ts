/** The chat body's `instructions` field → instruction ids; anything else is dropped. */
export function readInstructionIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (id): id is string => typeof id === 'string' && id.trim() !== '',
  );
}
