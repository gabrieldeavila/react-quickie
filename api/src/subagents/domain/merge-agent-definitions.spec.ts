import type { AgentDefinition, AgentSource } from './agent-definition.types';
import { mergeAgentDefinitions } from './merge-agent-definitions';

const agent = (
  name: string,
  source: AgentSource,
  writes = false,
): AgentDefinition => ({
  name,
  description: `${name} from ${source}`,
  tools: [],
  maxSteps: 5,
  writes,
  instructions: 'x',
  source,
});

describe('mergeAgentDefinitions', () => {
  it('lets a project agent override a built-in by name, sorted by name', () => {
    const merged = mergeAgentDefinitions(
      [agent('reviewer', 'built-in'), agent('explorer', 'built-in')],
      [agent('explorer', 'project'), agent('docs', 'project')],
    );

    expect(merged.map(({ name, source }) => `${name}:${source}`)).toEqual([
      'docs:project',
      'explorer:project',
      'reviewer:built-in',
    ]);
  });
});
