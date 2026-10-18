import type { ModelUsage } from 'src/llm/domain/model-usage.types';
import type { SubagentProgress } from './subagent-progress';
import { SUBAGENT_TOOL_NAME } from './write-tool-names';

type ToolResultLike = {
  type: string;
  toolName?: string;
  output?: unknown;
  preliminary?: boolean;
};

/**
 * The usage of a finished `run_subagent` call, read from the parent's
 * stream. Preliminary results are progress updates of the same run, so only
 * the final one counts.
 */
export function readSubagentUsage(
  part: ToolResultLike,
): ModelUsage | undefined {
  if (part.type !== 'tool-result' || part.toolName !== SUBAGENT_TOOL_NAME) {
    return undefined;
  }
  if (part.preliminary) return undefined;
  return (part.output as Partial<SubagentProgress> | undefined)?.usage;
}
