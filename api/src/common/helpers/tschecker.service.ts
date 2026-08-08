import { Injectable, BadRequestException } from '@nestjs/common';
import { Project, DiagnosticCategory, Diagnostic, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { ContextService } from '../context/context.service';

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
  constructor(private readonly contextService: ContextService) {}

  // Cache de projetos para manter a performance alta
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
   * Lê o tsconfig raiz e retorna todos os projetos mapeados 
   * (suporta Solution-Style tsconfig com "references")
   */
  private getAllProjects(rootDir: string): Project[] {
    const rootConfigPath = path.resolve(rootDir, 'tsconfig.json');
    const projects: Project[] = [];

    if (!fs.existsSync(rootConfigPath)) {
      return projects;
    }

    const content = fs.readFileSync(rootConfigPath, 'utf8');
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
    const rootConfig = JSON.parse(cleanContent);

    if (rootConfig.references && Array.isArray(rootConfig.references)) {
      for (const ref of rootConfig.references) {
        let childConfigPath = path.resolve(rootDir, ref.path);

        if (fs.existsSync(childConfigPath) && fs.statSync(childConfigPath).isDirectory()) {
          childConfigPath = path.join(childConfigPath, 'tsconfig.json');
        }

        if (fs.existsSync(childConfigPath)) {
          projects.push(this.getProject(childConfigPath));
        }
      }
    } else {
      // Se não tem references, o projeto principal é o próprio raiz
      projects.push(this.getProject(rootConfigPath));
    }

    return projects;
  }

  /**
   * Formata um erro do ts-morph para o padrão do VS Code
   */
  private formatDiagnostic(diagnostic: Diagnostic, sourceFile: SourceFile): VsCodeProblem {
    const rawMessage = diagnostic.getMessageText();
    const message = typeof rawMessage === 'string' ? rawMessage : rawMessage.getMessageText();

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
      message: message as string,
    };
  }

  /**
   * Verifica erros de um arquivo, diretório específico ou do repositório inteiro.
   * @param targetPath Caminho relativo para o arquivo ou pasta (opcional). Se vazio, verifica tudo.
   */
  public checkErrors(targetPath?: string): VsCodeProblem[] {
    const rootDir = this.contextService.get('root');
    if (!rootDir) {
      throw new BadRequestException('Diretório raiz não encontrado no contexto.');
    }

    const absoluteTarget = targetPath ? path.resolve(rootDir, targetPath) : rootDir;

    if (!fs.existsSync(absoluteTarget)) {
      throw new BadRequestException(`Caminho não encontrado: ${absoluteTarget}`);
    }

    const isDirectory = fs.statSync(absoluteTarget).isDirectory();
    // O ts-morph armazena caminhos internos usando barras (/) padrão POSIX, 
    // mesmo no Windows. Precisamos normalizar para fazer o "startsWith" ou "===" funcionar.
    const normalizedTarget = absoluteTarget.replace(/\\/g, '/');
    
    const projects = this.getAllProjects(rootDir);
    if (projects.length === 0) {
      throw new BadRequestException(`Nenhum tsconfig.json válido encontrado em: ${rootDir}`);
    }

    const problems: VsCodeProblem[] = [];
    let filesChecked = 0;

    for (const project of projects) {
      // Pega todos os arquivos do projeto em cache
      const sourceFiles = project.getSourceFiles();

      const targetFiles = sourceFiles.filter((sf) => {
        const filePath = sf.getFilePath();
        return isDirectory 
          ? filePath.startsWith(normalizedTarget) 
          : filePath === normalizedTarget;
      });

      for (const sourceFile of targetFiles) {
        // Sincroniza as mudanças mais recentes do disco para a memória
        sourceFile.refreshFromFileSystemSync();
        filesChecked++;

        // Coleta diagnósticos apenas para este arquivo específico
        const diagnostics = sourceFile.getPreEmitDiagnostics();
        for (const diagnostic of diagnostics) {
          problems.push(this.formatDiagnostic(diagnostic, sourceFile));
        }
      }
    }

    if (filesChecked === 0 && !isDirectory) {
      throw new BadRequestException(
        `Arquivo não encontrado no cache dos projetos TypeScript: ${targetPath}. Verifique se ele está coberto pelo tsconfig.json.`
      );
    }

    return problems;
  }
}