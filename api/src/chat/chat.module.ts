import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { HelperModule } from 'src/common/helpers/helpers.module';
import { AgentsModule } from 'src/common/agents/agents.module';
import { AgentsPluginModule } from 'src/common/agents/plugin/tools/agent.plugins.module';

@Module({
  imports: [HelperModule, AgentsModule, AgentsPluginModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
