import type { InstructionSummary } from "./instruction.types";

/** Case-insensitive match on name, id and description. */
export function filterInstructions(
  instructions: InstructionSummary[],
  query: string,
): InstructionSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return instructions;
  return instructions.filter(({ id, name, description }) =>
    [id, name, description].some((text) => text.toLowerCase().includes(needle)),
  );
}
