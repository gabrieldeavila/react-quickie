import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { resolveWorkspacePath } from '../domain/resolve-workspace-path';
import { WorkspaceEscapeError } from '../domain/workspace-escape.error';
import { toRealPath } from './to-real-path';

describe('toRealPath', () => {
  let sandbox: string;
  let root: string;
  let outside: string;

  beforeEach(() => {
    sandbox = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'doty-real-path-')),
    );
    root = path.join(sandbox, 'root');
    outside = path.join(sandbox, 'outside');
    fs.mkdirSync(root);
    fs.mkdirSync(outside);
    fs.writeFileSync(path.join(outside, 'secret.txt'), 'secret');
    fs.symlinkSync(outside, path.join(root, 'escape'));
  });

  afterEach(() => {
    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it('follows symlinks to their real location', () => {
    expect(toRealPath(path.join(root, 'escape', 'secret.txt'))).toBe(
      path.join(outside, 'secret.txt'),
    );
  });

  it('resolves paths that do not exist yet through the nearest real folder', () => {
    expect(toRealPath(path.join(root, 'escape', 'new', 'file.ts'))).toBe(
      path.join(outside, 'new', 'file.ts'),
    );
    expect(toRealPath(path.join(root, 'new', 'file.ts'))).toBe(
      path.join(root, 'new', 'file.ts'),
    );
  });

  it('lets the resolver catch a symlink escape the lexical check misses', () => {
    const lexical = resolveWorkspacePath(root, 'escape/secret.txt');

    expect(lexical).toBe(path.join(root, 'escape', 'secret.txt'));
    expect(() =>
      resolveWorkspacePath(toRealPath(root), toRealPath(lexical)),
    ).toThrow(WorkspaceEscapeError);
  });
});
