import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LoggerService } from './logger.service';
import { ContextService } from '../context/context.service';

const execAsync = promisify(exec);

@Injectable()
export class LinterService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly contextService: ContextService,
  ) {}

  async formatAndLintFile(fullPath: string): Promise<void> {
    try {
      const targetDir = this.contextService.get('root')!;

      await execAsync(`npx prettier --write "${fullPath}"`, { cwd: targetDir });

      if (
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.js') ||
        fullPath.endsWith('.tsx')
      ) {
        await execAsync(`npx eslint --fix "${fullPath}"`, { cwd: targetDir });
      }

      this.loggerService.logDecision(`Linted and formatted ${fullPath}`);
    } catch (error: any) {
      console.warn(
        `Aviso: Falha ao rodar linter no arquivo ${fullPath}`,
        error.message,
        error
      );
    }
  }
}
