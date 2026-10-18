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
    .describe(
      'Mensagem descritiva do commit (ex: "feat: adiciona componente de header")',
    ),
  files: z
    .array(z.string())
    .optional()
    .default(['.'])
    .describe(
      'Lista de caminhos dos arquivos para adicionar ao commit. Use ["."] para commitar todos os arquivos modificados.',
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
    return toolSuccess('Nenhuma alteração pendente.', ['working tree clean']);
  }

  if (!(await hasHead(root))) {
    const staged = await runGit(root, ['diff', '--cached']);
    return toolSuccess(
      'Primeiro commit do repositório.',
      formatChanges(status, staged),
    );
  }

  const diff = await runGit(root, ['diff', 'HEAD']);
  return toolSuccess(
    'Alterações pendentes encontradas.',
    formatChanges(status, diff),
  );
}

/** Working-tree tools: pending changes and committing them. */
export function createGitChangesTools(getRoot: GetRoot) {
  return {
    create_commit: tool({
      description:
        'Realiza o stage (git add) de arquivos específicos e cria um novo commit (git commit) com a mensagem fornecida.',
      inputSchema: createCommitInputSchema,
      execute: ({ message, files }: { message: string; files: string[] }) =>
        withRoot(getRoot, 'criar o commit', async (root) => {
          await runGit(root, addArgs(files));
          const stdout = await runGit(root, commitArgs(message));
          return toolSuccess('Commit criado com sucesso.', [
            stdout.trim() || 'Commit criado com sucesso.',
          ]);
        }),
    }),

    get_uncommitted_changes: tool({
      description:
        'Verifica o status atual do repositório (arquivos modificados, adicionados ou deletados) e o diff do código. DEVE ser usada antes de criar um commit para entender o contexto, revisar o código e sugerir mensagens.',
      inputSchema: z.object({}),
      execute: () =>
        withRoot(getRoot, 'verificar alterações pendentes', readChanges),
    }),
  };
}
