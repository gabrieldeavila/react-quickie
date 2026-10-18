import { Injectable } from '@nestjs/common';
import type { Instructions, SystemModelMessage } from 'ai';
import path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import { ContextService } from '../context/context.service';
import { MarkdownService } from './markdown.module';
import { MemoryService } from './memory.service';
import { formatProjectMemory } from './prompts/domain/format-project-memory';
import {
  loadProjectAgents,
  loadSkillDirectory,
  loadSkillFile,
  type ReadMarkdown,
} from './prompts/skill-loaders';

@Injectable()
export class PromptsService {
  private readonly readMarkdown: ReadMarkdown;

  constructor(
    markdownService: MarkdownService,
    private readonly contextService: ContextService,
    private readonly memoryService: MemoryService,
  ) {
    this.readMarkdown = async (file) =>
      (await markdownService.getMarkdownFile(file)?.html) ?? '';
  }

  /**
   * System instructions for a request, in order: workspace, behavior rules,
   * project agents, mode skills, plugin skills, memory rules, project memory.
   */
  async getInstructions(): Promise<Instructions> {
    const { skillsDir, pluginSkillsDir } = getAppPaths();
    const root = this.contextService.get('root');
    const mode = `${this.contextService.get('mode')}`;
    const specialty = this.contextService.get('specialty');
    const read = this.readMarkdown;

    const groups: SystemModelMessage[][] = [
      [{ role: 'system', content: `The user project is ${root}` }],
      await loadSkillFile(read, path.join(skillsDir, 'behavior.md')),
      await loadProjectAgents(read, root),
      await loadSkillDirectory(read, path.join(skillsDir, mode), specialty),
      await loadSkillDirectory(
        read,
        path.join(pluginSkillsDir, mode),
        specialty,
      ),
      await loadSkillFile(read, path.join(skillsDir, 'memory.md')),
      await this.getProjectMemory(root),
    ];
    return groups.flat();
  }

  private async getProjectMemory(
    root: string | undefined,
  ): Promise<SystemModelMessage[]> {
    if (!root) return [];
    const { topics } = await this.memoryService.readProjectMemory(root);
    const memory = formatProjectMemory(topics);
    return memory
      ? [
          {
            role: 'system',
            content: `Project memory from the current workspace:\n${memory}`,
          },
        ]
      : [];
  }
}
