import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ContextService } from 'src/common/context/context.service';
import { z } from 'zod/v4';
import { formatToolError, toolSuccess } from '../shared/format-tool-error';

const execAsync = promisify(exec);

type CommitItem = {
  hash: string;
  author: string;
  date: string;
  message: string;
};

function formatCommitLine(line: string): CommitItem {
  const [hash = '', author = '', date = '', message = ''] = line.split('|');
  return { hash, author, date, message };
}

function formatCommitItems(commits: CommitItem[]): string[] {
  return commits.map(
    (commit) =>
      `${commit.hash} | ${commit.author} | ${commit.date} | ${commit.message}`,
  );
}

function formatTextLines(title: string, lines: string[]): string[] {
  return [title, ...lines];
}

@Injectable()
export class GitToolsService {
  constructor(private readonly contextService: ContextService) {}

  createGitTools() {
    return {
      get_recent_commits: tool({
        description:
          'Recupera o histórico dos últimos commits do repositório Git. Retorna o hash, autor, data e mensagem.',
        inputSchema: z.object({
          limit: z
            .number()
            .optional()
            .default(5)
            .describe('Número máximo de commits para recuperar (ex: 5, 10).'),
        }),
        execute: async ({ limit }: { limit: number }) => {
          const rootPath = this.contextService.get('root');
          if (!rootPath) {
            return formatToolError(
              'obter os commits recentes',
              new Error('Raiz do projeto não encontrada.'),
            );
          }

          try {
            const command = `git log -n ${limit} --pretty=format:"%h|%an|%ai|%s"`;
            const { stdout } = await execAsync(command, { cwd: rootPath });
            const lines = stdout.split('\n').filter(Boolean);

            if (!lines.length) {
              return toolSuccess('Nenhum commit encontrado.', [
                'Nenhum item encontrado.',
              ]);
            }

            const commits = lines.map(formatCommitLine);
            return toolSuccess(
              'Commits recentes encontrados.',
              formatCommitItems(commits),
            );
          } catch (error) {
            return formatToolError('obter os commits recentes', error);
          }
        },
      }),

      create_commit: tool({
        description:
          'Realiza o stage (git add) de arquivos específicos e cria um novo commit (git commit) com a mensagem fornecida.',
        inputSchema: z.object({
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
        }),
        execute: async ({
          message,
          files,
        }: {
          message: string;
          files: string[];
        }) => {
          const rootPath = this.contextService.get('root');
          if (!rootPath) {
            return formatToolError(
              'criar o commit',
              new Error('Raiz do projeto não encontrada.'),
            );
          }

          try {
            const filesArg = files.join(' ');
            await execAsync(`git add ${filesArg}`, { cwd: rootPath });

            const safeMessage = message.replace(/"/g, '\\"');
            const { stdout } = await execAsync(
              `git commit -m "${safeMessage}"`,
              {
                cwd: rootPath,
              },
            );

            return toolSuccess('Commit criado com sucesso.', [
              stdout.trim() || 'Commit criado com sucesso.',
            ]);
          } catch (error) {
            return formatToolError('criar o commit', error);
          }
        },
      }),

      search_commits: tool({
        description:
          'Busca e lista commits antigos aplicando filtros específicos, como um autor exato ou um intervalo de datas (desde/até). Útil para auditorias ou entender o que foi feito num período.',
        inputSchema: z.object({
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
            .describe(
              'Número máximo de commits a serem retornados. Padrão é 10.',
            ),
        }),
        execute: async ({
          author,
          since,
          until,
          limit,
        }: {
          author?: string;
          since?: string;
          until?: string;
          limit: number;
        }) => {
          const rootPath = this.contextService.get('root');
          if (!rootPath) {
            return formatToolError(
              'buscar commits',
              new Error('Raiz do projeto não encontrada.'),
            );
          }

          try {
            let command = `git log -n ${limit} --pretty=format:"%h|%an|%ai|%s"`;

            if (author) command += ` --author="${author.replace(/"/g, '\\"')}"`;
            if (since) command += ` --since="${since.replace(/"/g, '\\"')}"`;
            if (until) command += ` --until="${until.replace(/"/g, '\\"')}"`;

            const { stdout } = await execAsync(command, { cwd: rootPath });
            const lines = stdout.split('\n').filter(Boolean);

            if (!lines.length) {
              return toolSuccess(
                'Nenhum commit encontrado para estes filtros.',
                ['Nenhum item encontrado.'],
              );
            }

            return toolSuccess(
              'Commits encontrados.',
              formatCommitItems(lines.map(formatCommitLine)),
            );
          } catch (error) {
            return formatToolError('buscar commits', error);
          }
        },
      }),

      get_uncommitted_changes: tool({
        description:
          'Verifica o status atual do repositório (arquivos modificados, adicionados ou deletados) e o diff do código. DEVE ser usada antes de criar um commit para entender o contexto, revisar o código e sugerir mensagens.',
        inputSchema: z.object({}),
        execute: async () => {
          const rootPath = this.contextService.get('root');
          if (!rootPath) {
            return formatToolError(
              'verificar alterações pendentes',
              new Error('Raiz do projeto não encontrada.'),
            );
          }

          try {
            const { stdout: statusOutput } = await execAsync('git status -s', {
              cwd: rootPath,
            });

            if (!statusOutput.trim()) {
              return toolSuccess('Nenhuma alteração pendente.', [
                'working tree clean',
              ]);
            }

            const files = statusOutput.split('\n').filter(Boolean);
            const { stdout: diffOutput } = await execAsync('git diff HEAD', {
              cwd: rootPath,
            });

            return toolSuccess('Alterações pendentes encontradas.', [
              ...formatTextLines(
                'Arquivos:',
                files.map((file) => `- ${file}`),
              ),
              '',
              ...formatTextLines('Diff:', [diffOutput.slice(0, 10000)]),
            ]);
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("bad revision 'HEAD'")
            ) {
              const { stdout: statusOutput } = await execAsync(
                'git status -s',
                { cwd: rootPath },
              );
              const { stdout: diffOutput } = await execAsync(
                'git diff --cached',
                { cwd: rootPath },
              );

              return toolSuccess('Primeiro commit do repositório.', [
                ...formatTextLines(
                  'Arquivos:',
                  statusOutput
                    .split('\n')
                    .filter(Boolean)
                    .map((file) => `- ${file}`),
                ),
                '',
                ...formatTextLines('Diff:', [diffOutput.slice(0, 10000)]),
              ]);
            }

            return formatToolError('verificar alterações pendentes', error);
          }
        },
      }),

      review_commit: tool({
        description:
          'Revisa os detalhes de um commit específico. Retorna os arquivos modificados e as linhas de código adicionadas/removidas (diff).',
        inputSchema: z.object({
          commitHash: z
            .string()
            .describe(
              'O hash do commit que deve ser revisado (ex: abc1234, HEAD~1).',
            ),
        }),
        execute: async ({ commitHash }: { commitHash: string }) => {
          const rootPath = this.contextService.get('root');
          if (!rootPath) {
            return formatToolError(
              'revisar o commit',
              new Error('Raiz do projeto não encontrada.'),
            );
          }

          try {
            const { stdout: filesChanged } = await execAsync(
              `git show --stat --oneline ${commitHash}`,
              { cwd: rootPath },
            );
            const { stdout: diffPatch } = await execAsync(
              `git show --patch --format= ${commitHash}`,
              { cwd: rootPath },
            );

            return toolSuccess('Resumo do commit.', [
              `${filesChanged.trim()}\n\nDiff:\n${diffPatch.trim()}`,
            ]);
          } catch (error) {
            return formatToolError('revisar o commit', error);
          }
        },
      }),
    };
  }
}
