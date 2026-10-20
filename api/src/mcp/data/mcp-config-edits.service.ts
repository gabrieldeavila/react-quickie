import { Injectable } from '@nestjs/common';
import { hashText } from '../domain/hash-config';
import { McpConfigConflictError } from '../domain/mcp-config-conflict.error';
import { McpConfigUntrustedError } from '../domain/mcp-config-untrusted.error';
import { readRawServers } from '../domain/read-raw-servers';
import { mergeMaskedSecrets } from '../domain/merge-masked-secrets';
import {
  isUsableServer,
  type McpConfigSource,
} from '../domain/mcp-server.types';
import { removeMcpServer } from '../domain/remove-mcp-server';
import { setMcpServerDisabled } from '../domain/set-mcp-server-disabled';
import { setMcpToolApproval } from '../domain/set-mcp-tool-approval';
import { upsertMcpServer } from '../domain/upsert-mcp-server';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpConfigRepository } from './mcp-config.repository';
import { McpServersService } from './mcp-servers.service';
import { McpTrustRepository } from './mcp-trust.repository';

/** The file hash the client last saw; null = "the file didn't exist". */
type BaseHash = string | null | undefined;

export type McpServerPatch = {
  disabled?: boolean;
  toolApproval?: unknown;
};

/**
 * Edits one scope's `mcp.json` on behalf of the user: checks the client's
 * base hash, writes atomically, re-trusts a project file the user just
 * wrote, and reconnects (or closes) only the server that changed.
 */
@Injectable()
export class McpConfigEditsService {
  constructor(
    private readonly configRepository: McpConfigRepository,
    private readonly trustRepository: McpTrustRepository,
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
  ) {}

  async upsert(
    root: string,
    scope: McpConfigSource,
    name: string,
    config: unknown,
    baseHash: BaseHash,
  ): Promise<void> {
    await this.apply(root, scope, name, baseHash, (text) => {
      // Masked secrets come back unchanged; restore them from the same entry.
      const stored = readRawServers(text)[name];
      return upsertMcpServer(text, name, mergeMaskedSecrets(config, stored));
    });
  }

  async remove(
    root: string,
    scope: McpConfigSource,
    name: string,
    baseHash: BaseHash,
  ): Promise<void> {
    await this.apply(root, scope, name, baseHash, (text) =>
      removeMcpServer(text, name),
    );
  }

  async patch(
    root: string,
    scope: McpConfigSource,
    name: string,
    patch: McpServerPatch,
    baseHash: BaseHash,
  ): Promise<void> {
    // The controller rejects a patch with neither field.
    await this.apply(root, scope, name, baseHash, (text) => {
      let next = text;
      if (patch.disabled !== undefined) {
        next = setMcpServerDisabled(next, name, patch.disabled);
      }
      if (patch.toolApproval !== undefined) {
        next = setMcpToolApproval(next, name, patch.toolApproval);
      }
      return next ?? '';
    });
  }

  private async apply(
    root: string,
    scope: McpConfigSource,
    name: string,
    baseHash: BaseHash,
    edit: (text: string | null) => string,
  ): Promise<void> {
    const filePath = this.configRepository.pathFor(scope, root);
    const current = await this.configRepository.read(filePath);
    if (baseHash !== undefined && (current?.hash ?? null) !== baseHash) {
      throw new McpConfigConflictError();
    }
    if (
      scope === 'project' &&
      current &&
      !(await this.trustRepository.isTrusted(filePath, current.hash))
    ) {
      throw new McpConfigUntrustedError();
    }

    const next = edit(current?.text ?? null);
    await this.configRepository.write(scope, filePath, next);
    // The user wrote this content through Doty: that is consent, so the
    // project servers stay on. Edits made outside Doty still revoke trust.
    if (scope === 'project') {
      await this.trustRepository.trust(filePath, hashText(next));
    }
    await this.refreshConnection(root, name);
  }

  /** Closes the old client; connects again in the background if still active. */
  private async refreshConnection(root: string, name: string): Promise<void> {
    await this.pool.disconnect(root, name);
    const { active } = await this.serversService.resolve(root);
    const server = active.find((candidate) => candidate.name === name);
    if (server && isUsableServer(server)) {
      void this.pool.getTools(root, server);
    }
  }
}
