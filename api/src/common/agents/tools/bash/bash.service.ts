import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { tool } from 'ai';
import { z } from 'zod/v4';
import { ContextService } from 'src/common/context/context.service';
import { formatToolError, toolSuccess } from '../shared/format-tool-error';
import { BashApprovalService } from './bash-approval.service';
import { CommandPolicyService } from './command-policy.service';

const execFileAsync = promisify(execFile);
const COMMAND_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_SIZE = 50_000;

@Injectable()
export class BashToolsService {
  constructor(
    private readonly contextService: ContextService,
    private readonly policyService: CommandPolicyService,
    private readonly approvalService: BashApprovalService,
  ) {}

  createBashTools() {
    return {
      run_bash_command: tool({
        description:
          'Executa um comando Bash no workspace. Comandos de leitura locais são automáticos; comandos que alteram arquivos, acessam fora do workspace ou usam rede pedem aprovação. Comandos globais perigosos são bloqueados.',
        inputSchema: z.object({
          command: z
            .string()
            .trim()
            .min(1)
            .max(10_000)
            .describe('Comando Bash a ser executado.'),
        }),
        execute: async ({ command }: { command: string }) => {
          const rootPath = this.contextService.get('root');
          if (!rootPath)
            return formatToolError(
              'executar o comando Bash',
              new Error('Raiz do workspace não encontrada.'),
            );

          const assessment = this.policyService.assess(command, rootPath);
          if (assessment.decision === 'blocked') {
            return {
              success: false,
              approvalRequired: false,
              blocked: true,
              message: assessment.reason,
            };
          }

          if (assessment.decision === 'approval_required') {
            const approval = this.approvalService.create(
              command,
              rootPath,
              assessment.reason ?? 'Este comando requer aprovação.',
            );

            // O resultado precisa ser transmitido ao cliente para que o card
            // seja renderizado. O controller usa esta flag como condição de
            // parada do stream, evitando que o modelo inicie outro passo sem
            // abortar a resposta antes do tool-output chegar ao frontend.
            const requestContext = this.contextService.get();
            if (requestContext) requestContext.bashApprovalPending = true;

            return {
              success: false,
              approvalRequired: true,
              approvalId: approval.id,
              command: approval.command,
              cwd: approval.cwd,
              reason: approval.reason,
              message:
                'Aguardando aprovação do usuário para executar o comando.',
            };
          }

          return this.executeCommand(command, rootPath);
        },
      }),
    };
  }

  async executeCommand(command: string, cwd: string) {
    try {
      const { stdout, stderr } = await execFileAsync('bash', ['-lc', command], {
        cwd,
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_SIZE,
        windowsHide: true,
        env: process.env,
      });

      const output = [
        stdout ? `stdout:\n${stdout}` : '',
        stderr ? `stderr:\n${stderr}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
        .trim();

      return toolSuccess('Comando Bash executado com sucesso.', [
        output || '(sem saída)',
      ]);
    } catch (error) {
      return formatToolError('executar o comando Bash', error);
    }
  }
}
