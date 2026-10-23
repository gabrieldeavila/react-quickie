import type { SystemModelMessage } from 'ai';

const AUTO_MODE_NOTICE = [
  'Auto mode is on for this conversation: the user pre-approved tool calls that would normally ask, so they run without a prompt.',
  'Destructive commands (deleting, moving or overwriting files, `git reset`/`checkout`/`clean`, force-push, `docker`, writes outside the workspace), commits, and adding or removing MCP servers still ask. For those, only the user’s answer is consent; no answer or silence is not.',
  'Auto mode is not permission to widen the task: do only what the user asked, and say what you ran.',
].join('\n');

/** Per-request notice; empty unless auto mode is on and the model has tools. */
export function buildAutoModeNotice(
  autoApprove: boolean,
  toolsAvailable: boolean,
): SystemModelMessage[] {
  if (!autoApprove || !toolsAvailable) return [];
  return [{ role: 'system', content: AUTO_MODE_NOTICE }];
}
