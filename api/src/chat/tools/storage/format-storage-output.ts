import type { LintErrorResult } from 'src/common/helpers/linter.service';
import type { LineMatch } from 'src/common/helpers/storage/file-search.service';

const NO_MATCHES = 'No matches found.';

export function formatListOutput(title: string, items: string[]) {
  return items.length
    ? `${title}:\n${items.map((item) => `- ${item}`).join('\n')}`
    : NO_MATCHES;
}

export function formatSearchMatches(matches: LineMatch[]) {
  return matches.length
    ? matches
        .map((match) => `Line ${match.line}: ${match.content}`.trim())
        .join('\n')
    : NO_MATCHES;
}

type LintMessage = NonNullable<LintErrorResult['messages']>[number];

function formatLintMessage(file: string, message: LintMessage) {
  const location =
    message.column != null
      ? `${file}:${message.line}:${message.column}`
      : `${file}:${message.line}`;
  const rule = message.ruleId ? ` [${message.ruleId}]` : '';
  return `${location} - ${message.message}${rule}`.trim();
}

export function formatLintErrors(errors: LintErrorResult[]) {
  if (!errors.length) return 'No lint errors found.';
  return errors
    .flatMap((error) => {
      const file = error.filePath ?? 'Unknown file';
      const messages = error.messages ?? [];
      if (!messages.length) return [`${file} - No lint message available`];
      return messages.map((message) => formatLintMessage(file, message));
    })
    .join('\n');
}
