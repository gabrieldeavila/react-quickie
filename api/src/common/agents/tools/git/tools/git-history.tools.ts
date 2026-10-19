import { tool } from 'ai';
import { z } from 'zod/v4';
import { toolSuccess } from '../../shared/format-tool-error';
import {
  recentCommitsArgs,
  searchCommitsArgs,
  showPatchArgs,
  showStatArgs,
  type CommitSearch,
} from '../domain/build-git-args';
import { formatCommitLog } from '../domain/format-git-output';
import { runGit } from '../run-git';
import { withRoot, type GetRoot } from './with-root';

const NO_ITEMS = ['No items found.'];

const recentCommitsInputSchema = z.object({
  limit: z
    .number()
    .optional()
    .default(5)
    .describe('Maximum number of commits to fetch (e.g. 5, 10).'),
});

const searchCommitsInputSchema = z.object({
  author: z
    .string()
    .optional()
    .describe(
      'Filters commits by author name or email (e.g. "Gabriel", "geavila").',
    ),
  since: z
    .string()
    .optional()
    .describe(
      'Start date of the search. Accepts formats like "YYYY-MM-DD" or "2 weeks ago".',
    ),
  until: z
    .string()
    .optional()
    .describe(
      'End date of the search. Accepts formats like "YYYY-MM-DD" or "yesterday".',
    ),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe('Maximum number of commits to return. Defaults to 10.'),
});

const reviewCommitInputSchema = z.object({
  commitHash: z
    .string()
    .describe('Hash of the commit to review (e.g. abc1234, HEAD~1).'),
});

/** Read-only history tools: recent commits, search, one commit's diff. */
export function createGitHistoryTools(getRoot: GetRoot) {
  return {
    get_recent_commits: tool({
      description:
        'Fetches the latest commits of the Git repository. Returns the hash, author, date and message.',
      inputSchema: recentCommitsInputSchema,
      execute: ({ limit }: { limit: number }) =>
        withRoot(getRoot, 'get the recent commits', async (root) => {
          const commits = formatCommitLog(
            await runGit(root, recentCommitsArgs(limit)),
          );
          return commits.length
            ? toolSuccess('Recent commits found.', commits)
            : toolSuccess('No commits found.', NO_ITEMS);
        }),
    }),

    search_commits: tool({
      description:
        'Searches and lists older commits with specific filters, such as an exact author or a date range (since/until). Useful for audits or to see what was done in a period.',
      inputSchema: searchCommitsInputSchema,
      execute: (search: CommitSearch) =>
        withRoot(getRoot, 'search commits', async (root) => {
          const commits = formatCommitLog(
            await runGit(root, searchCommitsArgs(search)),
          );
          return commits.length
            ? toolSuccess('Commits found.', commits)
            : toolSuccess('No commits match these filters.', NO_ITEMS);
        }),
    }),

    review_commit: tool({
      description:
        'Reviews the details of a specific commit. Returns the changed files and the added/removed lines (diff).',
      inputSchema: reviewCommitInputSchema,
      execute: ({ commitHash }: { commitHash: string }) =>
        withRoot(getRoot, 'review the commit', async (root) => {
          const filesChanged = await runGit(root, showStatArgs(commitHash));
          const diffPatch = await runGit(root, showPatchArgs(commitHash));
          return toolSuccess('Commit summary.', [
            `${filesChanged.trim()}\n\nDiff:\n${diffPatch.trim()}`,
          ]);
        }),
    }),
  };
}
