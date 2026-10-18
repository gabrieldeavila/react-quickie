type OutputLike = {
  status?: unknown;
  agent?: unknown;
  text?: unknown;
  needsApproval?: unknown;
  error?: unknown;
  // Before Phase 4: { success, subagentId, result | error }
  success?: unknown;
  result?: unknown;
  // Older turns may arrive truncated by the UI.
  truncated?: unknown;
  preview?: unknown;
};

const NO_ANSWER = 'The subagent finished without a final answer.';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function heldCallsNote(needsApproval: unknown): string {
  if (!Array.isArray(needsApproval) || needsApproval.length === 0) return '';
  const lines = needsApproval
    .filter((item): item is string => typeof item === 'string')
    .map((item) => `- \`${item}\``);
  return `\n\nNot run, they need the user's approval (run them yourself if still needed):\n${lines.join('\n')}`;
}

function summarizeLegacy(output: OutputLike): string {
  if (output.success === false) {
    return `The subagent failed: ${asString(output.error) ?? 'unknown error'}`;
  }
  return asString(output.result) ?? NO_ANSWER;
}

/**
 * What the parent model sees of a subagent run: the final answer and the
 * held-back calls, never the step transcript.
 */
export function summarizeSubagentOutput(output: unknown): string {
  if (typeof output === 'string') return output;
  if (!output || typeof output !== 'object') return NO_ANSWER;
  const value = output as OutputLike;

  if (value.truncated === true) return asString(value.preview) ?? NO_ANSWER;
  if (value.status === undefined && 'success' in value) {
    return summarizeLegacy(value);
  }

  switch (value.status) {
    case 'failed':
      return `The subagent failed: ${asString(value.error) ?? 'unknown error'}${heldCallsNote(value.needsApproval)}`;
    case 'aborted':
      return 'The subagent was interrupted before finishing.';
    case 'completed':
      return `${asString(value.text) ?? NO_ANSWER}${heldCallsNote(value.needsApproval)}`;
    default:
      return 'The subagent did not finish.';
  }
}
