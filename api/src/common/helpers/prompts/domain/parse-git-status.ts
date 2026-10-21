export type GitSummary =
  | { isRepository: false }
  | { isRepository: true; branch: string | null; changedFiles: number };

/** The branch named by the `## …` header of `git status --porcelain=v1 -b`. */
function parseBranch(header: string): string | null {
  const text = header.replace(/^## /, '');
  const unborn = /^(?:No commits yet|Initial commit) on (.+)$/.exec(text);
  if (unborn) return unborn[1];
  if (text.startsWith('HEAD (no branch)')) return null;
  return text.split('...')[0].split(' ')[0] || null;
}

/** `git status --porcelain=v1 -b` output → branch and changed-file count. */
export function parseGitStatus(output: string): GitSummary {
  const lines = output.split('\n').filter((line) => line.trim());
  const header = lines[0]?.startsWith('## ') ? lines[0] : undefined;

  return {
    isRepository: true,
    branch: header ? parseBranch(header) : null,
    changedFiles: header ? lines.length - 1 : lines.length,
  };
}
