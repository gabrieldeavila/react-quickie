import type { AgentDefinition } from './agent-definition.types';

function describeAgent({ name, description, writes }: AgentDefinition): string {
  return `- ${name}${writes ? ' (can edit files; the user approves each delegation)' : ''} — ${description}`;
}

/** Built per request so the main model sees the agents available for this project. */
export function buildRunSubagentDescription(
  definitions: AgentDefinition[],
): string {
  const agents = definitions.length
    ? definitions.map(describeAgent).join('\n')
    : '- (no agents available)';

  return [
    'Delegate a well-scoped task to a subagent. It works in its own context and returns only its final answer.',
    'Launch independent subagents in the same step so they run in parallel.',
    'Give a self-contained task: the subagent does not see this conversation.',
    '',
    'Agents:',
    agents,
  ].join('\n');
}
