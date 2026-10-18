import { isAllowedRoot } from './is-allowed-root';

describe('isAllowedRoot', () => {
  const allowed = ['/workspace', '/home/me/code'];

  it('accepts an allowed root and folders inside it', () => {
    expect(isAllowedRoot('/workspace', allowed)).toBe(true);
    expect(isAllowedRoot('/home/me/code/app', allowed)).toBe(true);
  });

  it('rejects folders outside every allowed root', () => {
    expect(isAllowedRoot('/etc', allowed)).toBe(false);
    expect(isAllowedRoot('/home/me', allowed)).toBe(false);
    expect(isAllowedRoot('/workspace2', allowed)).toBe(false);
  });

  it('rejects roots that contain or sit inside a denied folder', () => {
    const roots = ['/home/me'];
    const denied = ['/home/me/.doty'];

    expect(isAllowedRoot('/home/me', roots, denied)).toBe(false);
    expect(isAllowedRoot('/home/me/.doty/agents', roots, denied)).toBe(false);
    expect(isAllowedRoot('/home/me/code', roots, denied)).toBe(true);
  });

  it('rejects everything when no roots are configured', () => {
    expect(isAllowedRoot('/workspace', [])).toBe(false);
  });
});
