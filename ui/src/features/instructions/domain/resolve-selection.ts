import type { InstructionSummary } from "./instruction.types";

/** The selected ids that still exist, as summaries, in selection order. */
export function resolveSelection(
  available: InstructionSummary[],
  selectedIds: string[],
): InstructionSummary[] {
  const byId = new Map(available.map((item) => [item.id, item]));
  return selectedIds.flatMap((id) => {
    const instruction = byId.get(id);
    return instruction ? [instruction] : [];
  });
}
