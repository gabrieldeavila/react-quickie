/** Project memory topics → "- key: <json>" lines, or null when empty. */
export function formatProjectMemory(
  topics: Record<string, unknown> | undefined,
): string | null {
  const entries = Object.entries(topics || {});
  if (!entries.length) return null;

  return entries
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join('\n');
}
