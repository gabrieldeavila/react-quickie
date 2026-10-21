import {
  buildAgentIdentity,
  REPLY_LANGUAGE_RULE,
} from './build-agent-identity';

describe('buildAgentIdentity', () => {
  it('describes a coding agent that acts on real files through tools', () => {
    const { role, content } = buildAgentIdentity({ toolsAvailable: true });

    expect(role).toBe('system');
    expect(content).toContain('You are Doty, an autonomous coding agent');
    expect(content).toMatch(/through tools/);
    expect(content).toMatch(/Your changes are real/);
    expect(content).toMatch(/read before you edit/);
    expect(content).toMatch(/verify it/);
    expect(content).toMatch(/approval/);
    expect(content).toMatch(/Never claim a check you didn't run/);
    expect(content).toContain('`path:line`');
  });

  it('says tools are unavailable when the model has no tool support', () => {
    const { content } = buildAgentIdentity({ toolsAvailable: false });

    expect(content).toContain('You are Doty');
    expect(content).toMatch(/Tools are unavailable/);
    expect(content).toMatch(/can't read, search or change files/);
    expect(content).not.toMatch(/Your changes are real/);
  });

  it("always tells the model to reply in the user's language", () => {
    for (const toolsAvailable of [true, false]) {
      expect(buildAgentIdentity({ toolsAvailable }).content).toContain(
        REPLY_LANGUAGE_RULE,
      );
    }
    expect(REPLY_LANGUAGE_RULE).toMatch(/Reply in the user's language/);
  });
});
