import { Injectable } from '@nestjs/common';
import { ToolSet } from 'ai';
import createAgentTool from './tools/createAgent';

@Injectable()
export class AgentBuilderToolsService {
  constructor() {}

  createTools(): ToolSet {
    return {
      create_agent: createAgentTool,
    };
  }
}
