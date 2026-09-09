import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { createHash } from 'crypto';

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
  private getMemoryRoot(): string {
    return path.resolve(process.cwd(), 'storage', 'memory');
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  private getProjectSlug(projectRoot: string): string {
    const normalizedRoot = path.resolve(projectRoot);
    const parts = normalizedRoot.split(path.sep).filter(Boolean);
    const lastTwoParts = parts.slice(-2).join('-');

    return this.slugify(lastTwoParts || path.basename(normalizedRoot));
  }

  private getProjectMemoryKey(projectRoot: string): string {
    const normalizedRoot = path.resolve(projectRoot);
    const hash = createHash('sha1')
      .update(normalizedRoot)
      .digest('hex')
      .slice(0, 8);
    const slug = this.getProjectSlug(projectRoot);

    return `${hash}_${slug}`;
  }

  private getProjectMemoryFile(projectRoot: string): string {
    const memoryRoot = this.getMemoryRoot();
    const projectKey = this.getProjectMemoryKey(projectRoot);

    return path.join(memoryRoot, `${projectKey}.json`);
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
      return nextMemory;
    } catch {
      throw new InternalServerErrorException(
        'Erro ao salvar a memória centralizada do projeto.',
      );
    }
  }
}
