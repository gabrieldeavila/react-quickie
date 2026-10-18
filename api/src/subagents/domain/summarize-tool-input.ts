const MAX_SUMMARY_LENGTH = 120;

/** Keys that best describe a call, in order of preference. */
const PREFERRED_KEYS = [
  'command',
  'path',
  'name',
  'parentPath',
  'currentPath',
  'sourcePath',
  'pattern',
  'regex',
  'query',
];

function truncate(text: string): string {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  return singleLine.length > MAX_SUMMARY_LENGTH
    ? `${singleLine.slice(0, MAX_SUMMARY_LENGTH - 1)}…`
    : singleLine;
}

function firstString(input: Record<string, unknown>): string | undefined {
  for (const key of PREFERRED_KEYS) {
    if (typeof input[key] === 'string' && input[key]) return input[key];
  }
  return Object.values(input).find(
    (value): value is string => typeof value === 'string' && value !== '',
  );
}

/** One short line describing a tool call's input, for the progress list. */
export function summarizeToolInput(input: unknown): string {
  if (typeof input === 'string') return truncate(input);
  if (!input || typeof input !== 'object') return '';

  const value = firstString(input as Record<string, unknown>);
  if (value !== undefined) return truncate(value);
  try {
    return truncate(JSON.stringify(input));
  } catch {
    return '';
  }
}
