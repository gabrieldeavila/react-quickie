import { Injectable } from '@nestjs/common';
import { buildServerViews } from '../domain/build-server-views';
import {
  toEditableViews,
  type EditableMcpServerView,
} from '../domain/to-editable-views';
import { McpClientPoolService } from './mcp-client-pool.service';
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
  ) {}

  async list(root: string): Promise<McpServerCatalog> {
    const { active, untrusted, globalConfig, projectConfig, raw } =
      await this.serversService.resolve(root);
    const views = buildServerViews(active, untrusted, (server) =>
      this.pool.snapshot(root, server),
    );
    return {
      globalConfig,
      projectConfig,
      servers: toEditableViews(views, raw),
    };
  }
}
