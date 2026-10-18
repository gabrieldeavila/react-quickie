import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { ContextService } from '../context/context.service';
import {
  copyFullstackTemplate,
  copyTemplate,
  pathExists,
  renamePackage,
} from './project/copy-template';
import { FULLSTACK_TEMPLATE } from './project/domain/fullstack-root-files';
import {
  resolveTargetDir,
  validateProjectName,
} from './project/domain/resolve-project-path';
import {
  installDependency,
  type InstallResult,
} from './project/install-dependency';
import {
  initGitRepository,
  installProjectDependencies,
} from './project/setup-project';
import { TsCheckerService, VsCodeProblem } from './tschecker.service';

type CreateProjectInput = {
  template?: string;
  projectName: string;
  path?: string;
  startGit?: boolean;
};

type CreateProjectResult = {
  success: boolean;
  output?: string;
  error?: string;
  path?: string;
};

@Injectable()
export class ProjectService {
  constructor(
    private readonly contextService: ContextService,
    private readonly tsCheckerService: TsCheckerService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  /** Copies a template, optionally starts git, installs; removes the folder on failure. */
  async createProject({
    projectName,
    path: targetPath,
    template = 'default',
    startGit,
  }: CreateProjectInput): Promise<CreateProjectResult> {
    let createdProjectPath: string | undefined;

    try {
      const name = validateProjectName(projectName);
      const targetDir = resolveTargetDir(
        this.contextService.get('root'),
        targetPath,
      );
      const projectPath = path.resolve(targetDir, name);
      this.workspaceService.assertAllowedRoot(projectPath);

      const templatesRoot = getAppPaths().templatesDir;
      const templatePath = path.resolve(templatesRoot, template);
      const isFullstack = template === FULLSTACK_TEMPLATE;

      if (!isFullstack && !(await pathExists(templatePath))) {
        throw new Error(`Template '${template}' não encontrado.`);
      }
      if (await pathExists(projectPath)) {
        throw new Error(
          `A pasta do projeto já existe: ${projectPath}. Escolha outro nome ou remova a pasta existente.`,
        );
      }

      createdProjectPath = projectPath;
      if (isFullstack) {
        await copyFullstackTemplate(templatesRoot, projectPath, name);
      } else {
        await copyTemplate(templatePath, projectPath);
      }
      await renamePackage(projectPath, name, template);

      let output = `Projeto ${name} copiado do template '${template}'.\n`;
      if (startGit) output += initGitRepository(projectPath);
      output += installProjectDependencies(projectPath, isFullstack);

      return { success: true, output, path: projectPath };
    } catch (error) {
      if (createdProjectPath) {
        await fs
          .rm(createdProjectPath, { recursive: true, force: true })
          .catch(() => undefined);
      }
      return {
        success: false,
        error:
          (error as Error).message || 'Erro desconhecido ao gerar os arquivos.',
      };
    }
  }

  async getProjectsCreatedInDirectory(): Promise<string[]> {
    const targetDir = this.contextService.get('root')!;

    try {
      const dirents = await fs.readdir(targetDir, { withFileTypes: true });
      return dirents
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    } catch (error) {
      throw new Error(`Erro ao ler o diretório: ${(error as Error).message}`);
    }
  }

  checkTypeScriptErrors(folderPath?: string): VsCodeProblem[] {
    return this.tsCheckerService.checkErrors(folderPath || '');
  }

  installDependency(dependency: string, isDev = false): Promise<InstallResult> {
    const root = this.contextService.get('root');
    return installDependency(`${root}`, dependency, isDev);
  }
}
