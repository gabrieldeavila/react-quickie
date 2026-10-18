import type { AgentDefinition } from './agent-definition.types';
import { createSubagentApprovalPolicy } from './subagent-approval-policy';

const agent = (name: string, writes: boolean): AgentDefinition => ({
  name,
  description: name,
  tools: [],
  maxSteps: 5,
  writes,
  instructions: 'x',
  source: 'built-in',
});

describe('createSubagentApprovalPolicy', () => {
  const policy = createSubagentApprovalPolicy([
    agent('explorer', false),
    agent('implementer', true),
  ]);

  it('asks before delegating to a write-capable agent', () => {
    expect(policy({ agent: 'implementer', task: 't' })).toEqual({
      decision: 'ask',
    });
  });

  it('runs read-only agents without asking', () => {
    expect(policy({ agent: 'explorer', task: 't' })).toEqual({
      decision: 'never',
    });
  });

  it('denies an unknown agent and lists the valid ones', () => {
    expect(policy({ agent: 'ghost', task: 't' })).toEqual({
      decision: 'always-deny',
      reason: 'Unknown agent "ghost". Available agents: explorer, implementer.',
    });
  });

  it('denies an unreadable input', () => {
    expect(policy(null).decision).toBe('always-deny');
  });
});
