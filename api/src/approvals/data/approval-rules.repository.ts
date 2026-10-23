import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import { writeFileAtomic } from 'src/common/fs/write-file-atomic';
import { toRealPath } from 'src/workspace/data/to-real-path';
import { EMPTY_APPROVAL_RULES } from '../domain/approval-rule.types';
import {
  addApprovalRule,
  removeApprovalRule,
  type ApprovalRuleTarget,
} from '../domain/edit-approval-rules';
import {
  parseApprovalRules,
  type ParsedApprovalRules,
} from '../domain/parse-approval-rules';

export const APPROVAL_RULES_FILE = 'approval-rules.json';

type CacheEntry = {
  mtimeMs: number;
  size: number;
  parsed: ParsedApprovalRules;
};

/**
 * The user's "Always allow" rules. Kept in Doty's data dir, never in the
 * project (a cloned repo must not approve for the user), and written only by
 * UI endpoints: no agent tool reads or edits this file.
 */
@Injectable()
export class ApprovalRulesRepository {
  private readonly logger = new Logger(ApprovalRulesRepository.name);
  private cache?: CacheEntry;
  private writes: Promise<unknown> = Promise.resolve();

  /** `<DOTY_DATA_DIR>/approval-rules.json` (default `~/.doty/`). */
  filePath(): string {
    return path.join(getAppPaths().storageDir, APPROVAL_RULES_FILE);
  }

  /** Project rules are keyed by the real path, so symlinks share rules. */
  projectKey(root: string): string {
    return toRealPath(root);
  }

  /** The rules, cached by mtime. A broken file reads as no rules (logged once). */
  async read(): Promise<ParsedApprovalRules> {
    const file = this.filePath();
    const stat = await fs.stat(file).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!stat) {
      this.cache = undefined;
      return { rules: EMPTY_APPROVAL_RULES };
    }
    if (this.cache?.mtimeMs === stat.mtimeMs && this.cache.size === stat.size) {
      return this.cache.parsed;
    }

    const parsed = parseApprovalRules(await fs.readFile(file, 'utf8'));
    if (parsed.error) this.logger.warn(`${file}: ${parsed.error} Ignoring it.`);
    this.cache = { mtimeMs: stat.mtimeMs, size: stat.size, parsed };
    return parsed;
  }

  add(target: ApprovalRuleTarget): Promise<void> {
    return this.edit((rules) =>
      addApprovalRule(rules, this.resolve(target), new Date().toISOString()),
    );
  }

  remove(target: ApprovalRuleTarget): Promise<void> {
    return this.edit((rules) =>
      removeApprovalRule(rules, this.resolve(target)),
    );
  }

  private resolve(target: ApprovalRuleTarget): ApprovalRuleTarget {
    return target.root
      ? { ...target, root: this.projectKey(target.root) }
      : target;
  }

  /** Read-modify-write, one at a time. A broken file is never overwritten. */
  private edit(
    change: (
      rules: ParsedApprovalRules['rules'],
    ) => ParsedApprovalRules['rules'],
  ): Promise<void> {
    const run = this.writes.then(async () => {
      const { rules, error } = await this.read();
      if (error) {
        throw new Error(
          `${this.filePath()} is invalid (${error}) Fix or delete it first.`,
        );
      }
      const next = change(rules);
      if (next === rules) return;
      await writeFileAtomic(
        this.filePath(),
        `${JSON.stringify(next, null, 2)}\n`,
        0o600,
      );
      this.cache = undefined;
    });
    this.writes = run.catch(() => undefined);
    return run;
  }
}
