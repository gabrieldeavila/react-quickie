import {
  createMcpApprovalPolicies,
  resolveMcpApprovalMode,
} from './mcp-approval-policies';

describe('resolveMcpApprovalMode', () => {
  it('asks by default', () => {
    expect(resolveMcpApprovalMode(undefined, 'any')).toBe('ask');
  });

  it('applies a server-wide setting', () => {
    expect(resolveMcpApprovalMode('never', 'any')).toBe('never');
    expect(resolveMcpApprovalMode('ask', 'any')).toBe('ask');
  });

  it('uses the per-tool map and asks for unlisted tools', () => {
    const setting = { read: 'never', write: 'ask' } as const;
    expect(resolveMcpApprovalMode(setting, 'read')).toBe('never');
    expect(resolveMcpApprovalMode(setting, 'write')).toBe('ask');
    expect(resolveMcpApprovalMode(setting, 'delete')).toBe('ask');
  });
});

describe('createMcpApprovalPolicies', () => {
  it('maps ask → ask and never → never under the namespaced name', () => {
    const policies = createMcpApprovalPolicies(
      [
        { name: 'mcp__db__query', server: 'db', tool: 'query' },
        { name: 'mcp__gh__create', server: 'gh', tool: 'create' },
        { name: 'mcp__gh__read', server: 'gh', tool: 'read' },
      ],
      { db: 'never', gh: { read: 'never' } },
    );

    expect(policies.mcp__db__query({})).toEqual({ decision: 'never' });
    expect(policies.mcp__gh__create({})).toEqual({ decision: 'ask' });
    expect(policies.mcp__gh__read({})).toEqual({ decision: 'never' });
  });

  it('gives every tool an entry, so none runs unasked by omission', () => {
    const policies = createMcpApprovalPolicies(
      [{ name: 'mcp__x__t', server: 'x', tool: 't' }],
      {},
    );
    expect(policies.mcp__x__t({})).toEqual({ decision: 'ask' });
  });
});
