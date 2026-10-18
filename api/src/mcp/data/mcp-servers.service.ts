import { Injectable } from '@nestjs/common';
import { mergeMcpConfigs } from '../domain/merge-mcp-configs';
import type { ParsedMcpServer } from '../domain/mcp-server.types';
import {
  parseMcpConfig,
  type ParsedMcpConfig,
} from '../domain/parse-mcp-config';
import {
  McpConfigRepository,
  type McpConfigFile,
} from './mcp-config.repository';
import { McpTrustRepository } from './mcp-trust.repository';

export type McpConfigFileView = {
  path: string;
  exists: boolean;
  error?: string;
};

export type ResolvedMcpServers = {
  /** Global servers plus, when trusted, the project's (project wins by name). */
  active: ParsedMcpServer[];
  /** Project servers waiting for trust. Never connected. */
  untrusted: ParsedMcpServer[];
  globalConfig: McpConfigFileView;
  projectConfig: McpConfigFileView & { trusted: boolean; hash?: string };
};

const EMPTY: ParsedMcpConfig = { servers: [] };

@Injectable()
export class McpServersService {
  constructor(
    private readonly configRepository: McpConfigRepository,
    private readonly trustRepository: McpTrustRepository,
  ) {}

  async resolve(root: string): Promise<ResolvedMcpServers> {
    const globalPath = this.configRepository.globalPath();
    const projectPath = this.configRepository.projectPath(root);
    const [globalFile, projectFile] = await Promise.all([
      this.configRepository.read(globalPath),
      this.configRepository.read(projectPath),
    ]);

    const global = this.parse(globalFile, 'global');
    const project = this.parse(projectFile, 'project');
    const trusted = projectFile
      ? await this.trustRepository.isTrusted(projectFile.path, projectFile.hash)
      : false;

    return {
      active: mergeMcpConfigs(global.servers, trusted ? project.servers : []),
      untrusted: trusted ? [] : project.servers,
      globalConfig: {
        path: globalPath,
        exists: !!globalFile,
        error: global.error,
      },
      projectConfig: {
        path: projectPath,
        exists: !!projectFile,
        error: project.error,
        trusted,
        hash: projectFile?.hash,
      },
    };
  }

  /**
   * Trusts the project config, but only the content the user reviewed:
   * `hash` must match the file as it is now.
   */
  async trustProject(
    root: string,
    hash: string,
  ): Promise<'trusted' | 'missing' | 'changed'> {
    const file = await this.configRepository.read(
      this.configRepository.projectPath(root),
    );
    if (!file) return 'missing';
    if (file.hash !== hash) return 'changed';

    await this.trustRepository.trust(file.path, file.hash);
    return 'trusted';
  }

  private parse(
    file: McpConfigFile | null,
    source: 'global' | 'project',
  ): ParsedMcpConfig {
    if (!file) return EMPTY;
    return parseMcpConfig(file.text, { source, env: process.env });
  }
}
