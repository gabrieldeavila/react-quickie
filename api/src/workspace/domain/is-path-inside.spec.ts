import { isPathInside } from './is-path-inside';

describe('isPathInside', () => {
  it('accepts the parent itself and its descendants', () => {
    expect(isPathInside('/workspace', '/workspace')).toBe(true);
    expect(isPathInside('/workspace', '/workspace/app/src')).toBe(true);
    expect(isPathInside('/workspace/', '/workspace/app')).toBe(true);
  });

  it('rejects siblings that share a name prefix', () => {
    expect(isPathInside('/work', '/workspace2')).toBe(false);
    expect(isPathInside('/workspace', '/workspace2/app')).toBe(false);
  });

  it('rejects parents and unrelated paths', () => {
    expect(isPathInside('/workspace/app', '/workspace')).toBe(false);
    expect(isPathInside('/workspace', '/etc/passwd')).toBe(false);
    expect(isPathInside('/workspace', '/workspace/../etc')).toBe(false);
  });

  it('accepts names that start with two dots', () => {
    expect(isPathInside('/workspace', '/workspace/..hidden')).toBe(true);
  });
});
