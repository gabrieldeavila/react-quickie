import { Module } from '@nestjs/common';
import { McpClientPoolService } from './data/mcp-client-pool.service';
import { McpConfigEditsService } from './data/mcp-config-edits.service';
import { McpConfigRepository } from './data/mcp-config.repository';
import { McpConnectionCheckService } from './data/mcp-connection-check.service';
import { McpOAuthProviderFactory } from './data/mcp-oauth-provider.factory';
import { McpOAuthRepository } from './data/mcp-oauth.repository';
import { McpOAuthService } from './data/mcp-oauth.service';
import { McpServerCatalogService } from './data/mcp-server-catalog.service';
import { McpSignInRequestsService } from './data/mcp-sign-in-requests.service';
import { McpServersService } from './data/mcp-servers.service';
import { McpSetupToolsService } from './data/mcp-setup-tools.service';
import { McpToolsService } from './data/mcp-tools.service';
import { McpTrustRepository } from './data/mcp-trust.repository';
import { OAuthCallbackListener } from './data/oauth-callback-listener';
import { McpController } from './delivery/mcp.controller';
import { McpOAuthController } from './delivery/mcp-oauth.controller';
import { McpSignInController } from './delivery/mcp-sign-in.controller';

@Module({
  controllers: [McpController, McpOAuthController, McpSignInController],
  providers: [
    McpConfigRepository,
    McpTrustRepository,
    McpServersService,
    McpClientPoolService,
    McpToolsService,
    McpConfigEditsService,
    McpServerCatalogService,
    McpSetupToolsService,
    McpOAuthRepository,
    McpOAuthProviderFactory,
    McpOAuthService,
    McpSignInRequestsService,
    McpConnectionCheckService,
    OAuthCallbackListener,
  ],
  exports: [McpToolsService, McpSetupToolsService],
})
export class McpModule {}
