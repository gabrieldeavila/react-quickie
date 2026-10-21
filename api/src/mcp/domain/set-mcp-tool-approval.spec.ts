import { setMcpToolApproval } from './set-mcp-tool-approval';

describe('setMcpToolApproval', () => {
  const file = JSON.stringify({
    mcpServers: { gh: { type: 'http', url: 'https://x', approval: 'never' } },
  });
  const approvalOf = (text: string) =>
    (JSON.parse(text) as { mcpServers: { gh: { approval?: unknown } } })
      .mcpServers.gh.approval;

  it('sets a per-tool map', () => {
    expect(
      approvalOf(
        setMcpToolApproval(file, 'gh', { search: 'never', create: 'ask' }),
      ),
    ).toEqual({ search: 'never', create: 'ask' });
  });

  it('removes the key for the default ("ask")', () => {
    expect(approvalOf(setMcpToolApproval(file, 'gh', 'ask'))).toBeUndefined();
  });

  it('rejects anything else', () => {
    expect(() => setMcpToolApproval(file, 'gh', 'always')).toThrow(
      /Approval must be/,
    );
    expect(() => setMcpToolApproval(file, 'gh', { t: 'yes' })).toThrow(
      /Approval must be/,
    );
    expect(() => setMcpToolApproval(file, 'zzz', 'never')).toThrow(/not found/);
  });
});
