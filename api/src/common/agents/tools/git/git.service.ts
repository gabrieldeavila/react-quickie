import { tool } from 'ai';
import { z } from 'zod/v4';
import { Injectable } from '@nestjs/common';
import { ContextService } from 'src/common/context/context.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
          const rootPath = this.contextService.get('root')!;

          try {
            // Usa o formato resumido: hash - autor, tempo : mensagem
            const command = `git log -n ${limit} --pretty=format:"%h - %an, %ar : %s"`;
            const { stdout } = await execAsync(command, { cwd: rootPath });

            return { success: true, commits: stdout.split('\n') };
          } catch (error: any) {
            return { success: false, error: error.message };
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
          const rootPath = this.contextService.get('root')!;
          try {
            const filesArg = files.join(' ');

            await execAsync(`git add ${filesArg}`, { cwd: rootPath });

            const safeMessage = message.replace(/"/g, '\\"');

            const { stdout } = await execAsync(
              `git commit -m "${safeMessage}"`,
              { cwd: rootPath },
            );

            return { success: true, output: stdout };
          } catch (error: any) {
            return { success: false, error: error.message };
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
          const rootPath = this.contextService.get('root')!;

          try {
            let command = `git log -n ${limit} --pretty=format:"%h|%an|%ai|%s"`;

            if (author) {
              const safeAuthor = author.replace(/"/g, '\\"');
              command += ` --author="${safeAuthor}"`;
            }

            if (since) {
              const safeSince = since.replace(/"/g, '\\"');
              command += ` --since="${safeSince}"`;
            }

            if (until) {
              const safeUntil = until.replace(/"/g, '\\"');
              command += ` --until="${safeUntil}"`;
            }

            const { stdout } = await execAsync(command, { cwd: rootPath });

            if (!stdout.trim()) {
              return {
                success: true,
                commits: [],
                message: 'Nenhum commit encontrado para estes filtros.',
              };
            }

            const commits = stdout
              .split('\n')
              .filter(Boolean)
              .map((line) => {
                const [hash, commitAuthor, date, message] = line.split('|');
                return { hash, author: commitAuthor, date, message };
              });

            return { success: true, commits };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),

      get_uncommitted_changes: tool({
        description:
          'Verifica o status atual do repositório (arquivos modificados, adicionados ou deletados) e o diff do código. DEVE ser usada antes de criar um commit para entender o contexto, revisar o código e sugerir mensagens.',
        inputSchema: z.object({}),
        execute: async () => {
          const rootPath = this.contextService.get('root')!;

          try {
            const { stdout: statusOutput } = await execAsync('git status -s', {
              cwd: rootPath,
            });

            if (!statusOutput.trim()) {
              return {
                success: true,
                hasChanges: false,
                message: 'Nenhuma alteração pendente (working tree clean).',
              };
            }

            const files = statusOutput.split('\n').filter(Boolean);

            const { stdout: diffOutput } = await execAsync('git diff HEAD', {
              cwd: rootPath,
            });

            return {
              success: true,
              hasChanges: true,
              files,
              diff: diffOutput.slice(0, 10000),
            };
          } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            if (error?.message?.includes("bad revision 'HEAD'")) {
              const { stdout: statusOutput } = await execAsync(
                'git status -s',
                { cwd: rootPath },
              );
              const { stdout: diffOutput } = await execAsync(
                'git diff --cached',
                { cwd: rootPath },
              );
              return {
                success: true,
                hasChanges: true,
                files: statusOutput.split('\n').filter(Boolean),
                diff: diffOutput.slice(0, 10000),
                note: 'Primeiro commit do repositório.',
              };
            }
            return { success: false, error: error.message };
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
          const rootPath = this.contextService.get('root')!;

          try {
            const { stdout: filesChanged } = await execAsync(
              `git show --stat --oneline ${commitHash}`,
              { cwd: rootPath },
            );

            const { stdout: diffPatch } = await execAsync(
              `git show --patch --format= ${commitHash}`,
              { cwd: rootPath },
            );

            return {
              success: true,
              summary: filesChanged,
              diff: diffPatch,
            };
          } catch (error: any) {
            return { success: false, error: error.message };
          }
        },
      }),
    };
  }
}
