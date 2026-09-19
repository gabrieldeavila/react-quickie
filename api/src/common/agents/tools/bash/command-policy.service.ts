import { Injectable } from '@nestjs/common';
import { resolve, sep } from 'path';

export type CommandDecision = 'allowed' | 'approval_required' | 'blocked';

export interface CommandAssessment {
  decision: CommandDecision;
  reason?: string;
}

@Injectable()
export class CommandPolicyService {
  assess(command: string, rootPath: string): CommandAssessment {
    const normalized = command.trim();

    if (
      /(^|[;&|])\s*(sudo|shutdown|reboot|mkfs|fdisk|dd)\b/i.test(normalized)
    ) {
      return {
        decision: 'blocked',
        reason: 'Comando administrativo ou destrutivo global não permitido.',
      };
    }

    if (
      /(\/etc|\/usr|\/System|\/Library|~\/Library|\/var\/root)/i.test(
        normalized,
      )
    ) {
      return {
        decision: 'blocked',
        reason: 'Acesso a diretórios globais do computador não permitido.',
      };
    }

    if (
      /\b(rm|mv|chmod|chown|install|touch|mkdir|rmdir|git\s+(reset|clean|checkout)|npm\s+(install|uninstall)|pnpm\s+(install|remove|add)|yarn\s+(add|remove)|docker|curl|wget)\b/i.test(
        normalized,
      )
    ) {
      return {
        decision: 'approval_required',
        reason:
          'O comando pode alterar arquivos, instalar dependências ou acessar recursos externos.',
      };
    }

    if (/[>|]|>>|\$\(|`/.test(normalized)) {
      return {
        decision: 'approval_required',
        reason: 'O comando contém redirecionamento ou execução encadeada.',
      };
    }

    const outsideWorkspace = this.referencesOutsideWorkspace(
      normalized,
      rootPath,
    );
    if (outsideWorkspace) {
      return {
        decision: 'approval_required',
        reason: 'O comando pode acessar arquivos fora do workspace atual.',
      };
    }

    return { decision: 'allowed' };
  }

  private referencesOutsideWorkspace(
    command: string,
    rootPath: string,
  ): boolean {
    const absolutePaths = command.match(/(?:^|[\s])\/(?:[^\s"']+)/g) ?? [];
    const resolvedRoot = resolve(rootPath);

    return absolutePaths.some((value) => {
      const candidate = resolve(value.trim());
      return (
        candidate !== resolvedRoot &&
        !candidate.startsWith(`${resolvedRoot}${sep}`)
      );
    });
  }
}
