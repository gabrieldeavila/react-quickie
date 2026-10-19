import { tool } from 'ai';
import { z } from 'zod/v4';
import { toolSuccess } from '../../shared/format-tool-error';
import { addArgs, commitArgs } from '../domain/build-git-args';
import { formatChanges } from '../domain/format-git-output';
import { runGit } from '../run-git';
import { withRoot, type GetRoot } from './with-root';

const createCommitInputSchema = z.object({
  message: z
    .string()
    .describe('Descriptive commit message (e.g. "feat: add header component")'),
  files: z
    .array(z.string())
    .optional()
    .default(['.'])
    .describe(
      'File paths to add to the commit. Use ["."] to commit every changed file.',
    ),
});

/** False before the first commit, when there is no HEAD to diff against. */
function hasHead(root: string): Promise<boolean> {
  return runGit(root, ['rev-parse', '--verify', '--quiet', 'HEAD']).then(
    () => true,
    () => false,
  );
}

/** Status + diff against HEAD; a repository without commits diffs the index. */
async function readChanges(root: string) {
  const status = await runGit(root, ['status', '-s']);
  if (!status.trim()) {
    return toolSuccess('No uncommitted changes.', ['working tree clean']);
  }

  if (!(await hasHead(root))) {
    const staged = await runGit(root, ['diff', '--cached']);
    return toolSuccess(
      'First commit of the repository.',
      formatChanges(status, staged),
    );
  }

  const diff = await runGit(root, ['diff', 'HEAD']);
  return toolSuccess('Uncommitted changes found.', formatChanges(status, diff));
}

/** Working-tree tools: pending changes and committing them. */
export function createGitChangesTools(getRoot: GetRoot) {
  return {
    create_commit: tool({
      description:
        'Stages specific files (git add) and creates a new commit (git commit) with the given message.',
      inputSchema: createCommitInputSchema,
      execute: ({ message, files }: { message: string; files: string[] }) =>
        withRoot(getRoot, 'create the commit', async (root) => {
          await runGit(root, addArgs(files));
          const stdout = await runGit(root, commitArgs(message));
          return toolSuccess('Commit created.', [
            stdout.trim() || 'Commit created.',
          ]);
        }),
    }),

    get_uncommitted_changes: tool({
      description:
        'Shows the current repository status (changed, added or deleted files) and the code diff. MUST be used before creating a commit, to understand the context, review the code and suggest messages.',
      inputSchema: z.object({}),
      execute: () =>
        withRoot(getRoot, 'check uncommitted changes', readChanges),
    }),
  };
}
