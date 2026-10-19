import { Injectable } from '@nestjs/common';
import type { SystemModelMessage } from 'ai';
import { getAppPaths } from 'src/config/app-paths';
import type { SelectedModel } from 'src/llm/domain/find-model';
import { ContextService } from '../context/context.service';
import { EnvironmentService } from './environment.service';
import { MarkdownService } from './markdown.module';
import { MemoryService } from './memory.service';
import { loadSystemPrompt } from './prompts/load-system-prompt';
import type { ReadMarkdown } from './prompts/skill-loaders';

export type InstructionsRequest = {
  model: SelectedModel;
  /** Names of the tools this request gives the model. */
  toolNames: string[];
};

@Injectable()
export class PromptsService {
  private readonly readMarkdown: ReadMarkdown;

  constructor(
    markdownService: MarkdownService,
    private readonly contextService: ContextService,
    private readonly memoryService: MemoryService,
    private readonly environmentService: EnvironmentService,
  ) {
    this.readMarkdown = async (file) =>
      (await markdownService.getMarkdownFile(file)?.html) ?? '';
  }

  /** System instructions for a request (order in `loadSystemPrompt`). */
  async getInstructions({
    model,
    toolNames,
  }: InstructionsRequest): Promise<SystemModelMessage[]> {
    const { skillsDir, pluginSkillsDir } = getAppPaths();
    const root = this.contextService.get('root');
    const toolsAvailable = model.model.supportsTools;

    return loadSystemPrompt({
      readMarkdown: this.readMarkdown,
      skillsDir,
      pluginSkillsDir,
      root,
      mode: this.contextService.get('mode'),
      specialty: this.contextService.get('specialty'),
      toolsAvailable,
      toolNames,
      projectMemory: await this.readProjectMemory(root),
      environment: await this.environmentService.describe({
        modelRef: model.ref,
        toolsAvailable,
      }),
    });
  }

  private async readProjectMemory(root: string | undefined) {
    if (!root) return undefined;
    return (await this.memoryService.readProjectMemory(root)).topics;
  }
}
