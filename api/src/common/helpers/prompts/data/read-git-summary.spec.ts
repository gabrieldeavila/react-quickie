import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readGitSummary } from './read-git-summary';

describe('readGitSummary', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-git-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('reads the branch and changed files of a repository', async () => {
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
    fs.writeFileSync(path.join(dir, 'a.ts'), '');

    expect(await readGitSummary(dir)).toEqual({
      isRepository: true,
      branch: 'main',
      changedFiles: 1,
    });
  });

  it('says when the folder is not a repository', async () => {
    // GIT_CEILING_DIRECTORIES keeps git from finding a repo above the tmp dir.
    const previous = process.env.GIT_CEILING_DIRECTORIES;
    process.env.GIT_CEILING_DIRECTORIES = path.dirname(dir);
    try {
      expect(await readGitSummary(dir)).toEqual({ isRepository: false });
    } finally {
      if (previous === undefined) delete process.env.GIT_CEILING_DIRECTORIES;
      else process.env.GIT_CEILING_DIRECTORIES = previous;
    }
  });

  it('is undefined without a root or when git fails', async () => {
    expect(await readGitSummary(undefined)).toBeUndefined();
    expect(await readGitSummary(path.join(dir, 'missing'))).toBeUndefined();
  });
});
