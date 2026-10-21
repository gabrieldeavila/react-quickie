import type { InstructionSummary } from "./instruction.types";

/** Message-box chip: "Instructions", "Forms", or "Forms +2". */
export function instructionsChipLabel(selected: InstructionSummary[]): string {
  if (selected.length === 0) return "Instructions";
  const [first, ...rest] = selected;
  return rest.length ? `${first.name} +${rest.length}` : first.name;
}
