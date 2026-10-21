/** What `execFile` rejects with when a command fails or is stopped. */
export type CommandFailure = {
  message?: string;
  code?: number | string | null;
  signal?: string | null;
  killed?: boolean;
  stdout?: string;
  stderr?: string;
};

function describeCause(failure: CommandFailure): string {
  if (failure.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER')
    return 'The output was too large and was cut.';
  if (failure.killed || failure.signal)
    return `The command was stopped (${failure.signal ?? 'killed'}), e.g. by the time limit.`;
  if (typeof failure.code === 'number')
    return `The command exited with code ${failure.code}.`;
  return failure.message?.trim() || 'The command failed.';
}

/**
 * The error text the model gets for a failed command: why it failed, then its
 * stdout and stderr, so a failing test or build shows its output.
 */
export function describeCommandFailure(failure: CommandFailure): string {
  return [
    describeCause(failure),
    failure.stdout ? `stdout:\n${failure.stdout}` : '',
    failure.stderr ? `stderr:\n${failure.stderr}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}
