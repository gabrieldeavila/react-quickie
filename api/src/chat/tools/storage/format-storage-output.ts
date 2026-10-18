import type { LintErrorResult } from 'src/common/helpers/linter.service';
import type { LineMatch } from 'src/common/helpers/storage/file-search.service';

const NO_MATCHES = 'Nenhuma ocorrência encontrada.';

export function formatListOutput(title: string, items: string[]) {
  return items.length
    ? `${title}:\n${items.map((item) => `- ${item}`).join('\n')}`
    : NO_MATCHES;
}

export function formatSearchMatches(matches: LineMatch[]) {
  return matches.length
    ? matches
        .map((match) => `Linha ${match.line}: ${match.content}`.trim())
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
  if (!errors.length) return 'Nenhum erro de lint encontrado.';
  return errors
    .flatMap((error) => {
      const file = error.filePath ?? 'Arquivo desconhecido';
      const messages = error.messages ?? [];
      if (!messages.length)
        return [`${file} - Nenhuma mensagem de lint disponível`];
      return messages.map((message) => formatLintMessage(file, message));
    })
    .join('\n');
}
