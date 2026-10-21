import { Injectable } from '@nestjs/common';
import { buildServerViews } from '../domain/build-server-views';
import {
  toEditableViews,
  type EditableMcpServerView,
} from '../domain/to-editable-views';
import { isUsableServer } from '../domain/mcp-server.types';
import { McpClientPoolService } from './mcp-client-pool.service';
import {
  isHttpServer,
  McpOAuthProviderFactory,
} from './mcp-oauth-provider.factory';
import {
  McpServersService,
  type McpConfigFileView,
  type ResolvedMcpServers,
} from './mcp-servers.service';

export type McpServerCatalog = {
  globalConfig: McpConfigFileView;
  projectConfig: ResolvedMcpServers['projectConfig'];
  /** Status, tools, scope and the entry with literal secrets masked. */
  servers: EditableMcpServerView[];
};

/** Every configured server with its live status, for the dialog and the agent. */
@Injectable()
export class McpServerCatalogService {
  constructor(
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
    private readonly oauthProviders: McpOAuthProviderFactory,
  ) {}

  async list(root: string): Promise<McpServerCatalog> {
    const { active, untrusted, globalConfig, projectConfig, raw } =
      await this.serversService.resolve(root);
    const views = buildServerViews(active, untrusted, (server) =>
      this.pool.snapshot(root, server),
    );
    const signedIn = await this.signedInServers(root, active);
    return {
      globalConfig,
      projectConfig,
      servers: toEditableViews(views, raw).map((view) =>
        view.status === 'untrusted'
          ? view
          : { ...view, signedIn: signedIn.has(view.name) },
      ),
    };
  }

  /** Names of the active http/sse servers Doty holds OAuth tokens for. */
  private async signedInServers(
    root: string,
    active: ResolvedMcpServers['active'],
  ): Promise<Set<string>> {
    const checks = await Promise.all(
      active
        .filter(isUsableServer)
        .filter(isHttpServer)
        .map(async (server) =>
          (await this.oauthProviders.isSignedIn(root, server))
            ? server.name
            : undefined,
        ),
    );
    return new Set(checks.filter((name): name is string => !!name));
  }
}
