import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { ContextService } from '../context/context.service';
import { TsCheckerService, VsCodeProblem } from './tschecker.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class ProjectService {
  constructor(
    private readonly contextService: ContextService,
    private readonly tsCheckerService: TsCheckerService,
  ) {}

  async createProject({
    projectName,
    path: targetPath,
    template = 'default',
    startGit,
  }: {
    template?: string;
    projectName: string;
    path?: string;
    startGit?: boolean;
  }): Promise<{
    success: boolean;
    output?: string;
    error?: string;
    path?: string;
  }> {
    try {
      if (targetPath && !targetPath.startsWith('/')) {
        targetPath = `/${targetPath}`;
      }

      const targetDir = targetPath || this.contextService.get('root');
      const name = projectName || 'my-react-app';
      const projectPath = path.join(targetDir!, name);

      const templatePath = path.resolve(
        __dirname,
        '../../../../templates',
        template,
      );

      await fs.cp(templatePath, projectPath, { recursive: true });

      const packageJsonPath = path.join(projectPath, 'package.json');
      try {
        const pkgData = await fs.readFile(packageJsonPath, 'utf8');
        const pkg = JSON.parse(pkgData);
        pkg.name = name;
        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(pkg, null, 2),
          'utf8',
        );
      } catch {
        console.log(
          `Aviso: package.json não encontrado no template ${template}`,
        );
      }

      let outputLogs = `Projeto ${name} copiado do template '${template}'.\n`;

      try {
        if (startGit) {
          execSync('git init', { cwd: projectPath, stdio: 'ignore' });
          execSync('git checkout -b main', {
            cwd: projectPath,
            stdio: 'ignore',
          });
          outputLogs += 'Repositório Git inicializado.\n';

          execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
          execSync('git commit -m "chore: initial commit from react-quickie"', {
            cwd: projectPath,
            stdio: 'ignore',
          });
          outputLogs += '\nCommit inicial finalizado com sucesso.\n';
        }
      } catch (execError: any) {
        outputLogs += `\nAviso durante execução de comandos: ${execError.message}`;
      }

      const installBuffer = execSync('pnpm install', { cwd: projectPath });
      outputLogs += installBuffer.toString();

      return {
        success: true,
        output: outputLogs,
        path: projectPath,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao gerar os arquivos.',
      };
    }
  }

  async getProjectsCreatedInDirectory(): Promise<string[]> {
    const targetDir = this.contextService.get('root')!;

    try {
      const dirents = await fs.readdir(targetDir, { withFileTypes: true });

      const projects = dirents
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      return projects;
    } catch (error: any) {
      throw new Error(`Erro ao ler o diretório: ${error.message}`);
    }
  }

  checkTypeScriptErrors(folderPath?: string): VsCodeProblem[] {
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
