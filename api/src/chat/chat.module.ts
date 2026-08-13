import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { HelperModule } from 'src/common/helpers/helpers.module';
import { AgentsModule } from 'src/common/agents/agents.module';

@Module({
  imports: [HelperModule, AgentsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
