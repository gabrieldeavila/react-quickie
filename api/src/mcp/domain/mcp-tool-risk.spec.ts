import { mcpToolRisk } from './mcp-tool-risk';

describe('mcpToolRisk', () => {
  it('lets read-only tools run', () => {
    expect(mcpToolRisk({ readOnlyHint: true })).toBe('changes');
    expect(mcpToolRisk({ readOnlyHint: true, openWorldHint: true })).toBe(
      'changes',
    );
  });

  it('lets additive writes inside a closed world run', () => {
    expect(mcpToolRisk({ destructiveHint: false, openWorldHint: false })).toBe(
      'changes',
    );
  });

  it.each([
    ['no hints', undefined],
    ['empty hints', {}],
    ['destructive', { destructiveHint: true, openWorldHint: false }],
    ['additive but open world (sends email)', { destructiveHint: false }],
    ['explicitly not read-only', { readOnlyHint: false }],
  ])('keeps asking for %s', (_label, annotations) => {
    expect(mcpToolRisk(annotations)).toBe('destructive');
  });
});
