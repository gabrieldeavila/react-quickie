import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ContextService } from '../context/context.service';
import { LoggerService } from './logger.service';

export type MemoryTopicValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | Array<string | number | boolean | null | Record<string, unknown>>;

export type ProjectMemoryEntry = {
  updatedAt: string;
  topics: Record<string, MemoryTopicValue>;
};

@Injectable()
export class MemoryService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly contextService: ContextService,
  ) {}

  private getMemoryRoot(): string {
    const appRoot = this.contextService.get('root');

    if (!appRoot) {
      throw new InternalServerErrorException('Root da aplicação não definido.');
    }

    const normalizedRoot = path.resolve(appRoot);
    const memoryRoot = normalizedRoot.endsWith(path.sep + 'api')
      ? path.join(normalizedRoot, 'memory')
      : path.join(normalizedRoot, 'api', 'memory');

    return path.resolve(memoryRoot);
  }

  private getProjectNameFromRoot(projectRoot: string): string {
    return path.basename(path.resolve(projectRoot));
  }

  private getProjectMemoryFile(projectRoot: string): string {
    const memoryRoot = this.getMemoryRoot();
    const projectName = this.getProjectNameFromRoot(projectRoot);
    return path.join(memoryRoot, `${projectName}.json`);
  }

  async readProjectMemory(projectRoot: string): Promise<ProjectMemoryEntry> {
    const memoryFile = this.getProjectMemoryFile(projectRoot);

    try {
      const exists = await fs.pathExists(memoryFile);
      if (!exists) {
        return {
          updatedAt: new Date().toISOString(),
          topics: {},
        };
      }

      const rawContent = await fs.readFile(memoryFile, 'utf8');
      const parsed = JSON.parse(rawContent) as ProjectMemoryEntry;

      return {
        updatedAt: parsed?.updatedAt || new Date().toISOString(),
        topics: parsed?.topics || {},
      };
    } catch {
      this.loggerService.logDecision(
        `Falha ao ler a memória do projeto ${projectRoot}`,
      );
      throw new InternalServerErrorException(
        'Erro ao ler a memória centralizada do projeto.',
      );
    }
  }

  async saveProjectMemory(
    projectRoot: string,
    topics: Record<string, MemoryTopicValue>,
  ): Promise<ProjectMemoryEntry> {
    const memoryRoot = this.getMemoryRoot();
    const memoryFile = this.getProjectMemoryFile(projectRoot);
    const current = await this.readProjectMemory(projectRoot);

    const nextMemory: ProjectMemoryEntry = {
      updatedAt: new Date().toISOString(),
      topics: {
        ...current.topics,
        ...topics,
      },
    };

    try {
      await fs.ensureDir(memoryRoot);
      await fs.writeFile(
        memoryFile,
        JSON.stringify(nextMemory, null, 2),
        'utf8',
      );
      this.loggerService.logDecision(`Memória salva em ${memoryFile}`);
      return nextMemory;
    } catch {
      this.loggerService.logDecision(
        `Falha ao salvar a memória do projeto ${projectRoot}`,
      );
      throw new InternalServerErrorException(
        'Erro ao salvar a memória centralizada do projeto.',
      );
    }
  }
}
