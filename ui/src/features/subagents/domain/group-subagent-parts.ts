const RUN_SUBAGENT_PART = "tool-run_subagent";

export type IndexedPart<T> = { part: T; index: number };

export type PartGroup<T> =
  | { kind: "part"; part: T; index: number }
  | { kind: "subagents"; items: IndexedPart<T>[] };

export function isSubagentPart(part: { type: string }): boolean {
  return part.type === RUN_SUBAGENT_PART;
}

/**
 * Consecutive `run_subagent` parts (parallel calls from one step) become one
 * group so they render together. Every other part stays on its own.
 */
export function groupSubagentParts<T extends { type: string }>(
  parts: readonly T[],
): PartGroup<T>[] {
  const groups: PartGroup<T>[] = [];
  parts.forEach((part, index) => {
    const last = groups[groups.length - 1];
    if (!isSubagentPart(part)) {
      groups.push({ kind: "part", part, index });
    } else if (last?.kind === "subagents") {
      last.items.push({ part, index });
    } else {
      groups.push({ kind: "subagents", items: [{ part, index }] });
    }
  });
  return groups;
}
