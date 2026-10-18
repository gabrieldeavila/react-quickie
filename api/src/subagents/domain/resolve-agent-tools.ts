import type { AgentDefinition } from './agent-definition.types';
import { matchesToolGlob } from './tool-glob';
import { SUBAGENT_TOOL_NAME, WRITE_TOOL_NAMES } from './write-tool-names';

/**
 * The tool names an agent gets from the available pool: those its allowlist
 * matches, never `run_subagent` (no recursion), and no write tools unless
 * the agent is `writes: true`.
 */
export function resolveAgentTools(
  available: string[],
  { tools, writes }: Pick<AgentDefinition, 'tools' | 'writes'>,
): string[] {
  return available.filter(
    (name) =>
      name !== SUBAGENT_TOOL_NAME &&
      (writes || !WRITE_TOOL_NAMES.has(name)) &&
      tools.some((pattern) => matchesToolGlob(pattern, name)),
  );
}
