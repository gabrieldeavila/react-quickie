import { Module } from '@nestjs/common';
import { AgentsModule } from 'src/common/agents/agents.module';
import { HelperModule } from 'src/common/helpers/helpers.module';
import { LlmModule } from 'src/llm/llm.module';
import { McpModule } from 'src/mcp/mcp.module';
import { AgentDefinitionsRepository } from './data/agent-definitions.repository';
import { SubagentRunnerService } from './data/subagent-runner.service';
import { SubagentToolService } from './data/subagent-tool.service';
import { SubagentToolkitService } from './data/subagent-toolkit.service';

@Module({
  imports: [HelperModule, AgentsModule, LlmModule, McpModule],
  providers: [
    AgentDefinitionsRepository,
    SubagentToolkitService,
    SubagentRunnerService,
    SubagentToolService,
  ],
  exports: [SubagentToolService],
})
export class SubagentsModule {}
