import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ContextService } from 'src/common/context/context.service';
import { GitToolsService } from './git.service';

// Runs the git tools against a real temporary repository.

type Executable = {
  execute?: (input: never, options: never) => unknown;
};

function run(tool: Executable, input: unknown) {
  return tool.execute!(
    input as never,
    {
      toolCallId: 'call',
      messages: [],
    } as never,
  ) as Promise<{ success: boolean; data?: string[]; error?: string }>;
}

describe('git tools (integration)', () => {
  let root: string;
  let tools: ReturnType<GitToolsService['createGitTools']>;

  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf-8' });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-git-'));
    git('init', '-q');
    git('config', 'user.name', 'Ana');
    git('config', 'user.email', 'ana@example.com');
    git('config', 'commit.gpgsign', 'false');
    tools = new GitToolsService({
      get: (key: string) => (key === 'root' ? root : undefined),
    } as unknown as ContextService).createGitTools();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('shows staged changes before the first commit', async () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'hello\n');
    git('add', 'a.txt');

    const result = await run(tools.get_uncommitted_changes, {});

    expect(result.success).toBe(true);
    expect(result.data).toContain('- A  a.txt');
    expect(result.data?.join('\n')).toContain('+hello');
  });

  it('commits, lists and reviews commits', async () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'hello\n');

    const commit = await run(tools.create_commit, {
      message: 'feat: "quoted" `ticks` $(echo hi)',
      files: ['.'],
    });
    expect(commit.success).toBe(true);

    const recent = await run(tools.get_recent_commits, { limit: 5 });
    expect(recent.data?.[0]).toContain('| Ana |');
    expect(recent.data?.[0]).toContain('feat: "quoted" `ticks` $(echo hi)');

    const review = await run(tools.review_commit, { commitHash: 'HEAD' });
    expect(review.data?.[0]).toContain('+hello');
  });

  it('never runs shell syntax from the input', async () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'x\n');
    git('add', '.');
    git('commit', '-qm', 'init');
    const marker = path.join(root, 'pwned');

    await run(tools.search_commits, {
      author: `"$(touch ${marker})"`,
      limit: 10,
    });
    const review = await run(tools.review_commit, {
      commitHash: `HEAD; touch ${marker}`,
    });

    expect(fs.existsSync(marker)).toBe(false);
    expect(review.success).toBe(false);
  });

  it('refuses a revision that would be read as an option', async () => {
    const output = path.join(root, 'out.txt');

    const review = await run(tools.review_commit, {
      commitHash: `--output=${output}`,
    });

    expect(review.success).toBe(false);
    expect(review.error).toContain('Invalid revision');
    expect(fs.existsSync(output)).toBe(false);
  });
});

describe('GitToolsService.createToolkit', () => {
  const service = new GitToolsService({
    get: () => undefined,
  } as unknown as ContextService);
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-git-kit-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('includes the git tools and asks before commits in a repository', async () => {
    execFileSync('git', ['init', '-q'], { cwd: dir });

    const toolkit = await service.createToolkit(dir);

    expect(Object.keys(toolkit.tools)).toEqual(
      expect.arrayContaining(['get_uncommitted_changes', 'create_commit']),
    );
    expect(toolkit.approvalPolicies.create_commit({})).toEqual({
      decision: 'ask',
    });
  });

  it('leaves them out outside a repository and without a root', async () => {
    // GIT_CEILING_DIRECTORIES keeps git from finding a repo above the tmp dir.
    const previous = process.env.GIT_CEILING_DIRECTORIES;
    process.env.GIT_CEILING_DIRECTORIES = path.dirname(dir);
    try {
      expect(await service.createToolkit(dir)).toEqual({
        tools: {},
        approvalPolicies: {},
      });
    } finally {
      if (previous === undefined) delete process.env.GIT_CEILING_DIRECTORIES;
      else process.env.GIT_CEILING_DIRECTORIES = previous;
    }
    expect(await service.createToolkit(undefined)).toEqual({
      tools: {},
      approvalPolicies: {},
    });
  });
});
