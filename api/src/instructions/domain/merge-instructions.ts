import type { Instruction } from './instruction.types';

/**
 * Built-in, global and project instructions merged by id: project wins over
 * global, global over built-in. Each entry keeps the `source` it came from.
 * Sorted by name, then id.
 */
export function mergeInstructions(
  builtIns: Instruction[],
  global: Instruction[],
  project: Instruction[],
): Instruction[] {
  const byId = new Map<string, Instruction>();
  for (const instruction of [...builtIns, ...global, ...project]) {
    byId.set(instruction.id, instruction);
  }
  return [...byId.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}
