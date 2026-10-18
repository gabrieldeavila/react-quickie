import { RUN_SUBAGENT_PART } from "./legacy-subagent";

type PartLike = { type: string; state?: unknown; output?: unknown };

/**
 * The subagent's step list is for display only: the API gives the parent
 * model just the final answer. Dropping it keeps requests small and keeps
 * that answer out of reach of `truncateToolOutputs`, which would otherwise
 * cut a long step list before the text.
 */
export function compactSubagentOutput<T extends PartLike>(part: T): T {
  if (part.type !== RUN_SUBAGENT_PART || part.state !== "output-available") {
    return part;
  }
  const output = part.output;
  if (!output || typeof output !== "object" || !("steps" in output)) {
    return part;
  }
  const compact = Object.fromEntries(
    Object.entries(output).filter(([key]) => key !== "steps"),
  );
  return { ...part, output: compact };
}
