import { createHash } from 'crypto';

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Key-order-independent hash, so reordering a JSON file doesn't reconnect. */
export function hashConfig(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

export function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}
