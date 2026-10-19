import {
  buildEnvironmentBlock,
  type EnvironmentFacts,
} from './build-environment-block';

const facts: EnvironmentFacts = {
  client: 'vscode',
  workspaceRoots: ['/work/a', '/work/b'],
  activeRoot: '/work/a',
  platform: 'darwin',
  osRelease: '24.5.0',
  shell: '/bin/zsh',
  date: new Date(2026, 9, 18, 23, 30),
  git: { isRepository: true, branch: 'feat/x', changedFiles: 3 },
  modelRef: 'anthropic:claude-sonnet-5-5',
  toolsAvailable: true,
  instructionNames: ['landing-pages', 'forms'],
};

const blockFor = (overrides: Partial<EnvironmentFacts>) =>
  buildEnvironmentBlock({ ...facts, ...overrides }).content;

describe('buildEnvironmentBlock', () => {
  it('lists every fact in order', () => {
    expect(buildEnvironmentBlock(facts)).toEqual({
      role: 'system',
      content: [
        'Environment',
        '- Interface: VS Code extension',
        '- Workspace roots: /work/a, /work/b · active root: /work/a',
        '- Platform: darwin 24.5.0 · shell: /bin/zsh',
        '- Date: 2026-10-18',
        '- Git: branch feat/x, 3 changed files',
        '- Model: anthropic:claude-sonnet-5-5 · tools: available',
        '- Instructions in use: landing-pages, forms',
      ].join('\n'),
    });
  });

  it('names the web app and models without tools', () => {
    const block = blockFor({ client: 'web', toolsAvailable: false });

    expect(block).toContain('- Interface: web app');
    expect(block).toContain('tools: unavailable');
  });

  it('describes a folder outside git and leaves git out when unknown', () => {
    expect(blockFor({ git: { isRepository: false } })).toContain(
      '- Git: not a git repository',
    );
    expect(blockFor({ git: undefined })).not.toContain('Git:');
  });

  it('handles a detached HEAD and a single changed file', () => {
    expect(
      blockFor({ git: { isRepository: true, branch: null, changedFiles: 1 } }),
    ).toContain('- Git: detached HEAD, 1 changed file');
  });

  it('omits empty optional facts', () => {
    const block = blockFor({
      shell: undefined,
      instructionNames: [],
      activeRoot: undefined,
    });

    expect(block).toContain('- Platform: darwin 24.5.0\n');
    expect(block).toContain('active root: none');
    expect(block).not.toContain('Instructions in use');
  });
});
