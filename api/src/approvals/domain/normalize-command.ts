/** Chaining, pipes, redirects, substitution and newlines never match a rule. */
const COMPOUND_SYNTAX = /[;&|<>`\n\r]|\$\(/;

/**
 * The form a bash rule is saved and compared in: trimmed, with runs of
 * whitespace collapsed. `undefined` when the command can't be a rule.
 */
export function normalizeCommand(command: string): string | undefined {
  if (COMPOUND_SYNTAX.test(command)) return undefined;
  const normalized = command.trim().replace(/\s+/g, ' ');
  return normalized || undefined;
}
