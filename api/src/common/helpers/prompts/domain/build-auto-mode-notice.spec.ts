import { buildAutoModeNotice } from './build-auto-mode-notice';

describe('buildAutoModeNotice', () => {
  it('is empty when auto mode is off or the model has no tools', () => {
    expect(buildAutoModeNotice(false, true)).toEqual([]);
    expect(buildAutoModeNotice(true, false)).toEqual([]);
  });

  it('says that destructive actions still ask', () => {
    const [notice] = buildAutoModeNotice(true, true);

    expect(notice.role).toBe('system');
    expect(notice.content).toMatch(/Auto mode is on/);
    expect(notice.content).toMatch(/Destructive commands .* still ask/);
    expect(notice.content).toMatch(/silence is not/);
  });
});
