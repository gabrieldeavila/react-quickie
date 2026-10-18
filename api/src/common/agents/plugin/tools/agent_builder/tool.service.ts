import { Injectable } from '@nestjs/common';
import { ToolSet } from 'ai';
import { hasAgentBuilderSources } from './agent-builder-dirs';
import createAgentTool from './tools/createAgent';

@Injectable()
export class AgentBuilderToolsService {
  constructor() {}

  createTools(): ToolSet {
    if (!hasAgentBuilderSources()) return {};

    return {
      create_agent: createAgentTool,
    };
  }
}
