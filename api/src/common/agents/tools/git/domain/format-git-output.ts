/** Diffs are cut here so one large change doesn't fill the context. */
export const MAX_DIFF_CHARS = 10_000;

function nonEmptyLines(stdout: string): string[] {
  return stdout.split('\n').filter(Boolean);
}

/** `hash|author|date|message` log lines → "hash | author | date | message". */
export function formatCommitLog(stdout: string): string[] {
  return nonEmptyLines(stdout).map((line) => {
    const [hash = '', author = '', date = '', message = ''] = line.split('|');
    return `${hash} | ${author} | ${date} | ${message}`;
  });
}

/** `git status -s` + diff → the lines the uncommitted-changes tool returns. */
export function formatChanges(statusOutput: string, diffOutput: string) {
  return [
    'Arquivos:',
    ...nonEmptyLines(statusOutput).map((file) => `- ${file}`),
    '',
    'Diff:',
    diffOutput.slice(0, MAX_DIFF_CHARS),
  ];
}
