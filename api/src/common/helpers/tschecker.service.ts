import { Injectable, BadRequestException } from '@nestjs/common';
import { Project, DiagnosticCategory, Diagnostic, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { ContextService } from '../context/context.service';
import { WorkspaceService } from 'src/workspace/data/workspace.service';

export interface VsCodeProblem {
  file: string;
  line: number;
  character: number;
  code: string;
  category: string;
  message: string;
}

@Injectable()
export class TsCheckerService {
  constructor(
    private readonly contextService: ContextService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  // Project cache, to keep checks fast
  private projectsCache = new Map<string, Project>();

  private getProject(tsConfigPath: string): Project {
    const resolvedConfigPath = path.resolve(tsConfigPath);

    if (!this.projectsCache.has(resolvedConfigPath)) {
      const project = new Project({
        tsConfigFilePath: resolvedConfigPath,
      });
      this.projectsCache.set(resolvedConfigPath, project);
    }
    return this.projectsCache.get(resolvedConfigPath)!;
  }

  /**
   * Reads the root tsconfig and returns every mapped project
   * (supports solution-style tsconfigs with "references")
   */
  private getAllProjects(rootDir: string): Project[] {
    const rootConfigPath = path.resolve(rootDir, 'tsconfig.json');
    const projects: Project[] = [];

    if (!fs.existsSync(rootConfigPath)) {
      return projects;
    }

    const content = fs.readFileSync(rootConfigPath, 'utf8');
    const cleanContent = content.replace(
      /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm,
      '',
    );
    const rootConfig = JSON.parse(cleanContent);

    if (rootConfig.references && Array.isArray(rootConfig.references)) {
      for (const ref of rootConfig.references) {
        let childConfigPath = path.resolve(rootDir, ref.path);

        if (
          fs.existsSync(childConfigPath) &&
          fs.statSync(childConfigPath).isDirectory()
        ) {
          childConfigPath = path.join(childConfigPath, 'tsconfig.json');
        }

        if (fs.existsSync(childConfigPath)) {
          projects.push(this.getProject(childConfigPath));
        }
      }
    } else {
      // Without references, the root config is the only project
      projects.push(this.getProject(rootConfigPath));
    }

    return projects;
  }

  /**
   * Formats a ts-morph diagnostic the way VS Code shows problems
   */
  private formatDiagnostic(
    diagnostic: Diagnostic,
    sourceFile: SourceFile,
  ): VsCodeProblem {
    const rawMessage = diagnostic.getMessageText();
    const message =
      typeof rawMessage === 'string' ? rawMessage : rawMessage.getMessageText();

    const start = diagnostic.getStart();
    let line = 0;
    let character = 0;

    if (start !== undefined) {
      const pos = sourceFile.getLineAndColumnAtPos(start);
      line = pos.line;
      character = pos.column;
    }

    const categoryMapping: Record<number, string> = {
      [DiagnosticCategory.Error]: 'Error',
      [DiagnosticCategory.Warning]: 'Warning',
      [DiagnosticCategory.Suggestion]: 'Suggestion',
      [DiagnosticCategory.Message]: 'Message',
    };

    return {
      file: sourceFile.getBaseName(),
      line,
      character,
      code: `TS${diagnostic.getCode()}`,
      category: categoryMapping[diagnostic.getCategory()] || 'Error',
      message: message,
    };
  }

  /**
   * Checks a file, a folder or the whole repository for errors.
   * @param targetPath Relative path of the file or folder (optional). Empty checks everything.
   */
  public checkErrors(targetPath?: string): VsCodeProblem[] {
    const rootDir = this.contextService.get('root');
    if (!rootDir) {
      throw new BadRequestException(
        'Root folder not found in the request context.',
      );
    }

    const normalizedRootDir = path.resolve(rootDir);
    const expectedApiRoot = path.resolve(normalizedRootDir, 'api');
    const effectiveRootDir = fs.existsSync(
      path.join(normalizedRootDir, 'tsconfig.json'),
    )
      ? normalizedRootDir
      : fs.existsSync(path.join(expectedApiRoot, 'tsconfig.json'))
        ? expectedApiRoot
        : normalizedRootDir;

    const absoluteTarget = this.workspaceService.resolveIn(
      effectiveRootDir,
      targetPath,
    );

    if (!fs.existsSync(absoluteTarget)) {
      throw new BadRequestException(`Path not found: ${absoluteTarget}`);
    }

    const isDirectory = fs.statSync(absoluteTarget).isDirectory();
    // ts-morph stores paths with POSIX slashes (/), even on Windows.
    // Normalize so "startsWith" and "===" work.
    const normalizedTarget = absoluteTarget.replace(/\\/g, '/');

    const projects = this.getAllProjects(effectiveRootDir);
    if (projects.length === 0) {
      throw new BadRequestException(
        `No valid tsconfig.json found in: ${effectiveRootDir}`,
      );
    }

    const problems: VsCodeProblem[] = [];
    let filesChecked = 0;

    for (const project of projects) {
      // All source files of the cached project
      const sourceFiles = project.getSourceFiles();

      const targetFiles = sourceFiles.filter((sf) => {
        const filePath = sf.getFilePath();
        return isDirectory
          ? filePath.startsWith(normalizedTarget)
          : filePath === normalizedTarget;
      });

      for (const sourceFile of targetFiles) {
        // Pick up the latest changes from disk
        sourceFile.refreshFromFileSystemSync();
        filesChecked++;

        // Diagnostics for this file only
        const diagnostics = sourceFile.getPreEmitDiagnostics();
        for (const diagnostic of diagnostics) {
          problems.push(this.formatDiagnostic(diagnostic, sourceFile));
        }
      }
    }

    if (filesChecked === 0 && !isDirectory) {
      throw new BadRequestException(
        `File not found in the TypeScript project cache: ${targetPath}. Check that tsconfig.json includes it.`,
      );
    }

    return problems;
  }
}
