import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import type {
  AgentDefinition,
  AgentSource,
} from '../domain/agent-definition.types';
import { mergeAgentDefinitions } from '../domain/merge-agent-definitions';
import { parseAgentDefinition } from '../domain/parse-agent-definition';

export const PROJECT_AGENTS_DIR = path.join('.doty', 'agents');

function isMissing(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

/** Built-in agents (shipped with the API) merged with `<root>/.doty/agents/*.md`. */
@Injectable()
export class AgentDefinitionsRepository {
  private readonly logger = new Logger(AgentDefinitionsRepository.name);
  private builtIns?: Promise<AgentDefinition[]>;

  async load(root?: string): Promise<AgentDefinition[]> {
    const [builtIns, project] = await Promise.all([
      this.loadBuiltIns(),
      root
        ? this.readDir(path.join(root, PROJECT_AGENTS_DIR), 'project')
        : Promise.resolve([]),
    ]);
    return mergeAgentDefinitions(builtIns, project);
  }

  /** Read once: built-ins only change with a new build. */
  private loadBuiltIns(): Promise<AgentDefinition[]> {
    this.builtIns ??= this.readDir(
      getAppPaths().agentDefinitionsDir,
      'built-in',
    );
    return this.builtIns;
  }

  /** Project files are read on every request so edits apply right away. */
  private async readDir(
    dir: string,
    source: AgentSource,
  ): Promise<AgentDefinition[]> {
    let names: string[];
    try {
      names = await fs.readdir(dir);
    } catch (error) {
      if (!isMissing(error)) this.warn(dir, error);
      return [];
    }

    const files = names.filter((name) => name.endsWith('.md')).sort();
    const parsed = await Promise.all(
      files.map((name) => this.readFile(path.join(dir, name), source)),
    );
    return parsed.filter((item): item is AgentDefinition => item !== null);
  }

  /** An invalid file only drops that agent. */
  private async readFile(
    file: string,
    source: AgentSource,
  ): Promise<AgentDefinition | null> {
    try {
      return parseAgentDefinition(await fs.readFile(file, 'utf8'), source);
    } catch (error) {
      this.warn(file, error);
      return null;
    }
  }

  private warn(location: string, error: unknown) {
    this.logger.warn(
      `Skipped agent (${location}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
