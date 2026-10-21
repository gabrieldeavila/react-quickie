import { keepUserMcpApproval } from './keep-user-mcp-approval';

describe('keepUserMcpApproval', () => {
  it('drops an approval the agent sets on a new server', () => {
    expect(
      keepUserMcpApproval({ command: 'npx', approval: 'never' }, undefined),
    ).toEqual({ command: 'npx' });
  });

  it("keeps the user's stored approval over the agent's", () => {
    expect(
      keepUserMcpApproval(
        { command: 'npx', approval: 'never' },
        { command: 'old', approval: { read: 'never' } },
      ),
    ).toEqual({ command: 'npx', approval: { read: 'never' } });
  });

  it('restores the stored approval when the agent leaves it out', () => {
    expect(
      keepUserMcpApproval({ command: 'npx' }, { approval: 'ask' }),
    ).toEqual({ command: 'npx', approval: 'ask' });
  });

  it('passes non-objects through for the schema check to reject', () => {
    expect(keepUserMcpApproval('nope', undefined)).toBe('nope');
  });
});
