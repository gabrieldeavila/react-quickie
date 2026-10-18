import type { AgentDefinition } from './agent-definition.types';
import { buildRunSubagentDescription } from './build-run-subagent-description';

const agent = (name: string, writes = false): AgentDefinition => ({
  name,
  description: `${name} description`,
  tools: [],
  maxSteps: 5,
  writes,
  instructions: 'x',
  source: 'built-in',
});

describe('buildRunSubagentDescription', () => {
  it('lists each agent and flags the write-capable ones', () => {
    const description = buildRunSubagentDescription([
      agent('explorer'),
      agent('implementer', true),
    ]);

    expect(description).toContain('- explorer — explorer description');
    expect(description).toContain(
      '- implementer (can edit files; the user approves each delegation) — implementer description',
    );
    expect(description).toContain('same step');
  });

  it('says when no agent is available', () => {
    expect(buildRunSubagentDescription([])).toContain('(no agents available)');
  });
});
