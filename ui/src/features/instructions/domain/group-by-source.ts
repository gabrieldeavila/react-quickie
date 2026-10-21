import type { InstructionSource, InstructionSummary } from "./instruction.types";

export type InstructionGroup = {
  source: InstructionSource;
  label: string;
  instructions: InstructionSummary[];
};

const GROUPS: Array<Pick<InstructionGroup, "source" | "label">> = [
  { source: "project", label: "Project" },
  { source: "global", label: "Global" },
  { source: "built-in", label: "Built-in" },
];

/** The manage dialog's sections: project, global, built-in; empty ones left out. */
export function groupBySource(
  instructions: InstructionSummary[],
): InstructionGroup[] {
  return GROUPS.map((group) => ({
    ...group,
    instructions: instructions.filter((item) => item.source === group.source),
  })).filter((group) => group.instructions.length > 0);
}
