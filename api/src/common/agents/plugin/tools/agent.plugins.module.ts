import { Module } from '@nestjs/common';
import { AgentBuilderToolsService } from './agentBuilder/tool.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AgentBuilderToolsService],
  exports: [AgentBuilderToolsService],
})
export class AgentsModule {}
