import { describe, expect, it } from 'vitest';
import { resolveOpenFilePath } from './resolve-open-file-path';

const folders = ['/work/app', '/work/lib'];

describe('resolveOpenFilePath', () => {
  it('resolves relative paths against the chat root', () => {
    expect(resolveOpenFilePath('src/a.ts', '/work/lib', folders)).toBe('/work/lib/src/a.ts');
  });

  it('falls back to the first folder when the root is unknown', () => {
    expect(resolveOpenFilePath('src/a.ts', '/elsewhere', folders)).toBe('/work/app/src/a.ts');
    expect(resolveOpenFilePath('src/a.ts', undefined, folders)).toBe('/work/app/src/a.ts');
  });

  it('accepts absolute paths inside a workspace folder', () => {
    expect(resolveOpenFilePath('/work/lib/x.ts', undefined, folders)).toBe('/work/lib/x.ts');
  });

  it('rejects paths outside every workspace folder', () => {
    expect(resolveOpenFilePath('../../etc/passwd', '/work/app', folders)).toBeNull();
    expect(resolveOpenFilePath('/work/application/a.ts', undefined, folders)).toBeNull();
    expect(resolveOpenFilePath('a.ts', undefined, [])).toBeNull();
  });
});
