import { Injectable } from '@nestjs/common';
import { ToolSet } from 'ai';
import { ContextService } from 'src/common/context/context.service';
import { AgentBuilderToolsService } from './agent_builder/tool.service';

@Injectable()
export class PluginToolsService {
  constructor(
    private readonly contextService: ContextService,
    private readonly agentBuilderToolsService: AgentBuilderToolsService,
  ) {}

  private readonly toolsFactory: Record<string, () => ToolSet> = {
    agent_builder: () => this.agentBuilderToolsService.createTools(),
  };

  getTools(): ToolSet | null {
    const mode = this.contextService.get('mode');

    if (!mode) {
      return null;
    }

    const toolsFactory = this.toolsFactory[mode];

    return toolsFactory ? toolsFactory() : null;
  }
}
