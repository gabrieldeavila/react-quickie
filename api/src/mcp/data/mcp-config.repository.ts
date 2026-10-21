import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import { writeFileAtomic } from 'src/common/fs/write-file-atomic';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { hashText } from '../domain/hash-config';
import type { McpConfigSource } from '../domain/mcp-server.types';

export const MCP_CONFIG_FILE = 'mcp.json';
export const PROJECT_MCP_CONFIG = path.join('.doty', MCP_CONFIG_FILE);

export type McpConfigFile = { path: string; text: string; hash: string };

type CacheEntry = { mtimeMs: number; size: number; file: McpConfigFile };

@Injectable()
export class McpConfigRepository {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly workspaceService: WorkspaceService) {}

  /** `<DOTY_DATA_DIR>/mcp.json` (default `~/.doty/mcp.json`). */
  globalPath(): string {
    return path.join(getAppPaths().storageDir, MCP_CONFIG_FILE);
  }

  /** `<root>/.doty/mcp.json`, resolved through the workspace sandbox. */
  projectPath(root: string): string {
    return this.workspaceService.resolveIn(root, PROJECT_MCP_CONFIG);
  }

  pathFor(scope: McpConfigSource, root: string): string {
    return scope === 'global' ? this.globalPath() : this.projectPath(root);
  }

  /**
   * Atomic write. The global file may hold tokens, so it is owner-only
   * (0o600); the project file keeps the default mode (it may be committed).
   */
  async write(
    scope: McpConfigSource,
    filePath: string,
    text: string,
  ): Promise<void> {
    await writeFileAtomic(
      filePath,
      text,
      scope === 'global' ? 0o600 : undefined,
    );
    this.cache.delete(filePath);
  }

  /** The file's text and hash, or null when it doesn't exist. Cached by mtime. */
  async read(filePath: string): Promise<McpConfigFile | null> {
    const stat = await fs
      .stat(filePath)
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
    if (!stat) {
      this.cache.delete(filePath);
      return null;
    }

    const cached = this.cache.get(filePath);
    if (cached?.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return cached.file;
    }

    const text = await fs.readFile(filePath, 'utf8');
    const file = { path: filePath, text, hash: hashText(text) };
    this.cache.set(filePath, { mtimeMs: stat.mtimeMs, size: stat.size, file });
    return file;
  }
}
