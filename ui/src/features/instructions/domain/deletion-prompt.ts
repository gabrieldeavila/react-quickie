import type { InstructionSummary } from "./instruction.types";

/** The question asked before deleting a global or project instruction. */
export function deletionPrompt(
  item: Pick<InstructionSummary, "name" | "source">,
) {
  return {
    message: `Delete the ${item.source} instruction "${item.name}"?`,
    confirmLabel: "Delete",
  };
}
