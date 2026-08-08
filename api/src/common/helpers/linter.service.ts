import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LoggerService } from './logger.service';
import { ContextService } from '../context/context.service';

const execAsync = promisify(exec);

export interface LintErrorMessage {
  ruleId: string | null;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType?: string | null;
  fatal?: boolean;
}

export interface LintErrorResult {
  filePath: string;
  messages: LintErrorMessage[];
  errorCount: number;
  warningCount: number;
}

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
    } catch (error: any) {}
  }

  async getLintErrors(pathToLint = '.'): Promise<LintErrorResult[]> {
    const targetDir = this.contextService.get('root')!;
    const lintPath = pathToLint || '.';

    try {
      const { stdout } = await execAsync(
        `npx eslint --format json "${lintPath}"`,
        {
          cwd: targetDir,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      if (!stdout) {
        return [];
      }

      const results = (JSON.parse(stdout) as LintErrorResult[]).filter(
        (result) => result.messages.length,
      );

      if (results) {
        results.forEach((result) => {
          if ('source' in result) delete result.source;
        });
      }

      this.loggerService.logDecision(
        `Collected lint errors for ${lintPath}: ${results.length} file(s) evaluated,`,
      );

      return results;
    } catch (error: any) {
      if (error?.stdout) {
        try {
          const results = JSON.parse(error.stdout) as LintErrorResult[];
          this.loggerService.logDecision(
            `Collected lint errors for ${lintPath}: ${results.length} file(s) evaluated`,
          );
          console.log(results);
          return results;
        } catch {
          this.loggerService.logDecision(
            `Could not parse ESLint JSON output for ${lintPath}`,
          );
        }
      }

      this.loggerService.logDecision(
        `Failed to collect lint errors for ${lintPath}: ${error?.message ?? 'unknown error'}`,
      );
      return [];
    }
  }
}
