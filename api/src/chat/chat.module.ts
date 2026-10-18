import { Module } from '@nestjs/common';
import { ChatController } from './delivery/chat.controller';
import { ChatService } from './chat.service';
import { HelperModule } from 'src/common/helpers/helpers.module';
import { AgentsModule } from 'src/common/agents/agents.module';
import { AgentsPluginModule } from 'src/common/agents/plugin/tools/agent.plugins.module';
import { SubagentService } from './subagent.service';
import { ChatStreamService } from './data/chat-stream.service';
import { ApprovalSecretService } from './data/approval-secret.service';
import { LlmModule } from 'src/llm/llm.module';

@Module({
  imports: [HelperModule, AgentsModule, AgentsPluginModule, LlmModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    SubagentService,
    ChatStreamService,
    ApprovalSecretService,
  ],
})
export class ChatModule {}
