import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ContextService } from '../context/context.service';
import { WorkspaceService } from 'src/workspace/data/workspace.service';

// execFile (no shell) so paths from tools can't inject shell syntax.
const execFileAsync = promisify(execFile);

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
  source?: string;
}

@Injectable()
export class LinterService {
  constructor(
    private readonly contextService: ContextService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async formatAndLintFile(fullPath: string): Promise<void> {
    try {
      const targetDir = this.contextService.get('root')!;

      await execFileAsync('npx', ['prettier', '--write', fullPath], {
        cwd: targetDir,
      });

      if (
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.js') ||
        fullPath.endsWith('.tsx')
      ) {
        await execFileAsync('npx', ['eslint', '--fix', fullPath], {
          cwd: targetDir,
        });
      }
    } catch {
      void 0;
    }
  }

  async getLintErrors(pathToLint = '.'): Promise<LintErrorResult[]> {
    const targetDir = this.contextService.get('root')!;
    const lintPath = this.workspaceService.resolve(pathToLint || '.');

    try {
      const { stdout } = await execFileAsync(
        'npx',
        ['eslint', '--format', 'json', lintPath],
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

      return results;
    } catch (error: any) {
      if ('stdout' in error) {
        try {
          const results = JSON.parse(error.stdout) as LintErrorResult[];

          return results;
        } catch {
          console.log(`Could not parse ESLint JSON output for ${lintPath}`);
        }
      }

      return [];
    }
  }
}
