import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import { writeFileAtomic } from 'src/common/fs/write-file-atomic';
import type { McpOAuthRecord } from '../domain/mcp-oauth.types';

type Records = Record<string, McpOAuthRecord>;

const FILE_NAME = 'mcp-oauth.json';

/**
 * OAuth tokens and sign-in state per MCP server, in
 * `<DOTY_DATA_DIR>/mcp-oauth.json` (owner-only, like the global mcp.json).
 * Writes are queued so concurrent updates don't drop each other.
 */
@Injectable()
export class McpOAuthRepository {
  private queue: Promise<unknown> = Promise.resolve();

  async get(key: string): Promise<McpOAuthRecord> {
    return (await this.readAll())[key] ?? {};
  }

  /** Applies `change` to the stored record; an empty result deletes it. */
  update(
    key: string,
    change: (record: McpOAuthRecord) => McpOAuthRecord,
  ): Promise<void> {
    const run = this.queue.then(async () => {
      const records = await this.readAll();
      const next = change(records[key] ?? {});
      if (Object.keys(next).length) records[key] = next;
      else delete records[key];
      await writeFileAtomic(
        this.filePath(),
        `${JSON.stringify(records, null, 2)}\n`,
        0o600,
      );
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  remove(key: string): Promise<void> {
    return this.update(key, () => ({}));
  }

  private async readAll(): Promise<Records> {
    try {
      const parsed: unknown = JSON.parse(
        await fs.readFile(this.filePath(), 'utf8'),
      );
      return parsed && typeof parsed === 'object' ? (parsed as Records) : {};
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
      throw error;
    }
  }

  private filePath(): string {
    return path.join(getAppPaths().storageDir, FILE_NAME);
  }
}
