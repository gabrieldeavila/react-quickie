import { resolveWorkspaceRoots } from './resolve-workspace-roots';

describe('resolveWorkspaceRoots', () => {
  const base = { dockerWorkspaceExists: true, repoParentDir: '/home/me/code' };

  it('prefers DOTY_WORKSPACE_ROOTS (comma-separated)', () => {
    const result = resolveWorkspaceRoots({
      ...base,
      env: {
        DOTY_WORKSPACE_ROOTS: ' /a , /b/c/ ,,',
        BASE_CODE_PATH: '/base',
      },
    });

    expect(result).toEqual({
      roots: ['/a', '/b/c'],
      source: 'DOTY_WORKSPACE_ROOTS',
    });
  });

  it('falls back to BASE_CODE_PATH', () => {
    const result = resolveWorkspaceRoots({
      ...base,
      env: { DOTY_WORKSPACE_ROOTS: ' ', BASE_CODE_PATH: '/base' },
    });

    expect(result).toEqual({ roots: ['/base'], source: 'BASE_CODE_PATH' });
  });

  it('falls back to /workspace when it exists', () => {
    const result = resolveWorkspaceRoots({ ...base, env: {} });

    expect(result).toEqual({
      roots: ['/workspace'],
      source: 'docker-workspace',
    });
  });

  it('falls back to the parent folder of the repo, never the home folder', () => {
    const result = resolveWorkspaceRoots({
      ...base,
      dockerWorkspaceExists: false,
      env: {},
    });

    expect(result).toEqual({ roots: ['/home/me/code'], source: 'repo-parent' });
  });
});
