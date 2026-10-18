import { resolveTargetDir, validateProjectName } from './resolve-project-path';

describe('validateProjectName', () => {
  it('trims and defaults the name', () => {
    expect(validateProjectName('  app  ')).toBe('app');
    expect(validateProjectName(undefined)).toBe('my-react-app');
    expect(validateProjectName('')).toBe('my-react-app');
  });

  it.each(['.', '..', 'a/b', '../x', '   '])('rejects %p', (name) => {
    expect(() => validateProjectName(name)).toThrow('invalid');
  });
});

describe('resolveTargetDir', () => {
  it('uses an absolute target as is', () => {
    expect(resolveTargetDir(undefined, '/tmp/x/../y')).toBe('/tmp/y');
  });

  it('resolves a relative target under the root', () => {
    expect(resolveTargetDir('/work', 'apps')).toBe('/work/apps');
  });

  it('falls back to the root', () => {
    expect(resolveTargetDir('/work', undefined)).toBe('/work');
  });

  it('needs a root for relative or missing targets', () => {
    expect(() => resolveTargetDir(undefined, 'apps')).toThrow(
      'A relative path needs',
    );
    expect(() => resolveTargetDir(undefined, undefined)).toThrow(
      'Give a target folder',
    );
  });
});
