import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import type {
  Instruction,
  InstructionInput,
  InstructionScope,
} from '../domain/instruction.types';
import { mergeInstructions } from '../domain/merge-instructions';
import { serializeInstruction } from '../domain/serialize-instruction';
import { isValidInstructionId } from '../domain/validate-instruction-id';
import { InstructionFiles } from './instruction-files';
import { writeFileAtomic } from './write-file-atomic';

export const PROJECT_INSTRUCTIONS_DIR = path.join('.doty', 'instructions');

/**
 * Instructions from three folders, merged by id (project > global > built-in):
 * - built-in: shipped with the API, read-only
 * - global: `<DOTY_DATA_DIR>/instructions/` (default `~/.doty/instructions/`)
 * - project: `<root>/.doty/instructions/`, through the workspace sandbox
 *
 * Security: project instructions are prompt text from the repository, as
 * trusted as its `AGENTS.md`. They can't run anything by themselves, and the
 * UI shows where each one comes from.
 */
@Injectable()
export class InstructionsRepository {
  private readonly files = new InstructionFiles();

  constructor(private readonly workspaceService: WorkspaceService) {}

  async list(root?: string): Promise<Instruction[]> {
    const { builtinInstructionsDir, globalInstructionsDir } = getAppPaths();
    const [builtIns, global, project] = await Promise.all([
      this.files.readDir(builtinInstructionsDir, 'built-in'),
      this.files.readDir(globalInstructionsDir, 'global'),
      root
        ? this.files.readDir(this.projectDir(root), 'project')
        : Promise.resolve([]),
    ]);
    return mergeInstructions(builtIns, global, project);
  }

  async get(id: string, root?: string): Promise<Instruction | undefined> {
    return (await this.list(root)).find((item) => item.id === id);
  }

  /** Creates or replaces `<scope folder>/<id>.md`; returns what was written. */
  async write(
    scope: InstructionScope,
    id: string,
    input: InstructionInput,
    root?: string,
  ): Promise<Instruction> {
    await writeFileAtomic(
      this.filePath(scope, id, root),
      serializeInstruction(input),
    );
    return { id, ...input, source: scope };
  }

  /** Deletes the scope's file; false when it didn't exist. */
  async remove(
    scope: InstructionScope,
    id: string,
    root?: string,
  ): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(scope, id, root));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw error;
    }
  }

  private filePath(
    scope: InstructionScope,
    id: string,
    root: string | undefined,
  ): string {
    if (!isValidInstructionId(id)) {
      throw new Error(`Invalid instruction id: "${id}".`);
    }
    const file = `${id}.md`;
    if (scope === 'global') {
      return path.join(getAppPaths().globalInstructionsDir, file);
    }
    if (!root) throw new Error('Project instructions need a project root.');
    return this.workspaceService.resolveIn(
      root,
      path.join(PROJECT_INSTRUCTIONS_DIR, file),
    );
  }

  private projectDir(root: string): string {
    return this.workspaceService.resolveIn(root, PROJECT_INSTRUCTIONS_DIR);
  }
}
