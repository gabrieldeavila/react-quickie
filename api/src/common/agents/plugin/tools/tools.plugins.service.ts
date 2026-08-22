import { Injectable } from '@nestjs/common';
import { ContextService } from 'src/common/context/context.service';
import { AgentBuilderToolsService } from './agentBuilder/tool.service';
import { ToolSet } from 'ai';

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
