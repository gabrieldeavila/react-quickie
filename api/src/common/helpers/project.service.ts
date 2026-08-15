import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { ContextService } from '../context/context.service';
import { LoggerService } from './logger.service';
import { TsCheckerService, VsCodeProblem } from './tschecker.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly contextService: ContextService,
    private readonly tsCheckerService: TsCheckerService,
  ) {}

  createProject({
    projectName,
    path,
  }: {
    projectName: string;
    path?: string;
  }): Promise<{
    success: boolean;
    output?: string;
    error?: string;
    path?: string;
  }> {
    return new Promise((resolve) => {
      if (path && !path.startsWith('/')) {
        path = `/${path}`;
      }

      const targetDir = path || this.contextService.get('root');
      const name = projectName || 'my-react-app';

      const child = spawn(
        'npx',
        [
          'create-next-app@latest',
          name,
          '--typescript',
          '--tailwind',
          '--eslint',
          '--yes',
        ],
        {
          cwd: targetDir,
          shell: true,
        },
      );

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data: string) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data: string) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.loggerService.logDecision(`Created project ${projectName}`);
          resolve({
            success: true,
            output: stdoutData,
            path: `${targetDir}/${name}`,
          });
        } else {
          resolve({
            success: false,
            error: stderrData || `Processo encerrado com código ${code}`,
          });
        }
      });

      // Tratamento caso o comando nem consiga iniciar
      child.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }

  getProjectsCreatedInDirectory(): Promise<string[]> {
    const targetDir = this.contextService.get('root')!;
    return new Promise((resolve, reject) => {
      const child = spawn('ls', ['-1'], {
        cwd: targetDir,
        shell: true,
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data: string) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data: string) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const projects = stdoutData
            .split('\n')
            .filter((line) => line.trim() !== '');
          resolve(projects);
        } else {
          reject(stderrData || `Processo encerrado com código ${code}`);
        }
      });

      // Tratamento caso o comando nem consiga iniciar
      child.on('error', (err) => {
        reject(err.message);
      });
    });
  }

  checkTypeScriptErrors(folderPath?: string): VsCodeProblem[] {
    this.loggerService.logDecision(
      `Verificando erros de TypeScript no diretório: ${folderPath || 'diretório raiz'}`,
    );
    return this.tsCheckerService.checkErrors(folderPath || '');
  }

  async installDependency(
    dependency: string,
    isDev = false,
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      const targetDir = this.contextService.get('root');
      const projectPath = `${targetDir}`;

      // Argumentos: i, nome do pacote, e -D se for dev
      const args = ['i', dependency];
      if (isDev) {
        args.push('-D');
      }

      const child = spawn('pnpm', args, {
        cwd: projectPath,
        shell: true,
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on(
        'data',
        (data: string) => (stdoutData += data.toString()),
      );
      child.stderr.on(
        'data',
        (data: string) => (stderrData += data.toString()),
      );

      child.on('close', (code) => {
        if (code === 0) {
          this.loggerService.logDecision(
            `Instalada dependência ${dependency} `,
          );
          resolve({ success: true, output: stdoutData });
        } else {
          resolve({
            success: false,
            error:
              stderrData || `Falha ao instalar ${dependency} (código ${code})`,
          });
        }
      });

      child.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }
}
