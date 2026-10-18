// Before Phase 4, `run_subagent` took `{ name, task, context }`. The API now
// validates history against `{ agent, task, context }`, so old calls are
// renamed on the way out. Their result stays in history for the model.

export const RUN_SUBAGENT_PART = "tool-run_subagent";

type PartLike = { type: string; input?: unknown; [key: string]: unknown };

/** An old `run_subagent` call: input has `name` and no `agent`. */
export function isLegacySubagentPart(part: PartLike): boolean {
  if (part.type !== RUN_SUBAGENT_PART) return false;
  const input = part.input as Record<string, unknown> | undefined;
  return typeof input?.name === "string" && input.agent === undefined;
}

export function migrateLegacySubagentPart<T extends PartLike>(part: T): T {
  if (!isLegacySubagentPart(part)) return part;
  const { name, ...rest } = part.input as Record<string, unknown>;
  return { ...part, input: { ...rest, agent: name } };
}
