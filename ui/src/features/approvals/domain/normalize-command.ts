/** Mirrors the API (`api/src/approvals/domain/normalize-command.ts`). */
const COMPOUND_SYNTAX = /[;&|<>`\n\r]|\$\(/;

/**
 * A Bash command as a rule saves it: trimmed, whitespace collapsed.
 * `undefined` for chained, piped or redirected commands (never a rule).
 */
export function normalizeCommand(command: string): string | undefined {
  if (COMPOUND_SYNTAX.test(command)) return undefined;
  const normalized = command.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}
