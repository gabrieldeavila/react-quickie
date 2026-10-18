import { Module } from '@nestjs/common';
import { ChatController } from './delivery/chat.controller';
import { ChatService } from './chat.service';
import { HelperModule } from 'src/common/helpers/helpers.module';
import { AgentsModule } from 'src/common/agents/agents.module';
import { AgentsPluginModule } from 'src/common/agents/plugin/tools/agent.plugins.module';
import { ChatStreamService } from './data/chat-stream.service';
import { ApprovalSecretService } from './data/approval-secret.service';
import { ContextCompactionService } from './data/context-compaction.service';
import { LlmModule } from 'src/llm/llm.module';
import { McpModule } from 'src/mcp/mcp.module';
import { SubagentsModule } from 'src/subagents/subagents.module';

@Module({
  imports: [
    HelperModule,
    AgentsModule,
    AgentsPluginModule,
    LlmModule,
    McpModule,
    SubagentsModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatStreamService,
    ApprovalSecretService,
    ContextCompactionService,
  ],
})
export class ChatModule {}
