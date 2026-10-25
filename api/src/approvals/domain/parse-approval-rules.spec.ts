import { parseApprovalRules } from './parse-approval-rules';

describe('parseApprovalRules', () => {
  it('reads global and project rules', () => {
    const text = JSON.stringify({
      global: [{ tool: 'mcp__drive__*', createdAt: '2026-10-22' }],
      projects: {
        '/code/app': [{ tool: 'run_bash_command', command: 'pnpm test' }],
      },
    });

    expect(parseApprovalRules(text)).toEqual({
      rules: {
        global: [{ tool: 'mcp__drive__*', createdAt: '2026-10-22' }],
        projects: {
          '/code/app': [
            { tool: 'run_bash_command', command: 'pnpm test', createdAt: '' },
          ],
        },
      },
    });
  });

  it('fills missing sections with empty ones', () => {
    expect(parseApprovalRules('{}').rules).toEqual({
      global: [],
      projects: {},
    });
  });

  it.each([
    ['bad JSON', '{ nope'],
    ['a wrong shape', '{ "global": "everything" }'],
    ['a rule without a tool', '{ "global": [{ "command": "ls" }] }'],
  ])('treats %s as no rules, with an error', (_label, text) => {
    const parsed = parseApprovalRules(text);

    expect(parsed.rules).toEqual({ global: [], projects: {} });
    expect(parsed.error).toEqual(expect.any(String));
  });
});
