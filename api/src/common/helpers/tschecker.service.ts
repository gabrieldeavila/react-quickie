import { Injectable, BadRequestException } from '@nestjs/common';
import { Project, DiagnosticCategory } from 'ts-morph';
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

  // Cache de projetos para manter a performance alta, carregando a pasta apenas uma vez
  private projectsCache = new Map<string, Project>();

  private getProject(tsConfigPath: string): Project | undefined {
    const resolvedConfigPath = path.resolve(tsConfigPath);

    if (!this.projectsCache.has(resolvedConfigPath)) {
      const project = new Project({
        tsConfigFilePath: resolvedConfigPath,
      });
      this.projectsCache.set(resolvedConfigPath, project);
    }
    return this.projectsCache.get(resolvedConfigPath);
  }

  private resolveTsConfigForFile(rootDir: string, filePath: string): string {
    const rootConfigPath = path.resolve(rootDir, 'tsconfig.json');
    const absoluteFilePath = path.resolve(rootDir, filePath);

    // Lê o tsconfig raiz
    if (fs.existsSync(rootConfigPath)) {
      // Usamos um parse simples aqui (cuidado com comentários no JSON na vida real,
      // mas o ts.readConfigFile pode ser usado para ler JSONs com comentários)
      const content = fs.readFileSync(rootConfigPath, 'utf8');

      // Expressão regular rápida para limpar comentários do tsconfig, se houver
      const cleanContent = content.replace(
        /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm,
        '',
      );
      const rootConfig = JSON.parse(cleanContent);

      // Se é um Solution-Style tsconfig (tem referências)
      if (rootConfig.references && Array.isArray(rootConfig.references)) {
        for (const ref of rootConfig.references) {
          // Resolve o caminho do tsconfig filho (ex: tsconfig.app.json)
          let childConfigPath = path.resolve(rootDir, ref.path);

          // Se a referência apontar para uma pasta, assume que o arquivo lá dentro chama tsconfig.json
          if (fs.statSync(childConfigPath).isDirectory()) {
            childConfigPath = path.join(childConfigPath, 'tsconfig.json');
          }

          // Carrega o projeto filho no cache do ts-morph
          const project = this.getProject(childConfigPath);

          // MAGIA AQUI: O ts-morph sabe se o arquivo pertence a este config!
          // Se o arquivo estiver dentro deste projeto, achamos o config certo.
          if (project?.getSourceFile(absoluteFilePath)) {
            return childConfigPath;
          }
        }
      }
    }

    // Se não tem references ou não achou o arquivo nelas, usa o raiz como fallback
    return rootConfigPath;
  }

  /**
   * Verifica erros de um arquivo específico, retornando no formato do VS Code
   * @param tsConfigPath Caminho para o tsconfig.json do projeto alvo
   * @param filePath Caminho do arquivo TypeScript que a IA deseja verificar
   */
  public checkFileErrors(filePath: string): VsCodeProblem[] {
    const rootDir = this.contextService.get('root');
    const tsConfigPath = this.resolveTsConfigForFile(rootDir!, filePath);
    const project = this.getProject(tsConfigPath);

    if (!project) {
      throw new BadRequestException(
        `Não foi possível carregar o projeto TypeScript a partir do tsconfig.json: ${tsConfigPath}`,
      );
    }

    const absoluteFilePath = path.resolve(path.join(rootDir!, filePath));
    const sourceFile = project.getSourceFile(absoluteFilePath);

    if (!sourceFile) {
      throw new BadRequestException(
        `Arquivo não encontrado no cache do projeto: ${filePath}. Verifique se ele está coberto pelo tsconfig.json.`,
      );
    }
    
    sourceFile.refreshFromFileSystemSync();
    const diagnostics = sourceFile.getPreEmitDiagnostics();

    return diagnostics.map((diagnostic) => {
      const rawMessage = diagnostic.getMessageText();
      const message =
        typeof rawMessage === 'string'
          ? rawMessage
          : rawMessage.getMessageText();

      const start = diagnostic.getStart();
      let line = 0;
      let character = 0;

      if (start !== undefined) {
        const pos = sourceFile.getLineAndColumnAtPos(start);
        line = pos.line;
        character = pos.column;
      }

      const categoryMapping = {
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
        category: categoryMapping[diagnostic.getCategory()],
        message: message as string,
      };
    });
  }
}
