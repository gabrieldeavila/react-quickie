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

const NO_ITEMS = ['Nenhum item encontrado.'];

const recentCommitsInputSchema = z.object({
  limit: z
    .number()
    .optional()
    .default(5)
    .describe('Número máximo de commits para recuperar (ex: 5, 10).'),
});

const searchCommitsInputSchema = z.object({
  author: z
    .string()
    .optional()
    .describe(
      'Filtra os commits por nome ou email do autor (ex: "Gabriel", "geavila").',
    ),
  since: z
    .string()
    .optional()
    .describe(
      'Data inicial para a busca. Aceita formatos como "YYYY-MM-DD" ou "2 weeks ago".',
    ),
  until: z
    .string()
    .optional()
    .describe(
      'Data final para a busca. Aceita formatos como "YYYY-MM-DD" ou "yesterday".',
    ),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe('Número máximo de commits a serem retornados. Padrão é 10.'),
});

const reviewCommitInputSchema = z.object({
  commitHash: z
    .string()
    .describe('O hash do commit que deve ser revisado (ex: abc1234, HEAD~1).'),
});

/** Read-only history tools: recent commits, search, one commit's diff. */
export function createGitHistoryTools(getRoot: GetRoot) {
  return {
    get_recent_commits: tool({
      description:
        'Recupera o histórico dos últimos commits do repositório Git. Retorna o hash, autor, data e mensagem.',
      inputSchema: recentCommitsInputSchema,
      execute: ({ limit }: { limit: number }) =>
        withRoot(getRoot, 'obter os commits recentes', async (root) => {
          const commits = formatCommitLog(
            await runGit(root, recentCommitsArgs(limit)),
          );
          return commits.length
            ? toolSuccess('Commits recentes encontrados.', commits)
            : toolSuccess('Nenhum commit encontrado.', NO_ITEMS);
        }),
    }),

    search_commits: tool({
      description:
        'Busca e lista commits antigos aplicando filtros específicos, como um autor exato ou um intervalo de datas (desde/até). Útil para auditorias ou entender o que foi feito num período.',
      inputSchema: searchCommitsInputSchema,
      execute: (search: CommitSearch) =>
        withRoot(getRoot, 'buscar commits', async (root) => {
          const commits = formatCommitLog(
            await runGit(root, searchCommitsArgs(search)),
          );
          return commits.length
            ? toolSuccess('Commits encontrados.', commits)
            : toolSuccess(
                'Nenhum commit encontrado para estes filtros.',
                NO_ITEMS,
              );
        }),
    }),

    review_commit: tool({
      description:
        'Revisa os detalhes de um commit específico. Retorna os arquivos modificados e as linhas de código adicionadas/removidas (diff).',
      inputSchema: reviewCommitInputSchema,
      execute: ({ commitHash }: { commitHash: string }) =>
        withRoot(getRoot, 'revisar o commit', async (root) => {
          const filesChanged = await runGit(root, showStatArgs(commitHash));
          const diffPatch = await runGit(root, showPatchArgs(commitHash));
          return toolSuccess('Resumo do commit.', [
            `${filesChanged.trim()}\n\nDiff:\n${diffPatch.trim()}`,
          ]);
        }),
    }),
  };
}
