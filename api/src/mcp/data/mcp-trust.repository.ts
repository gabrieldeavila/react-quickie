import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';

const TRUST_FILE = 'trusted-mcp.json';

/** Absolute project config path → sha256 of the content the user trusted. */
type TrustStore = Record<string, string>;

/**
 * A project `mcp.json` can spawn arbitrary commands, so its servers stay off
 * until the user trusts that exact content. Editing the file revokes trust.
 */
@Injectable()
export class McpTrustRepository {
  private filePath(): string {
    return path.join(getAppPaths().storageDir, TRUST_FILE);
  }

  private async load(): Promise<TrustStore> {
    try {
      const parsed = JSON.parse(
        await fs.readFile(this.filePath(), 'utf8'),
      ) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as TrustStore) : {};
    } catch {
      return {};
    }
  }

  async isTrusted(configPath: string, hash: string): Promise<boolean> {
    return (await this.load())[configPath] === hash;
  }

  async trust(configPath: string, hash: string): Promise<void> {
    const store = { ...(await this.load()), [configPath]: hash };
    const file = this.filePath();
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(store, null, 2), { mode: 0o600 });
  }
}
