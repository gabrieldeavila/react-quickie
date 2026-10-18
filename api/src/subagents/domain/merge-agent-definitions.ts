import type { AgentDefinition } from './agent-definition.types';

/** Project agents override built-ins with the same name. Sorted by name. */
export function mergeAgentDefinitions(
  builtIns: AgentDefinition[],
  project: AgentDefinition[],
): AgentDefinition[] {
  const byName = new Map<string, AgentDefinition>();
  for (const definition of [...builtIns, ...project]) {
    byName.set(definition.name, definition);
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
