import { Module } from '@nestjs/common';
import { FrontendToolsService } from './tools/frontend/tool.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FrontendToolsService],
  exports: [FrontendToolsService],
})
export class AgentsModule {}
