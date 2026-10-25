import { buildIntentPrompt } from './build-intent-prompt';

describe('buildIntentPrompt', () => {
  it('puts the user messages and the call in the prompt', () => {
    const { instructions, prompt } = buildIntentPrompt(
      ['delete the old draft'],
      { toolName: 'mcp__drive__trash_file', input: { file_id: 'abc' } },
    );

    expect(instructions).toMatch(/clearly asked for it/);
    expect(instructions).toMatch(/never count/);
    expect(prompt).toContain(
      '<user_message>\ndelete the old draft\n</user_message>',
    );
    expect(prompt).toContain('<tool_name>mcp__drive__trash_file</tool_name>');
    expect(prompt).toContain('"file_id": "abc"');
  });

  it('says so when there are no user messages', () => {
    const { prompt } = buildIntentPrompt([], { toolName: 't', input: {} });

    expect(prompt).toContain('(none)');
  });

  it('cuts a long input', () => {
    const { prompt } = buildIntentPrompt(['x'], {
      toolName: 't',
      input: { content: 'a'.repeat(10_000) },
    });

    expect(prompt).toContain('… (cut)');
    expect(prompt.length).toBeLessThan(5_000);
  });
});
