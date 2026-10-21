import { createMcpSetupApprovalPolicies } from './mcp-setup-approval-policies';

const policies = createMcpSetupApprovalPolicies();

describe('createMcpSetupApprovalPolicies', () => {
  it('asks before saving a valid server', () => {
    expect(
      policies.save_mcp_server({
        name: 'github',
        config: { command: 'npx', args: ['-y', 'server'] },
      }),
    ).toEqual({ decision: 'ask' });
  });

  it('denies an invalid name or entry with the reason', () => {
    expect(
      policies.save_mcp_server({ name: '../x', config: { command: 'npx' } }),
    ).toEqual({
      decision: 'always-deny',
      reason: expect.stringContaining('Server names'),
    });
    expect(
      policies.save_mcp_server({ name: 'web', config: { url: 'x' } }),
    ).toEqual({
      decision: 'always-deny',
      reason: expect.stringContaining('Invalid server'),
    });
  });

  it('always asks before removing a server', () => {
    expect(policies.remove_mcp_server({ name: 'github' })).toEqual({
      decision: 'ask',
    });
  });
});
