import type { Instruction } from './instruction.types';
import { MAX_SELECTED_INSTRUCTIONS } from './instruction-limits';

export type InstructionSelection = {
  /** In the order requested, without duplicates, at most the limit. */
  selected: Instruction[];
  unknownIds: string[];
};

/** The requested ids resolved against the available instructions. */
export function selectInstructions(
  available: Instruction[],
  requestedIds: string[],
  limit = MAX_SELECTED_INSTRUCTIONS,
): InstructionSelection {
  const byId = new Map(available.map((item) => [item.id, item]));
  const selected: Instruction[] = [];
  const unknownIds: string[] = [];

  for (const id of new Set(requestedIds)) {
    const instruction = byId.get(id);
    if (!instruction) unknownIds.push(id);
    else if (selected.length < limit) selected.push(instruction);
  }
  return { selected, unknownIds };
}
