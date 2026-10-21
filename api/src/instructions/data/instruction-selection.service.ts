import { Injectable, Logger } from '@nestjs/common';
import type { Instruction } from '../domain/instruction.types';
import { selectInstructions } from '../domain/select-instructions';
import { InstructionsRepository } from './instructions.repository';

/** Resolves the instructions a chat request selected. */
@Injectable()
export class InstructionSelectionService {
  private readonly logger = new Logger(InstructionSelectionService.name);
  private readonly reportedUnknown = new Set<string>();

  constructor(private readonly repository: InstructionsRepository) {}

  /** Unknown ids are ignored and logged once per id. */
  async resolve(
    ids: string[] | undefined,
    root: string | undefined,
  ): Promise<Instruction[]> {
    if (!ids?.length) return [];
    const { selected, unknownIds } = selectInstructions(
      await this.repository.list(root),
      ids,
    );
    this.reportUnknown(unknownIds);
    return selected;
  }

  private reportUnknown(ids: string[]) {
    const fresh = ids.filter((id) => !this.reportedUnknown.has(id));
    if (!fresh.length) return;
    fresh.forEach((id) => this.reportedUnknown.add(id));
    this.logger.warn(`Ignored unknown instructions: ${fresh.join(', ')}`);
  }
}
