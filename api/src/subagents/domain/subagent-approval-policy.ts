import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import type { AgentDefinition } from './agent-definition.types';

function readAgentName(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const agent = (input as { agent?: unknown }).agent;
  return typeof agent === 'string' ? agent : undefined;
}

export function unknownAgentReason(
  name: string | undefined,
  definitions: AgentDefinition[],
): string {
  const available = definitions.map((definition) => definition.name).join(', ');
  return `Unknown agent "${name ?? ''}". Available agents: ${available || 'none'}.`;
}

/**
 * Approval happens at delegation time: write-capable agents ask the user,
 * read-only agents run, unknown agents are refused with the valid names.
 */
export function createSubagentApprovalPolicy(
  definitions: AgentDefinition[],
): ToolApprovalPolicy {
  const byName = new Map(definitions.map((item) => [item.name, item]));

  return (input) => {
    const name = readAgentName(input);
    const definition = name ? byName.get(name) : undefined;
    if (!definition) {
      return {
        decision: 'always-deny',
        reason: unknownAgentReason(name, definitions),
      };
    }
    return { decision: definition.writes ? 'ask' : 'never' };
  };
}
