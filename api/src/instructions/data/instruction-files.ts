import { Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import type {
  Instruction,
  InstructionSource,
} from '../domain/instruction.types';
import { parseInstruction } from '../domain/parse-instruction';
import { isValidInstructionId } from '../domain/validate-instruction-id';

type CacheEntry = { mtimeMs: number; size: number; instruction: Instruction };

function isMissing(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

/** `<id>.md` → id, or null for other files and ids that aren't valid. */
function toInstructionId(fileName: string): string | null {
  if (!fileName.endsWith('.md')) return null;
  const id = fileName.slice(0, -'.md'.length);
  return isValidInstructionId(id) ? id : null;
}

/** Reads a folder of instruction files; each file is cached by mtime and size. */
export class InstructionFiles {
  private readonly logger = new Logger(InstructionFiles.name);
  private readonly cache = new Map<string, CacheEntry>();

  async readDir(
    dir: string,
    source: InstructionSource,
  ): Promise<Instruction[]> {
    let names: string[];
    try {
      names = await fs.readdir(dir);
    } catch (error) {
      if (!isMissing(error)) this.warn(dir, error);
      return [];
    }

    const entries = names
      .sort()
      .map((name) => [name, toInstructionId(name)] as const)
      .filter((entry): entry is [string, string] => entry[1] !== null);
    const parsed = await Promise.all(
      entries.map(([name, id]) =>
        this.readFile(path.join(dir, name), id, source),
      ),
    );
    return parsed.filter((item): item is Instruction => item !== null);
  }

  /** An unreadable or invalid file only drops that instruction. */
  private async readFile(
    file: string,
    id: string,
    source: InstructionSource,
  ): Promise<Instruction | null> {
    try {
      const stat = await fs.stat(file);
      const cached = this.cache.get(file);
      if (
        cached?.mtimeMs === stat.mtimeMs &&
        cached.size === stat.size &&
        cached.instruction.source === source
      ) {
        return cached.instruction;
      }

      const raw = await fs.readFile(file, 'utf8');
      const instruction = parseInstruction(raw, id, source);
      this.cache.set(file, {
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        instruction,
      });
      return instruction;
    } catch (error) {
      this.cache.delete(file);
      if (!isMissing(error)) this.warn(file, error);
      return null;
    }
  }

  private warn(location: string, error: unknown) {
    this.logger.warn(
      `Skipped instruction (${location}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
