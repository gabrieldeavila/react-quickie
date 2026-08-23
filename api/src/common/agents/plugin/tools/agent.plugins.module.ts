import { Module } from '@nestjs/common';
import { AgentBuilderToolsService } from './agentBuilder/tool.service';
import { PluginToolsService } from './tools.plugins.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AgentBuilderToolsService, PluginToolsService],
  exports: [AgentBuilderToolsService, PluginToolsService],
})
export class AgentsPluginModule {}
