import { resolveWorkspacePath } from './resolve-workspace-path';
import { WorkspaceEscapeError } from './workspace-escape.error';

describe('resolveWorkspacePath', () => {
  const root = '/workspace/app';

  it('resolves relative paths against the root', () => {
    expect(resolveWorkspacePath(root, 'src/main.ts')).toBe(
      '/workspace/app/src/main.ts',
    );
    expect(resolveWorkspacePath(root, './src/../package.json')).toBe(
      '/workspace/app/package.json',
    );
  });

  it('treats empty input as the root', () => {
    expect(resolveWorkspacePath(root, '')).toBe(root);
    expect(resolveWorkspacePath(root, undefined)).toBe(root);
    expect(resolveWorkspacePath(root, '  ')).toBe(root);
  });

  it('rejects traversal out of the root', () => {
    expect(() => resolveWorkspacePath(root, '../../etc/passwd')).toThrow(
      WorkspaceEscapeError,
    );
    expect(() => resolveWorkspacePath(root, 'src/../../other')).toThrow(
      WorkspaceEscapeError,
    );
  });

  it('accepts absolute paths only when they are inside the root', () => {
    expect(resolveWorkspacePath(root, '/workspace/app/src')).toBe(
      '/workspace/app/src',
    );
    expect(() => resolveWorkspacePath(root, '/etc/passwd')).toThrow(
      WorkspaceEscapeError,
    );
  });

  it('rejects the root prefix trick', () => {
    expect(() => resolveWorkspacePath(root, '/workspace/app2/x')).toThrow(
      WorkspaceEscapeError,
    );
    expect(() => resolveWorkspacePath(root, '../app2/x')).toThrow(
      WorkspaceEscapeError,
    );
  });

  it('rejects denied folders even inside the root', () => {
    const denied = ['/workspace/app/.doty'];

    expect(() =>
      resolveWorkspacePath(root, '.doty/trusted-mcp.json', denied),
    ).toThrow(WorkspaceEscapeError);
    expect(resolveWorkspacePath(root, '.dotyfile', denied)).toBe(
      '/workspace/app/.dotyfile',
    );
  });
});
