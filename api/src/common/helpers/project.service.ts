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

const FULLSTACK_ROOT_GITIGNORE = `# Dependencies
node_modules/

# Build output
api/dist/
ui/dist/
ui/build/
ui/.react-router/

# Environment variables
.env
.env.*
!.env.example

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Coverage
coverage/

# OS and editor files
.DS_Store
.idea/
.vscode/
`;

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

      if (!targetPath && !rootPath) {
        throw new Error(
          'Informe uma pasta de destino ou configure a raiz do workspace.',
        );
      }

      const targetDir = targetPath
        ? path.isAbsolute(targetPath)
          ? path.resolve(targetPath)
          : rootPath
            ? path.resolve(rootPath, targetPath)
            : (() => {
                throw new Error(
                  'Caminho relativo exige uma raiz de workspace configurada.',
                );
              })()
        : rootPath!;
      const projectPath = path.resolve(targetDir, name);

      const templatesRoot = path.resolve(__dirname, '../../../../templates');
      const templatePath = path.resolve(templatesRoot, template);
      const isFullstackTemplate = template === 'nest-vite-base';

      if (
        !isFullstackTemplate &&
        !(await fs.stat(templatePath).catch(() => null))
      ) {
        throw new Error(`Template '${template}' não encontrado.`);
      }

      if (await fs.stat(projectPath).catch(() => null)) {
        throw new Error(
          `A pasta do projeto já existe: ${projectPath}. Escolha outro nome ou remova a pasta existente.`,
        );
      }

      createdProjectPath = projectPath;
      const copyTemplate = async (
        sourcePath: string,
        destinationPath: string,
      ) => {
        await fs.cp(sourcePath, destinationPath, {
          recursive: true,
          filter: (source) => {
            const relativePath = path.relative(sourcePath, source);
            if (!relativePath) return true;

            return !relativePath
              .split(path.sep)
              .some((part) => TEMPLATE_IGNORED_PATHS.has(part));
          },
        });
      };

      if (isFullstackTemplate) {
        const backendTemplatePath = path.join(templatesRoot, 'nest-base');
        const frontendTemplatePath = path.join(templatesRoot, 'vite-base');
        if (
          !(await fs.stat(backendTemplatePath).catch(() => null)) ||
          !(await fs.stat(frontendTemplatePath).catch(() => null))
        ) {
          throw new Error(
            'Os templates nest-base e vite-base são necessários.',
          );
        }

        await fs.mkdir(projectPath, { recursive: true });
        await copyTemplate(backendTemplatePath, path.join(projectPath, 'api'));
        await copyTemplate(frontendTemplatePath, path.join(projectPath, 'ui'));
        await fs.writeFile(
          path.join(projectPath, 'package.json'),
          JSON.stringify(
            {
              name,
              private: true,
              scripts: {
                dev: 'concurrently -k -n api,ui "pnpm --dir api run start:dev" "pnpm --dir ui run dev"',
                build: 'pnpm --dir api run build && pnpm --dir ui run build',
                start:
                  'concurrently -k -n api,ui "pnpm --dir api run start:prod" "pnpm --dir ui run start"',
              },
              devDependencies: { concurrently: '^10.0.5' },
            },
            null,
            2,
          ),
          'utf8',
        );
        await fs.writeFile(
          path.join(projectPath, '.gitignore'),
          FULLSTACK_ROOT_GITIGNORE,
          'utf8',
        );
      } else {
        await copyTemplate(templatePath, projectPath);
      }

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
      const installOptions = {
        env: {
          ...process.env,
          COREPACK_ENABLE_PROJECT_SPEC: '0',
        },
      };
      if (isFullstackTemplate) {
        outputLogs += execSync('pnpm install --ignore-workspace', {
          cwd: projectPath,
          ...installOptions,
        }).toString();
        for (const appDirectory of ['api', 'ui']) {
          outputLogs += execSync(
            'pnpm install --force --frozen-lockfile --ignore-workspace',
            { cwd: path.join(projectPath, appDirectory), ...installOptions },
          ).toString();
        }
      } else {
        outputLogs += execSync(
          'pnpm install --force --frozen-lockfile --ignore-workspace',
          { cwd: projectPath, ...installOptions },
        ).toString();
      }

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
