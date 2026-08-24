import { Module } from '@nestjs/common';
import { AgentBuilderToolsService } from './agent_builder/tool.service';
import { PluginToolsService } from './tools.plugins.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AgentBuilderToolsService, PluginToolsService],
  exports: [AgentBuilderToolsService, PluginToolsService],
})
export class AgentsPluginModule {}
