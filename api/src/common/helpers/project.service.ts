import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { ContextService } from '../context/context.service';
import { TsCheckerService, VsCodeProblem } from './tschecker.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TEMPLATE_IGNORED_PATHS = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  '.react-router',
  'coverage',
  '.git',
]);

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
    let createdProjectPath: string | undefined;

    try {
      const rootPath = this.contextService.get('root');
      if (!rootPath) {
        throw new Error('A raiz do workspace não foi configurada.');
      }

      const name = (projectName || 'my-react-app').trim();
      if (
        !name ||
        name === '.' ||
        name === '..' ||
        name !== path.basename(name) ||
        name.includes(path.sep)
      ) {
        throw new Error('O nome do projeto é inválido.');
      }

      const targetDir = targetPath
        ? path.isAbsolute(targetPath)
          ? path.resolve(targetPath)
          : path.resolve(rootPath, targetPath)
        : rootPath;
      const projectPath = path.resolve(targetDir, name);

      const templatePath = path.resolve(
        __dirname,
        '../../../../templates',
        template,
      );

      if (!(await fs.stat(templatePath).catch(() => null))) {
        throw new Error(`Template '${template}' não encontrado.`);
      }

      if (await fs.stat(projectPath).catch(() => null)) {
        throw new Error(
          `A pasta do projeto já existe: ${projectPath}. Escolha outro nome ou remova a pasta existente.`,
        );
      }

      createdProjectPath = projectPath;
      await fs.cp(templatePath, projectPath, {
        recursive: true,
        filter: (source) => {
          const relativePath = path.relative(templatePath, source);
          if (!relativePath) return true;

          return !relativePath
            .split(path.sep)
            .some((part) => TEMPLATE_IGNORED_PATHS.has(part));
        },
      });

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

      // Instala usando exclusivamente o lockfile do projeto gerado. Isso evita
      // que um pnpm-workspace/lockfile existente em um diretório pai altere a
      // árvore de dependências e crie mais de uma instância do React.
      const installBuffer = execSync(
        'pnpm install --force --frozen-lockfile --ignore-workspace',
        {
          cwd: projectPath,
          env: {
            ...process.env,
            COREPACK_ENABLE_PROJECT_SPEC: '0',
          },
        },
      );
      outputLogs += installBuffer.toString();

      return {
        success: true,
        output: outputLogs,
        path: projectPath,
      };
    } catch (error: any) {
      if (createdProjectPath) {
        await fs
          .rm(createdProjectPath, { recursive: true, force: true })
          .catch(() => undefined);
      }

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
