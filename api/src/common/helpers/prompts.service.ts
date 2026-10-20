import { Injectable } from '@nestjs/common';
import type { SystemModelMessage } from 'ai';
import { getAppPaths } from 'src/config/app-paths';
import { InstructionSelectionService } from 'src/instructions/data/instruction-selection.service';
import { formatInstructionMessage } from 'src/instructions/domain/format-instruction-message';
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
    private readonly instructionSelection: InstructionSelectionService,
  ) {
    this.readMarkdown = async (file) =>
      (await markdownService.getMarkdownFile(file)?.html) ?? '';
  }

  /** System instructions for a request (order in `loadSystemPrompt`). */
  async getInstructions({
    model,
    toolNames,
  }: InstructionsRequest): Promise<SystemModelMessage[]> {
    const { skillsDir } = getAppPaths();
    const root = this.contextService.get('root');
    const toolsAvailable = model.model.supportsTools;
    const selected = await this.instructionSelection.resolve(
      this.contextService.get('instructionIds'),
      root,
    );

    return loadSystemPrompt({
      readMarkdown: this.readMarkdown,
      skillsDir,
      root,
      toolsAvailable,
      toolNames,
      selectedInstructions: selected.map(formatInstructionMessage),
      projectMemory: await this.readProjectMemory(root),
      environment: await this.environmentService.describe({
        modelRef: model.ref,
        toolsAvailable,
        instructionIds: selected.map(({ id }) => id),
      }),
    });
  }

  private async readProjectMemory(root: string | undefined) {
    if (!root) return undefined;
    return (await this.memoryService.readProjectMemory(root)).topics;
  }
}
