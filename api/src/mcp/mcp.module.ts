import { Module } from '@nestjs/common';
import { McpClientPoolService } from './data/mcp-client-pool.service';
import { McpConfigRepository } from './data/mcp-config.repository';
import { McpServersService } from './data/mcp-servers.service';
import { McpToolsService } from './data/mcp-tools.service';
import { McpTrustRepository } from './data/mcp-trust.repository';
import { McpController } from './delivery/mcp.controller';

@Module({
  controllers: [McpController],
  providers: [
    McpConfigRepository,
    McpTrustRepository,
    McpServersService,
    McpClientPoolService,
    McpToolsService,
  ],
  exports: [McpToolsService],
})
export class McpModule {}
