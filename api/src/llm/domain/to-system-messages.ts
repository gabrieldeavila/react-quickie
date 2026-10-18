import type { Instructions, SystemModelMessage } from 'ai';

/** Any `Instructions` form as a list of system messages. */
export function toSystemMessages(
  instructions: Instructions | undefined,
): SystemModelMessage[] {
  if (instructions === undefined) return [];
  if (typeof instructions === 'string') {
    return [{ role: 'system', content: instructions }];
  }
  return Array.isArray(instructions) ? instructions : [instructions];
}
