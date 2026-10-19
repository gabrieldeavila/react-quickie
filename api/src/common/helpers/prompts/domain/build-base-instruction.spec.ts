import {
  buildBaseInstruction,
  REPLY_LANGUAGE_RULE,
} from './build-base-instruction';

describe('buildBaseInstruction', () => {
  it('names the project root', () => {
    const message = buildBaseInstruction('/work/app');
    expect(message.role).toBe('system');
    expect(message.content).toContain('The user project is /work/app');
  });

  it("tells the model to reply in the user's language", () => {
    expect(buildBaseInstruction('/work/app').content).toContain(
      REPLY_LANGUAGE_RULE,
    );
    expect(REPLY_LANGUAGE_RULE).toMatch(/Reply in the user's language/);
  });
});
